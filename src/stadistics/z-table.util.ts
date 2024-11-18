export class ZTableUtil {
    private static zTable = new Map<string, number>();
  
    static initialize() {
      this.zTable.set('-3.00', 0.0013); this.zTable.set('-2.90', 0.0019); this.zTable.set('-2.80', 0.0026);
      this.zTable.set('-2.70', 0.0035); this.zTable.set('-2.60', 0.0047); this.zTable.set('-2.50', 0.0062);
      this.zTable.set('-2.40', 0.0082); this.zTable.set('-2.30', 0.0107); this.zTable.set('-2.20', 0.0139);
      this.zTable.set('-2.10', 0.0179); this.zTable.set('-2.00', 0.0228); this.zTable.set('-1.90', 0.0287);
      this.zTable.set('-1.80', 0.0359); this.zTable.set('-1.70', 0.0446); this.zTable.set('-1.60', 0.0548);
      this.zTable.set('-1.50', 0.0668); this.zTable.set('-1.40', 0.0808); this.zTable.set('-1.30', 0.0968);
      this.zTable.set('-1.20', 0.1151); this.zTable.set('-1.10', 0.1357); this.zTable.set('-1.00', 0.1587);
      this.zTable.set('-0.90', 0.1841); this.zTable.set('-0.80', 0.2119); this.zTable.set('-0.70', 0.2420);
      this.zTable.set('-0.60', 0.2743); this.zTable.set('-0.50', 0.3085); this.zTable.set('-0.40', 0.3446);
      this.zTable.set('-0.30', 0.3821); this.zTable.set('-0.20', 0.4207); this.zTable.set('-0.10', 0.4602);
      this.zTable.set('0.00', 0.5000);
  
      this.zTable.set('0.10', 0.5398); this.zTable.set('0.20', 0.5793); this.zTable.set('0.30', 0.6179);
      this.zTable.set('0.40', 0.6554); this.zTable.set('0.50', 0.6915); this.zTable.set('0.60', 0.7257);
      this.zTable.set('0.70', 0.7580); this.zTable.set('0.80', 0.7881); this.zTable.set('0.90', 0.8159);
      this.zTable.set('1.00', 0.8413); this.zTable.set('1.10', 0.8643); this.zTable.set('1.20', 0.8849);
      this.zTable.set('1.30', 0.9032); this.zTable.set('1.40', 0.9192); this.zTable.set('1.50', 0.9332);
      this.zTable.set('1.60', 0.9452); this.zTable.set('1.70', 0.9554); this.zTable.set('1.80', 0.9641);
      this.zTable.set('1.90', 0.9713); this.zTable.set('2.00', 0.9772); this.zTable.set('2.10', 0.9821);
      this.zTable.set('2.20', 0.9861); this.zTable.set('2.30', 0.9893); this.zTable.set('2.40', 0.9918);
      this.zTable.set('2.50', 0.9938); this.zTable.set('2.60', 0.9953); this.zTable.set('2.70', 0.9965);
      this.zTable.set('2.80', 0.9974); this.zTable.set('2.90', 0.9981); this.zTable.set('3.00', 0.9987);
    }
  
    static findClosestProbability(zScore: number): number {
      const roundedZ = (Math.round(zScore * 10) / 10).toFixed(2);
      const key = roundedZ.toString();
      
      if (this.zTable.has(key)) {
        return this.zTable.get(key)!;
      }
      let closestZ = Array.from(this.zTable.keys()).reduce((prev, curr) => {
        return Math.abs(parseFloat(curr) - zScore) < Math.abs(parseFloat(prev) - zScore) 
          ? curr 
          : prev;
      });
      return this.zTable.get(closestZ)!;
    }
  }