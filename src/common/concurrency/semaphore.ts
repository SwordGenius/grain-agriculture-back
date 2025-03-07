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
        // Si hay procesos esperando y hay slots, pasamos un permiso
        this.counter--;
        const nextResolver = this.waitingQueue.shift();
        nextResolver();
      }
    };

    // Si hay slots disponibles, tomamos uno inmediatamente
    if (this.counter > 0) {
      this.counter--;
      return release;
    }

    // Si no hay slots, entramos en la cola de espera
    return new Promise<() => void>((resolve) => {
      this.waitingQueue.push(() => {
        // Ya nos dieron un slot cuando nos toca el turno
        resolve(release);
      });
    });
  }

  // Ejecuta una función adquiriendo un permiso
  async runWithSemaphore<T>(fn: () => Promise<T> | T): Promise<T> {
    const release = await this.acquire();
    try {
      return await fn();
    } finally {
      release();
    }
  }

  // Ejecuta múltiples tareas en paralelo con el límite del semáforo
  async runConcurrent<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
    return Promise.all(
      tasks.map(task => this.runWithSemaphore(task))
    );
  }

  // Para debugging: cuántos slots quedan disponibles
  availableSlots(): number {
    return this.counter;
  }

  // Para debugging: cuántas tareas están esperando
  waitingCount(): number {
    return this.waitingQueue.length;
  }
}