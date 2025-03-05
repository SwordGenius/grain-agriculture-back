// src/common/concurrency/mutex.spec.ts
import { Mutex } from './mutex';

describe('Mutex', () => {
  let mutex: Mutex;

  beforeEach(() => {
    mutex = new Mutex();
  });

  it('should acquire and release lock correctly', async () => {
    const release = await mutex.acquire();
    expect(mutex.isLocked()).toBe(true);
    
    release();
    expect(mutex.isLocked()).toBe(false);
  });

  it('should queue waiters when lock is busy', async () => {
    const release1 = await mutex.acquire();
    expect(mutex.isLocked()).toBe(true);
    
    // Intento adquirir el mutex nuevamente pero no bloqueo la promesa
    const promise = mutex.acquire();
    
    // Verifico que ya hay alguien esperando
    expect(mutex.waitingCount()).toBe(1);
    
    // Libero el primer lock
    release1();
    
    // Ahora el segundo debería tener el lock
    const release2 = await promise;
    expect(mutex.isLocked()).toBe(true);
    expect(mutex.waitingCount()).toBe(0);
    
    release2();
    expect(mutex.isLocked()).toBe(false);
  });

  it('should execute function exclusively', async () => {
    const results: number[] = [];
    
    // Simulamos 5 tareas concurrentes
    const tasks = Array(5).fill(0).map((_, index) => 
      mutex.runExclusive(async () => {
        // Simulamos una tarea que toma tiempo
        await new Promise(resolve => setTimeout(resolve, 10));
        results.push(index);
        return index;
      })
    );
    
    // Esperamos a que todas terminen
    await Promise.all(tasks);
    
    // Los resultados deberían estar en orden porque se ejecutaron exclusivamente
    expect(results).toEqual([0, 1, 2, 3, 4]);
  });

  it('should handle errors correctly', async () => {
    // Primero adquiero el mutex para la prueba
    const release = await mutex.acquire();
    
    try {
      // Intento ejecutar algo que fallará mientras otro tiene el mutex
      const promise = mutex.runExclusive(() => {
        throw new Error('Test error');
      });
      
      // Libero el mutex para que la función pueda ejecutarse
      release();
      
      // La promesa debería rechazarse
      await expect(promise).rejects.toThrow('Test error');
      
      // El mutex debería estar liberado a pesar del error
      expect(mutex.isLocked()).toBe(false);
    } catch (error) {
      // Si algo falla en la prueba, asegurarse de liberar el mutex
      release();
      throw error;
    }
  });

  it('should handle concurrent operations correctly', async () => {
    // Esta prueba simula un escenario concurrente real
    let counter = 0;
    const numTasks = 100;
    const tasks = [];
    
    for (let i = 0; i < numTasks; i++) {
      tasks.push(mutex.runExclusive(async () => {
        const current = counter;
        // Simulamos una operación que toma tiempo y podría causar race conditions
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5));
        counter = current + 1;
      }));
    }
    
    await Promise.all(tasks);
    
    // Si el mutex funciona correctamente, el contador debe ser igual al número de tareas
    expect(counter).toBe(numTasks);
  });
});