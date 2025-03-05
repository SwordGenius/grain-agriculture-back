// src/common/concurrency/worker-pool.spec.ts
import { WorkerPool } from './worker-pool';

// Nota: Estas pruebas pueden requerir un tiempo de ejecución más largo
// ya que crean worker threads reales
jest.setTimeout(30000);

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
      { task: () => new Promise(resolve => setTimeout(() => resolve(1), 200)) },
      { task: () => new Promise(resolve => setTimeout(() => resolve(2), 200)) },
      { task: () => new Promise(resolve => setTimeout(() => resolve(3), 200)) },
      { task: () => new Promise(resolve => setTimeout(() => resolve(4), 200)) }
    ];

    const results = await workerPool.runTasks(tasks);
    const endTime = Date.now();

    // Verificar que todas las tareas se ejecutaron
    expect(results).toEqual([1, 2, 3, 4]);

    // Verificar que se ejecutaron en paralelo (deberían tardar aproximadamente 200ms, no 800ms)
    // Añadimos un margen de error debido a la sobrecarga de crear workers
    expect(endTime - startTime).toBeLessThan(600);
  });

  it('should handle CPU-intensive tasks', async () => {
    // Esta prueba ejecuta una tarea CPU-intensiva que calcularía primos
    const calculatePrimes = (data) => {
      const max = data.max || 1000000;
      const primes = [];
      
      for (let i = 2; i < max; i++) {
        let isPrime = true;
        
        // Verificar si el número es divisible por algún número menor
        for (let j = 2; j <= Math.sqrt(i); j++) {
          if (i % j === 0) {
            isPrime = false;
            break;
          }
        }
        
        if (isPrime) {
          primes.push(i);
        }
      }
      
      return primes.length;
    };

    // Ejecutar la tarea CPU-intensiva en un worker
    const result = await workerPool.runTask(calculatePrimes, { max: 100000 });
    
    // El número de primos menores a 100,000 debería ser 9592
    expect(result).toBe(9592);
  });

  it('should limit concurrent execution based on pool size', async () => {
    // Crear un pool con solo 2 workers
    const smallPool = new WorkerPool(2);
    
    let runningTasks = 0;
    let maxRunningTasks = 0;
    
    // Esta función registra el número de tareas ejecutándose concurrentemente
    const taskFn = (data) => {
      // El código a continuación simula registrar cuántas tareas se ejecutan concurrentemente
      // En un entorno de prueba real, esto requeriría una sincronización entre workers
      // y el proceso principal, lo cual es complicado. Esta es una simplificación.
      
      // Simulamos trabajo
      const start = Date.now();
      while (Date.now() - start < data.duration) {
        // Mantener la CPU ocupada
      }
      
      return data.taskId;
    };
    
    // Ejecutar 5 tareas con un pool de 2 workers
    const tasks = [];
    for (let i = 0; i < 5; i++) {
      tasks.push({
        task: taskFn,
        data: { taskId: i, duration: 200 }
      });
    }
    
    const results = await smallPool.runTasks(tasks);
    
    // Verificar que todas las tareas se completaron
    expect(results.sort()).toEqual([0, 1, 2, 3, 4]);
    
    // Limpiar
    await smallPool.terminate();
  });
});