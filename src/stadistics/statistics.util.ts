export class StatisticsUtil {
    static calculateAverage(data: number[]): number {
      const sum = data.reduce((acc, value) => acc + value, 0);
      return sum / data.length;
    }
  
    static calculateStandardDeviation(data: number[], mean: number): number {
      const variance = data.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) / data.length;
      return Math.sqrt(variance);
    }
  
    static calculateZScore(x: number, mean: number, stdDev: number): number {
      return (x - mean) / stdDev;
    }
  }