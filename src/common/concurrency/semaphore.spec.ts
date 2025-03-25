import { Semaphore } from './semaphore';

describe('Semaphore', () => {
  /**
   * Test que verifica la ejecución concurrente limitada por el semáforo.
   * El semáforo debe permitir que se ejecuten hasta N tareas simultáneamente,
   * donde N es el valor configurado en su constructor.
   */
  it('should allow concurrent execution up to the limit', async () => {
    const semaphore = new Semaphore(3);
    let runningTasks = 0;
    let maxRunningTasks = 0;
    const results = [];

    // Creamos 10 tareas que intentarán ejecutarse concurrentemente
    const tasks = Array(10).fill(0).map((_, index) => 
      semaphore.runWithSemaphore(async () => {
        runningTasks++;
        maxRunningTasks = Math.max(maxRunningTasks, runningTasks);
        
        // Simulamos una tarea que toma tiempo
        await new Promise(resolve => setTimeout(resolve, 50));
        
        results.push(index);
        runningTasks--;
      })
    );
    
    await Promise.all(tasks);
    
    // Verificamos que nunca excedimos el límite de concurrencia
    expect(maxRunningTasks).toBeLessThanOrEqual(3);
    
    // Verificamos que todas las tareas se completaron
    expect(results.length).toBe(10);
  });

  /**
   * Test que verifica la liberación de permisos incluso cuando una tarea falla.
   * Es crucial que los permisos se liberen para evitar deadlocks cuando
   * las tareas fallan con excepciones.
   */
  it('should release permits even if task throws error', async () => {
    const semaphore = new Semaphore(2);
    
    // Adquirimos los dos permisos disponibles
    const release1 = await semaphore.acquire();
    const release2 = await semaphore.acquire();
    
    // Verificamos que no hay más permisos disponibles
    expect(semaphore.availableSlots()).toBe(0);
    
    // Liberamos un permiso
    release1();
    
    // Verificamos que ahora hay un permiso disponible
    expect(semaphore.availableSlots()).toBe(1);
    
    try {
      // Ejecutamos una tarea que fallará
      await semaphore.runWithSemaphore(() => {
        throw new Error('Test error');
      });
    } catch (error) {
      // La tarea falló, pero el permiso debería liberarse
    }
    
    // Verificamos que el permiso se liberó correctamente
    expect(semaphore.availableSlots()).toBe(1);
    
    // Liberamos el segundo permiso
    release2();
    
    // Verificamos que ambos permisos están disponibles
    expect(semaphore.availableSlots()).toBe(2);
  });

  /**
   * Test que verifica el manejo correcto de múltiples tareas en espera.
   * Las tareas deberían procesarse en orden FIFO cuando los permisos
   * están limitados y hay más solicitudes que permisos disponibles.
   */
  it('should handle multiple waiting tasks correctly', async () => {
    const semaphore = new Semaphore(1);
    let taskOrder = [];
    
    // Adquirimos el único permiso disponible
    const release = await semaphore.acquire();
    
    // Encolamos múltiples tareas que esperarán su turno
    const task1 = semaphore.runWithSemaphore(async () => {
      taskOrder.push(1);
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    const task2 = semaphore.runWithSemaphore(async () => {
      taskOrder.push(2);
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    const task3 = semaphore.runWithSemaphore(async () => {
      taskOrder.push(3);
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    // Verificamos que hay tareas esperando
    expect(semaphore.waitingCount()).toBe(3);
    
    // Liberamos el permiso para que las tareas puedan comenzar
    release();
    
    // Esperamos a que todas las tareas se completen
    await Promise.all([task1, task2, task3]);
    
    // Verificamos que se ejecutaron en orden FIFO
    expect(taskOrder).toEqual([1, 2, 3]);
    
    // Verificamos que no hay más tareas esperando
    expect(semaphore.waitingCount()).toBe(0);
    
    // Verificamos que el permiso está disponible nuevamente
    expect(semaphore.availableSlots()).toBe(1);
  });
  
  /**
   * Test que verifica la ejecución concurrente de tareas con límite.
   * El método runConcurrent debe ejecutar múltiples tareas respetando
   * el límite de concurrencia establecido por el semáforo.
   */
  it('should run tasks concurrently with limit', async () => {
    const semaphore = new Semaphore(3);
    const startTimes = [];
    const endTimes = [];
    
    // Creamos 6 tareas que registran sus tiempos
    const tasks = Array(6).fill(0).map((_, index) => async () => {
      startTimes[index] = Date.now();
      // Cada tarea toma un tiempo fijo
      await new Promise(resolve => setTimeout(resolve, 100));
      endTimes[index] = Date.now();
      return index;
    });
    
    // Ejecutamos las tareas con el límite del semáforo
    const results = await semaphore.runConcurrent(tasks);
    
    // Verificamos que todas las tareas se completaron
    expect(results).toEqual([0, 1, 2, 3, 4, 5]);
    
    // Las primeras 3 tareas deberían iniciar casi simultáneamente
    const firstBatchStartDiff = Math.max(...startTimes.slice(0, 3)) - Math.min(...startTimes.slice(0, 3));
    expect(firstBatchStartDiff).toBeLessThan(50); // Margen de error razonable
    
    // La segunda tanda debería comenzar después de que termine alguna de la primera
    const firstBatchMinEnd = Math.min(...endTimes.slice(0, 3));
    const secondBatchMaxStart = Math.max(...startTimes.slice(3));
    expect(secondBatchMaxStart).toBeGreaterThanOrEqual(firstBatchMinEnd);
  });
});