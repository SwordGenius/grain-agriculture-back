import { GrainSensor } from '../grain-sensor/interfaces/grainSensor.interface';

export class MovementPredictionUtil {
  private static readonly TIME_WINDOW_DAYS = 7;
  private static readonly DEFAULT_PROBABILITY = 50;
  private static readonly MIN_RECORDS = 3;

  /**
   * @param historicalData 
   * @returns
   */
  static async predictMovement(historicalData: GrainSensor[]): Promise<number> {
    try {
      if (!historicalData?.length) {
        console.log("No se proporcionaron datos históricos.");
        return this.DEFAULT_PROBABILITY;
      }

      const sortedData = [...historicalData].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });

      const last7DaysData = sortedData.slice(0, this.TIME_WINDOW_DAYS);
      console.log(`Procesando ${last7DaysData.length} registros de los últimos 7 días.`);

      if (last7DaysData.length < this.MIN_RECORDS) {
        console.log("Datos insuficientes para una predicción precisa.");
        return this.DEFAULT_PROBABILITY;
      }

      let weightedMovementCount = 0;
      last7DaysData.forEach((record, index) => {
        const weight = 1 - (index / this.TIME_WINDOW_DAYS * 0.5); // 1.0 to 0.5
        
        if (record.movement_1 || record.movement_2) {
          const formattedDate = record.date 
            ? new Date(record.date).toISOString().split('T')[0]
            : 'fecha no disponible';
            
          console.log(`Movimiento detectado en: ${formattedDate}`);
          weightedMovementCount += weight;
        }
      });

      const probability = (weightedMovementCount / last7DaysData.length) * 100;
      
      const finalProbability = Math.min(Math.max(probability, 0), 100);

      console.log(`Probabilidad de movimiento en los últimos 7 días: ${finalProbability.toFixed(2)}%`);
     
      console.log('Detalles del cálculo:', {
        registrosProcesados: last7DaysData.length,
        movimientosPonderados: weightedMovementCount.toFixed(2),
        probabilidadFinal: finalProbability.toFixed(2)
      });

      return Number(finalProbability.toFixed(2));
    } catch (error) {
      console.error('Error al predecir movimiento:', error);
      return this.DEFAULT_PROBABILITY;
    }
  }
}