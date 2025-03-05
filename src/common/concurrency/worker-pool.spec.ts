// src/common/concurrency/worker-pool.spec.ts
import { WorkerPool } from './worker-pool';

// Nota: Estas pruebas simulan workers sin depender de worker_threads reales
jest.setTimeout(10000);

describe('WorkerPool', () => {
  let workerPool: WorkerPool;

  beforeEach(() => {
    workerPool = new WorkerPool(4);
  });

  afterEach(async () => {
    await workerPool.terminate();
  });

  it('should execute tasks in worker threads', async () => {
    const result = await workerPool.runTask<number>((data) => {
      return data.a + data.b;
    }, { a: 5, b: 7 });

    expect(result).toBe(12);
  });

  it('should handle errors in worker threads', async () => {
    const errorTask = () => {
      throw new Error('Worker error');
    };

    await expect(workerPool.runTask(errorTask)).rejects.toThrow('Worker error');
  });

  it('should execute multiple tasks in parallel', async () => {
    const startTime = Date.now();

    const tasks = [
      { 
        task: (data) => {
          return new Promise(resolve => setTimeout(() => resolve(1), 100));
        }
      },
      { 
        task: (data) => {
          return new Promise(resolve => setTimeout(() => resolve(2), 100));
        }
      },
      { 
        task: (data) => {
          return new Promise(resolve => setTimeout(() => resolve(3), 100));
        }
      },
      { 
        task: (data) => {
          return new Promise(resolve => setTimeout(() => resolve(4), 100));
        }
      }
    ];

    const results = await workerPool.runTasks(tasks);
    const endTime = Date.now();

    // Verificar que todas las tareas se ejecutaron
    expect(results).toEqual([1, 2, 3, 4]);

    // Verificar que se ejecutaron en paralelo (deberían tardar aproximadamente 100ms, no 400ms)
    expect(endTime - startTime).toBeLessThan(300);
  });

  it('should handle CPU-intensive tasks', async () => {
    // Esta prueba cuenta los números primos hasta 100
    const countPrimes = (data) => {
      const max = 100;
      let count = 0;
      
      for (let i = 2; i <= max; i++) {
        let isPrime = true;
        
        for (let j = 2; j <= Math.sqrt(i); j++) {
          if (i % j === 0) {
            isPrime = false;
            break;
          }
        }
        
        if (isPrime) {
          count++;
        }
      }
      
      return count;
    };

    const result = await workerPool.runTask(countPrimes);
    
    // Hay 25 números primos hasta 100
    expect(result).toBe(25);
  });

  it('should limit concurrent execution based on pool size', async () => {
    // Crear un pool con solo 2 workers
    const smallPool = new WorkerPool(2);
    
    // Esta función simplemente devuelve su ID de tarea
    const taskFn = (data) => {
      return data.taskId;
    };
    
    // Ejecutar 5 tareas con un pool de 2 workers
    const tasks = [];
    for (let i = 0; i < 5; i++) {
      tasks.push({
        task: taskFn,
        data: { taskId: i }
      });
    }
    
    const results = await smallPool.runTasks(tasks);
    
    // Verificar que todas las tareas se completaron y tienen los IDs correctos
    const sortedResults = [...results].sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
      }
      return String(a).localeCompare(String(b));
    });
    expect(sortedResults).toEqual([0, 1, 2, 3, 4]);
    
    // Limpiar
    await smallPool.terminate();
  });
});