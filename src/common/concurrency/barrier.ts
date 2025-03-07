export class Barrier {
  private count: number;
  private waiting: Array<() => void> = [];
  private generation: number = 0;

  constructor(private parties: number) {
    if (parties <= 0) throw new Error('Barrier must have at least one party');
    this.count = parties;
  }

  // Espera a que todas las partes lleguen a la barrera
  async await(): Promise<number> {
    // Guardo la generación actual para verificar después
    const myGeneration = this.generation;
    this.count--;

    if (this.count === 0) {
      // Somos el último en llegar, hay que liberar a todos
      this.count = this.parties;
      this.generation++;
      
      // Libero a todos los que están esperando
      const currentWaiting = [...this.waiting];
      this.waiting = [];
      currentWaiting.forEach(resolve => resolve());
      
      return myGeneration;
    } else {
      // Toca esperar a que lleguen todos
      return new Promise<number>(resolve => {
        this.waiting.push(() => resolve(myGeneration));
      });
    }
  }

  // Resetea la barrera (útil si alguna tarea se cuelga)
  reset(): void {
    this.count = this.parties;
    this.generation++;
    const currentWaiting = [...this.waiting];
    this.waiting = [];
    currentWaiting.forEach(resolve => resolve());
  }

  // Devuelve cuántas partes están esperando
  getNumberWaiting(): number {
    return this.parties - this.count;
  }

  // Devuelve el número total de partes necesarias
  getParties(): number {
    return this.parties;
  }

  // Devuelve la generación actual
  getGeneration(): number {
    return this.generation;
  }
}