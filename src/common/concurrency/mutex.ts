// src/common/concurrency/mutex.ts
export class Mutex {
    private locked: boolean = false;
    private waitingQueue: (() => void)[] = [];
  
    async acquire(): Promise<() => void> {
      // Función release que será devuelta para liberar el mutex
      const release = () => {
        if (this.waitingQueue.length > 0) {
          // Si hay procesos esperando, permitir que el siguiente adquiera el lock
          const nextResolver = this.waitingQueue.shift();
          nextResolver();
        } else {
          // Si no hay nadie esperando, simplemente liberar el lock
          this.locked = false;
        }
      };
  
      // Si el mutex no está bloqueado, adquirirlo inmediatamente
      if (!this.locked) {
        this.locked = true;
        return release;
      }
  
      // Si el mutex está bloqueado, esperar en la cola
      return new Promise<() => void>((resolve) => {
        this.waitingQueue.push(() => {
          this.locked = true;
          resolve(release);
        });
      });
    }
  
    // Método de utilidad para ejecutar una función con el mutex adquirido
    async runExclusive<T>(fn: () => Promise<T> | T): Promise<T> {
      const release = await this.acquire();
      try {
        return await fn();
      } finally {
        release();
      }
    }
  
    // Verificar si el mutex está bloqueado (útil para pruebas y debugging)
    isLocked(): boolean {
      return this.locked;
    }
  
    // Verificar cuántos procesos están esperando (útil para pruebas y debugging)
    waitingCount(): number {
      return this.waitingQueue.length;
    }
  }