export class Barrier {
    private count: number;
    private waiting: Array<() => void> = [];
    private generation: number = 0;
  
    constructor(private parties: number) {
      if (parties <= 0) throw new Error('Barrier must have at least one party');
      this.count = parties;
    }
  
    // Esperar a que todas las partes lleguen a la barrera
    async await(): Promise<number> {
      // Capturar la generación actual para verificar later si es la misma
      const myGeneration = this.generation;
      this.count--;
  
      if (this.count === 0) {
        // Somos el último en llegar a la barrera, resetear todo para la próxima generación
        this.count = this.parties;
        this.generation++;
        
        // Liberar a todos los que esperan
        const currentWaiting = [...this.waiting];
        this.waiting = [];
        currentWaiting.forEach(resolve => resolve());
        
        return myGeneration;
      } else {
        // Esperar a que todos lleguen
        return new Promise<number>(resolve => {
          this.waiting.push(() => resolve(myGeneration));
        });
      }
    }
  
    // Método para resetear la barrera (útil si alguna tarea falla)
    reset(): void {
      this.count = this.parties;
      this.generation++;
      const currentWaiting = [...this.waiting];
      this.waiting = [];
      // Rechazamos todas las promesas pendientes
      currentWaiting.forEach(resolve => resolve());
    }
  
    // Obtener el número de partes que aún necesitan llegar a la barrera
    getNumberWaiting(): number {
      return this.parties - this.count;
    }
  
    // Obtener el número total de partes
    getParties(): number {
      return this.parties;
    }
  
    // Obtener la generación actual
    getGeneration(): number {
      return this.generation;
    }
  }