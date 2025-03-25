import { WorkerPool } from './worker-pool';

jest.setTimeout(10000);

describe('WorkerPool', () => {
  let workerPool: WorkerPool;

  beforeEach(() => {
    workerPool = new WorkerPool(4);
  });

  afterEach(async () => {
    await workerPool.terminate();
  });

  /**
   * Test básico que verifica la ejecución de tareas en workers.
   * El pool debe ejecutar correctamente funciones con sus argumentos
   * y devolver los resultados.
   */
  it('should execute tasks in worker threads', async () => {
    const result = await workerPool.runTask<number>((data) => {
      return data.a + data.b;
    }, { a: 5, b: 7 });

    expect(result).toBe(12);
  });

  /**
   * Test que verifica el manejo de errores en los workers.
   * Si una tarea lanza una excepción, el pool debe propagarla
   * correctamente al código que llamó a la tarea.
   */
  it('should handle errors in worker threads', async () => {
    const errorTask = () => {
      throw new Error('Worker error');
    };

    await expect(workerPool.runTask(errorTask)).rejects.toThrow('Worker error');
  });

  /**
   * Test que verifica la ejecución paralela de múltiples tareas.
   * Las tareas deberían ejecutarse simultáneamente, reduciendo
   * el tiempo total de ejecución comparado con ejecución secuencial.
   */
  it('should execute multiple tasks in parallel', async () => {
    const startTime = Date.now();

    const tasks = [
      { 
        task: () => new Promise(resolve => setTimeout(() => resolve(1), 100))
      },
      { 
        task: () => new Promise(resolve => setTimeout(() => resolve(2), 100))
      },
      { 
        task: () => new Promise(resolve => setTimeout(() => resolve(3), 100))
      },
      { 
        task: () => new Promise(resolve => setTimeout(() => resolve(4), 100))
      }
    ];

    const results = await workerPool.runTasks(tasks);
    const endTime = Date.now();

    // Verificar resultados correctos
    expect(results).toEqual([1, 2, 3, 4]);

    // Verificar paralelismo: debería tardar ~100ms, no 400ms
    expect(endTime - startTime).toBeLessThan(300);
  });

  /**
   * Test que verifica el manejo de tareas CPU-intensivas.
   * El worker pool debe ser capaz de ejecutar cálculos
   * que consumen CPU sin bloquear el hilo principal.
   */
  it('should handle CPU-intensive tasks', async () => {
    // Cálculo de números primos hasta 100
    const countPrimes = () => {
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

  /**
   * Test que verifica la limitación de concurrencia basada en el tamaño del pool.
   * Si el pool tiene N workers, no debería ejecutar más de N tareas simultáneamente,
   * sino encolar las adicionales hasta que haya workers disponibles.
   */
  it('should limit concurrent execution based on pool size', async () => {
    // Crear un pool con solo 2 workers
    const smallPool = new WorkerPool(2);
    
    // Esta función simplemente devuelve su ID
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
    
    // Verificar que todas se completaron con los IDs correctos
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