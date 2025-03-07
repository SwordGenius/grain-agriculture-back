import { Barrier } from './barrier';

describe('Barrier', () => {
  /**
   * Test que verifica la sincronización de múltiples tareas con la barrera.
   * Se crean 3 tareas que llegan en diferentes momentos, pero todas deben
   * esperar hasta que la última llegue para continuar su ejecución.
   */
  it('should synchronize multiple tasks', async () => {
    const barrier = new Barrier(3);
    const arrivals = [];
    const departures = [];
    
    // Simulamos 3 tareas que llegan a la barrera en diferentes momentos
    const task1 = async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      arrivals.push(1);
      await barrier.await();
      departures.push(1);
    };
    
    const task2 = async () => {
      await new Promise(resolve => setTimeout(resolve, 30));
      arrivals.push(2);
      await barrier.await();
      departures.push(2);
    };
    
    const task3 = async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      arrivals.push(3);
      await barrier.await();
      departures.push(3);
    };
    
    // Iniciamos las tareas
    const promises = [task1(), task2(), task3()];
    
    // Esperamos a que todas las tareas se completen
    await Promise.all(promises);
    
    // Verificamos que llegaron en orden diferente
    expect(arrivals).toEqual([1, 2, 3]);
    
    // Pero todas partieron juntas después de la última llegada
    expect(departures.sort()).toEqual([1, 2, 3]);
  });

  /**
   * Test que verifica el correcto seguimiento de tareas en espera.
   * Comprueba que el contador de tareas en espera se incremente y
   * se reinicie correctamente cuando todas las tareas cruzan la barrera.
   */
  it('should track waiting parties correctly', async () => {
    const barrier = new Barrier(4);
    
    // Inicialmente no hay nadie esperando
    expect(barrier.getNumberWaiting()).toBe(0);
    
    // Simulamos llegadas progresivas
    const arrive1 = barrier.await().then(() => {});
    expect(barrier.getNumberWaiting()).toBe(1);
    
    const arrive2 = barrier.await().then(() => {});
    expect(barrier.getNumberWaiting()).toBe(2);
    
    const arrive3 = barrier.await().then(() => {});
    expect(barrier.getNumberWaiting()).toBe(3);
    
    // Todavía no tenemos todas las partes, nadie debería continuar
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // La última tarea llega y todas cruzan la barrera
    await barrier.await();
    expect(barrier.getNumberWaiting()).toBe(0);
    
    // Verificamos que todas las promesas se resolvieron
    await Promise.all([arrive1, arrive2, arrive3]);
  });

  /**
   * Test que verifica el incremento de generación cuando se cruza la barrera.
   * La generación es un contador que se incrementa cada vez que todas las tareas
   * cruzan la barrera, permitiendo su reutilización.
   */
  it('should increment generation when barrier is crossed', async () => {
    const barrier = new Barrier(2);
    
    // Inicialmente estamos en la generación 0
    expect(barrier.getGeneration()).toBe(0);
    
    // Primer grupo cruza la barrera
    const tasks1 = [barrier.await(), barrier.await()];
    await Promise.all(tasks1);
    
    // Ahora deberíamos estar en la generación 1
    expect(barrier.getGeneration()).toBe(1);
    
    // Segundo grupo cruza la barrera
    const tasks2 = [barrier.await(), barrier.await()];
    await Promise.all(tasks2);
    
    // Ahora deberíamos estar en la generación 2
    expect(barrier.getGeneration()).toBe(2);
  });

  /**
   * Test que verifica el comportamiento del método reset().
   * Este método reinicia la barrera, permitiendo liberar a las tareas en espera
   * y preparando la barrera para un nuevo ciclo de uso.
   */
  it('should properly reset the barrier', async () => {
    const barrier = new Barrier(3);
    
    // Dos tareas llegan a la barrera
    const task1 = barrier.await().then(() => {});
    const task2 = barrier.await().then(() => {});
    
    expect(barrier.getNumberWaiting()).toBe(2);
    
    // Resetear la barrera
    barrier.reset();
    
    // Ya no debería haber tareas esperando
    expect(barrier.getNumberWaiting()).toBe(0);
    expect(barrier.getGeneration()).toBe(1);
    
    // Las promesas anteriores deberían resolverse sin error
    await Promise.all([task1, task2]);
    
    // Comprobar que podemos volver a usar la barrera normalmente
    const tasks = [barrier.await(), barrier.await(), barrier.await()];
    await Promise.all(tasks);
    
    expect(barrier.getGeneration()).toBe(2);
  });

  /**
   * Test de estrés que verifica el comportamiento de la barrera
   * bajo condiciones de alta concurrencia. Es importante comprobar
   * que no se producen race conditions cuando múltiples tareas
   * cruzan la barrera simultáneamente.
   */
  it('should handle concurrent barrier crossings in stress test', async () => {
    const numParties = 10;
    const barrier = new Barrier(numParties);
    let counter = 0;
    
    const task = async () => {
      // Todas las tareas llegan a la barrera y esperan
      await barrier.await();
      
      // Después de cruzar la barrera, incrementamos el contador
      counter++;
    };
    
    // Crear varias tareas que esperan en la barrera
    const tasks = Array(numParties).fill(0).map(() => task());
    
    // Esperar a que todas completen
    await Promise.all(tasks);
    
    // Verificar que todas las tareas incrementaron el contador
    expect(counter).toBe(numParties);
  });
});