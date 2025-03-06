export class Semaphore {
    private counter: number;
    private waitingQueue: (() => void)[] = [];
  
    constructor(private maxConcurrent: number) {
      this.counter = maxConcurrent;
    }
  
    async acquire(): Promise<() => void> {
      const release = () => {
        this.counter++;
        if (this.waitingQueue.length > 0 && this.counter > 0) {
          // Si hay procesos esperando y hay capacidad disponible, permitir que el siguiente adquiera
          this.counter--;
          const nextResolver = this.waitingQueue.shift();
          nextResolver();
        }
      };
  
      // Si hay capacidad disponible, adquirir inmediatamente
      if (this.counter > 0) {
        this.counter--;
        return release;
      }
  
      // Si no hay capacidad, esperar en la cola
      return new Promise<() => void>((resolve) => {
        this.waitingQueue.push(() => {
          // Cuando nos toque, ya estamos adquiriendo un slot
          resolve(release);
        });
      });
    }
  
    // Método de utilidad para ejecutar una función con el semáforo adquirido
    async runWithSemaphore<T>(fn: () => Promise<T> | T): Promise<T> {
      const release = await this.acquire();
      try {
        return await fn();
      } finally {
        release();
      }
    }
  
    // Método para ejecutar múltiples tareas en paralelo respetando el límite del semáforo
    async runConcurrent<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
      return Promise.all(
        tasks.map(task => this.runWithSemaphore(task))
      );
    }
  
    // Obtener el número de slots disponibles (útil para pruebas y debugging)
    availableSlots(): number {
      return this.counter;
    }
  
    // Obtener el número de tareas en espera (útil para pruebas y debugging)
    waitingCount(): number {
      return this.waitingQueue.length;
    }
  }