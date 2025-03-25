import { Worker } from 'worker_threads';
import * as path from 'path';
import { Semaphore } from './semaphore';

// Clase para simular un WorkerPool en entorno Node.js
export class WorkerPool {
  private semaphore: Semaphore;
  private taskQueue: {
    task: Function;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    data?: any;
  }[] = [];
  private isProcessing: boolean = false;

  constructor(private numWorkers: number = 4) {
    this.semaphore = new Semaphore(numWorkers);
  }

  // Método simplificado que ejecuta la tarea en el mismo hilo
  async runTask<T>(taskFn: Function, data?: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      try {
        // Ejecutamos la tarea en el mismo hilo para simplificar
        const result = taskFn(data);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Ejecutar múltiples tareas usando el semáforo para limitar concurrencia
  async runTasks<T>(tasks: Array<{ task: Function, data?: any }>): Promise<T[]> {
    const results: T[] = [];
    
    // Usamos el semáforo para limitar el número de tareas concurrentes
    const promises = tasks.map(async ({ task, data }, index) => {
      const release = await this.semaphore.acquire();
      try {
        const result = await this.runTask<T>(task, data);
        results[index] = result;
        return result;
      } finally {
        release();
      }
    });
    
    await Promise.all(promises);
    return results;
  }

  async terminate(): Promise<void> {
    return Promise.resolve();
  }
}