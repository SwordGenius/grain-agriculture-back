import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Mutex } from './mutex';
import { Semaphore } from './semaphore';
import { Barrier } from './barrier';
import { WorkerPool } from './worker-pool';

@Injectable()
export class ConcurrencyService implements OnModuleInit, OnModuleDestroy {
  // Colección de mutex para diferentes recursos
  private mutexes: Map<string, Mutex> = new Map();
  
  // Semáforos para controlar acceso concurrente
  private semaphores: Map<string, Semaphore> = new Map();
  
  // Barreras para sincronización
  private barriers: Map<string, Barrier> = new Map();
  
  // Pool para procesar cosas en paralelo
  private workerPool: WorkerPool;

  constructor() {
    // Creo un pool con 4 workers por ahora, podría parametrizarse
    this.workerPool = new WorkerPool(4);
  }

  onModuleInit() {
    this.createMutex('database');
    this.createMutex('mqtt');
    this.createMutex('statistics');
    
    this.createSemaphore('database-queries', 10);
    
    // Limito conexiones de websockets
    this.createSemaphore('websocket-connections', 100);
    
    // Barrera para sincronizar cálculos estadísticos
    this.createBarrier('statistics-sync', 3);
  }

  async onModuleDestroy() {
    // Limpieza para evitar memory leaks
    await this.workerPool.terminate();
  }

  // MÉTODOS PARA MUTEX
  
  createMutex(name: string): Mutex {
    if (this.mutexes.has(name)) {
      return this.mutexes.get(name);
    }
    
    const mutex = new Mutex();
    this.mutexes.set(name, mutex);
    return mutex;
  }
  
  getMutex(name: string): Mutex {
    if (!this.mutexes.has(name)) {
      return this.createMutex(name);
    }
    
    return this.mutexes.get(name);
  }
  
  async withMutex<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    const mutex = this.getMutex(name);
    return mutex.runExclusive(fn);
  }
  
  // MÉTODOS PARA SEMÁFORO
  
  createSemaphore(name: string, maxConcurrent: number): Semaphore {
    if (this.semaphores.has(name)) {
      return this.semaphores.get(name);
    }
    
    const semaphore = new Semaphore(maxConcurrent);
    this.semaphores.set(name, semaphore);
    return semaphore;
  }
  
  getSemaphore(name: string): Semaphore {
    if (!this.semaphores.has(name)) {
      throw new Error(`Semaphore ${name} does not exist`);
    }
    
    return this.semaphores.get(name);
  }
  
  async withSemaphore<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    const semaphore = this.getSemaphore(name);
    return semaphore.runWithSemaphore(fn);
  }
  
  async withConcurrencyLimit<T>(name: string, tasks: (() => Promise<T>)[]): Promise<T[]> {
    const semaphore = this.getSemaphore(name);
    return semaphore.runConcurrent(tasks);
  }
  
  // MÉTODOS PARA BARRERA
  
  createBarrier(name: string, parties: number): Barrier {
    if (this.barriers.has(name)) {
      return this.barriers.get(name);
    }
    
    const barrier = new Barrier(parties);
    this.barriers.set(name, barrier);
    return barrier;
  }
  
  getBarrier(name: string): Barrier {
    if (!this.barriers.has(name)) {
      throw new Error(`Barrier ${name} does not exist`);
    }
    
    return this.barriers.get(name);
  }
  
  // MÉTODOS PARA WORKER POOL
  
  async runInWorker<T>(taskFn: Function | string, data?: any): Promise<T> {
    return this.workerPool.runTask<T>(taskFn as Function, data);
  }
  
  async runTasksInParallel<T>(tasks: Array<{ task: Function | string, data?: any }>): Promise<T[]> {
    return this.workerPool.runTasks<T>(tasks.map(t => ({ task: t.task as Function, data: t.data })));
  }
}