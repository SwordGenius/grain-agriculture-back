export class Mutex {
  private locked: boolean = false;
  private waitingQueue: (() => void)[] = [];

  async acquire(): Promise<() => void> {
    // Función para liberar el mutex
    const release = () => {
      if (this.waitingQueue.length > 0) {
        // Si hay procesos esperando, pasamos el testigo
        const nextResolver = this.waitingQueue.shift();
        nextResolver();
      } else {
        this.locked = false;
      }
    };

    // Si no está bloqueado, lo tomamos inmediatamente
    if (!this.locked) {
      this.locked = true;
      return release;
    }

    // Si está bloqueado, entramos en la cola de espera
    return new Promise<() => void>((resolve) => {
      this.waitingQueue.push(() => {
        this.locked = true;
        resolve(release);
      });
    });
  }

  // Ejecuta una función con exclusión mutua
  async runExclusive<T>(fn: () => Promise<T> | T): Promise<T> {
    const release = await this.acquire();
    try {
      return await fn();
    } finally {
      release();
    }
  }

  isLocked(): boolean {
    return this.locked;
  }

  waitingCount(): number {
    return this.waitingQueue.length;
  }
}