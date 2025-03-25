import { Mutex } from './mutex';

describe('Mutex', () => {
  let mutex: Mutex;

  beforeEach(() => {
    mutex = new Mutex();
  });

  /**
   * Test que verifica la adquisición y liberación básica del mutex.
   * Comprueba que el estado de bloqueo se actualiza correctamente
   * después de adquirir y liberar el lock.
   */
  it('should acquire and release lock correctly', async () => {
    const release = await mutex.acquire();
    expect(mutex.isLocked()).toBe(true);
    
    release();
    expect(mutex.isLocked()).toBe(false);
  });

  /**
   * Test que verifica la cola de espera cuando el mutex está ocupado.
   * Cuando un mutex está bloqueado, las nuevas solicitudes deberían
   * encolarse y procesarse en orden FIFO cuando se libera el lock.
   */
  it('should queue waiters when lock is busy', async () => {
    const release1 = await mutex.acquire();
    expect(mutex.isLocked()).toBe(true);
    
    // Solicitar el mutex mientras está ocupado
    const promise = mutex.acquire();
    
    // Debería haber una tarea esperando
    expect(mutex.waitingCount()).toBe(1);
    
    // Al liberar, la tarea en espera debería obtener el lock
    release1();
    
    const release2 = await promise;
    expect(mutex.isLocked()).toBe(true);
    expect(mutex.waitingCount()).toBe(0);
    
    release2();
    expect(mutex.isLocked()).toBe(false);
  });

  /**
   * Test que verifica la ejecución exclusiva de funciones con el mutex.
   * El método runExclusive() debe garantizar que las funciones se
   * ejecuten secuencialmente, sin solapamientos.
   */
  it('should execute function exclusively', async () => {
    const results: number[] = [];
    
    // Simulamos 5 tareas concurrentes que deben ejecutarse en orden
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
    
    // Deberían haberse ejecutado en orden, uno tras otro
    expect(results).toEqual([0, 1, 2, 3, 4]);
  });

  /**
   * Test que verifica el manejo correcto de errores dentro del mutex.
   * Si una función protegida por el mutex lanza una excepción,
   * el mutex debe liberarse correctamente para evitar deadlocks.
   */
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
      // Asegurar liberación en caso de error en el test
      release();
      throw error;
    }
  });

  /**
   * Test de estrés que verifica el comportamiento del mutex
   * con múltiples operaciones concurrentes. Verifica que no haya
   * race conditions al modificar una variable compartida.
   */
  it('should handle concurrent operations correctly', async () => {
    let counter = 0;
    const numTasks = 100;
    const tasks = [];
    
    for (let i = 0; i < numTasks; i++) {
      tasks.push(mutex.runExclusive(async () => {
        const current = counter;
        // Simulamos una operación vulnerable a race conditions
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5));
        counter = current + 1;
      }));
    }
    
    await Promise.all(tasks);
    
    // Si el mutex funciona, el contador debe ser exacto
    expect(counter).toBe(numTasks);
  });
});