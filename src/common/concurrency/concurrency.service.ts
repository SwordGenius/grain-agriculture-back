// src/common/concurrency/concurrency.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Mutex } from './mutex';
import { Semaphore } from './semaphore';
import { Barrier } from './barrier';
import { WorkerPool } from './worker-pool';

@Injectable()
export class ConcurrencyService implements OnModuleInit, OnModuleDestroy {
  // Diferentes instancias de mutex para diferentes recursos
  private mutexes: Map<string, Mutex> = new Map();
  
  // Semáforos para controlar acceso concurrente a recursos limitados
  private semaphores: Map<string, Semaphore> = new Map();
  
  // Barreras para sincronización
  private barriers: Map<string, Barrier> = new Map();
  
  // Pool de workers para procesamiento en paralelo
  private workerPool: WorkerPool;

  constructor() {
    // Inicializar el pool de workers con 4 workers por defecto
    // Este número puede ajustarse según las necesidades del sistema
    this.workerPool = new WorkerPool(4);
  }

  onModuleInit() {
    // Crear algunos recursos por defecto
    this.createMutex('database');
    this.createMutex('mqtt');
    this.createMutex('statistics');
    
    // Semáforo para limitar las consultas a la base de datos
    this.createSemaphore('database-queries', 10);
    
    // Semáforo para limitar las conexiones de websocket
    this.createSemaphore('websocket-connections', 100);
    
    // Barrera para la sincronización de cálculos estadísticos
    this.createBarrier('statistics-sync', 3);
  }

  async onModuleDestroy() {
    // Limpiar recursos al apagar la aplicación
    await this.workerPool.terminate();
  }

  // MÉTODOS PARA MUTEX
  
  // Crear un nuevo mutex
  createMutex(name: string): Mutex {
    if (this.mutexes.has(name)) {
      return this.mutexes.get(name);
    }
    
    const mutex = new Mutex();
    this.mutexes.set(name, mutex);
    return mutex;
  }
  
  // Obtener un mutex existente
  getMutex(name: string): Mutex {
    if (!this.mutexes.has(name)) {
      return this.createMutex(name);
    }
    
    return this.mutexes.get(name);
  }
  
  // Ejecutar una función con exclusión mutua
  async withMutex<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    const mutex = this.getMutex(name);
    return mutex.runExclusive(fn);
  }
  
  // MÉTODOS PARA SEMÁFORO
  
  // Crear un nuevo semáforo
  createSemaphore(name: string, maxConcurrent: number): Semaphore {
    if (this.semaphores.has(name)) {
      return this.semaphores.get(name);
    }
    
    const semaphore = new Semaphore(maxConcurrent);
    this.semaphores.set(name, semaphore);
    return semaphore;
  }
  
  // Obtener un semáforo existente
  getSemaphore(name: string): Semaphore {
    if (!this.semaphores.has(name)) {
      throw new Error(`Semaphore ${name} does not exist`);
    }
    
    return this.semaphores.get(name);
  }
  
  // Ejecutar una función con un semáforo
  async withSemaphore<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    const semaphore = this.getSemaphore(name);
    return semaphore.runWithSemaphore(fn);
  }
  
  // Ejecutar múltiples tareas en paralelo respetando el límite del semáforo
  async withConcurrencyLimit<T>(name: string, tasks: (() => Promise<T>)[]): Promise<T[]> {
    const semaphore = this.getSemaphore(name);
    return semaphore.runConcurrent(tasks);
  }
  
  // MÉTODOS PARA BARRERA
  
  // Crear una nueva barrera
  createBarrier(name: string, parties: number): Barrier {
    if (this.barriers.has(name)) {
      return this.barriers.get(name);
    }
    
    const barrier = new Barrier(parties);
    this.barriers.set(name, barrier);
    return barrier;
  }
  
  // Obtener una barrera existente
  getBarrier(name: string): Barrier {
    if (!this.barriers.has(name)) {
      throw new Error(`Barrier ${name} does not exist`);
    }
    
    return this.barriers.get(name);
  }
  
  // MÉTODOS PARA WORKER POOL
  
  // Ejecutar una tarea en un worker
  async runInWorker<T>(taskFn: Function | string, data?: any): Promise<T> {
    return this.workerPool.runTask<T>(taskFn as Function, data);
  }
  
  // Ejecutar múltiples tareas en paralelo con workers
  async runTasksInParallel<T>(tasks: Array<{ task: Function | string, data?: any }>): Promise<T[]> {
    return this.workerPool.runTasks<T>(tasks.map(t => ({ task: t.task as Function, data: t.data })));
  }
}