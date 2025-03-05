// src/common/concurrency/worker-pool.ts
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import * as path from 'path';
import { Semaphore } from './semaphore';

export class WorkerPool {
  private workers: Worker[] = [];
  private semaphore: Semaphore;
  private taskQueue: {
    task: Function | string;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    data?: any;
  }[] = [];
  private isProcessing: boolean = false;

  constructor(private numWorkers: number = 4) {
    this.semaphore = new Semaphore(numWorkers);
    // No crear workers inmediatamente - serán creados bajo demanda
  }

  private createWorkerForTask(taskFn: Function | string, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let workerScript: string;
      
      if (typeof taskFn === 'function') {
        // Si es una función, convertirla a string para enviarla al worker
        workerScript = `
          const { parentPort, workerData } = require('worker_threads');
          
          // Función definida dinámicamente
          const taskFn = ${taskFn.toString()};
          
          // Ejecutar la tarea con los datos proporcionados
          Promise.resolve(taskFn(workerData))
            .then(result => {
              parentPort.postMessage({ success: true, result });
            })
            .catch(error => {
              parentPort.postMessage({ 
                success: false, 
                error: { message: error.message, stack: error.stack } 
              });
            });
        `;
      } else if (typeof taskFn === 'string') {
        // Si es un path a un script, usarlo directamente
        workerScript = taskFn;
      } else {
        reject(new Error('Invalid task. Must be a function or path to a script.'));
        return;
      }

      // Para funciones, crear un archivo temporal
      let worker: Worker;
      
      if (typeof taskFn === 'function') {
        // Crear worker en memoria con eval
        worker = new Worker(
          `
          const { parentPort, workerData } = require('worker_threads');
          const vm = require('vm');
          
          // Ejecutar el script en un contexto aislado
          const scriptContext = { 
            require, 
            parentPort, 
            workerData,
            console,
            setTimeout,
            clearTimeout,
            setInterval,
            clearInterval,
            process
          };
          
          vm.runInNewContext(workerData.script, scriptContext);
          `,
          { 
            eval: true,
            workerData: {
              script: workerScript,
              data: data
            }
          }
        );
      } else {
        // Usar el path directamente
        worker = new Worker(workerScript, { 
          workerData: data 
        });
      }

      // Manejar la respuesta del worker
      worker.on('message', (message) => {
        if (message.success) {
          resolve(message.result);
        } else {
          reject(new Error(message.error.message));
        }
        worker.terminate();
      });

      worker.on('error', (err) => {
        reject(err);
        worker.terminate();
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });

      this.workers.push(worker);
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.taskQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.taskQueue.length > 0) {
      const release = await this.semaphore.acquire();
      const nextTask = this.taskQueue.shift();
      
      if (!nextTask) {
        release();
        continue;
      }
      
      // Ejecutar la tarea en un worker
      this.createWorkerForTask(nextTask.task, nextTask.data)
        .then(result => {
          nextTask.resolve(result);
          release();
        })
        .catch(error => {
          nextTask.reject(error);
          release();
        });
    }
    
    this.isProcessing = false;
  }

  // Ejecutar una tarea en un worker
  async runTask<T>(taskFn: Function | string, data?: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.taskQueue.push({
        task: taskFn,
        resolve,
        reject,
        data
      });
      
      this.processQueue();
    });
  }

  // Ejecutar múltiples tareas en paralelo con los workers disponibles
  async runTasks<T>(tasks: Array<{ task: Function | string, data?: any }>): Promise<T[]> {
    return Promise.all(
      tasks.map(({ task, data }) => this.runTask<T>(task, data))
    );
  }

  // Terminar todos los workers
  async terminate(): Promise<void> {
    const terminations = this.workers.map(worker => worker.terminate());
    await Promise.all(terminations);
    this.workers = [];
  }
}