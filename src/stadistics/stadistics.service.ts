import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Stadistics, Limits, SensorStats } from './interfaces/stadistics.interface';
import { ZTableUtil } from './z-table.util';
import { StatisticsUtil } from './statistics.util';
import { MovementPredictionUtil } from './movement-prediction.util';
import { Model } from 'mongoose';
import { GrainSensor } from '../grain-sensor/interfaces/grainSensor.interface';
import { ConcurrencyService } from '../common/concurrency/concurrency.service';

@Injectable()
export class StatisticsService {
  private readonly limits: Limits = {
    temperature: { min: 10, max: 30 },
    humidity: { min: 8, max: 14 },
    gas: { min: 0, max: 800 },
  };

  constructor(
    @InjectModel('GrainSensor')
    private readonly grainSensorModel: Model<GrainSensor>,
    private readonly concurrencyService: ConcurrencyService,
  ) {
    ZTableUtil.initialize();
  }
  
  async predictMovement(): Promise<number> {
    // Uso de mutex para asegurar acceso exclusivo a la base de datos
    return this.concurrencyService.withMutex('statistics', async () => {
      const data = await this.grainSensorModel.find().exec();
      
      // Procesamiento en un worker thread para no bloquear el event loop
      return this.concurrencyService.runInWorker<number>(
        (sensorData) => {
          // Función que se ejecutará en el worker thread
          // Importamos la clase que necesitamos
          const movementPrediction = require('./movement-prediction.util').MovementPredictionUtil;
          return movementPrediction.predictMovement(sensorData);
        },
        data
      );
    });
  }

  async calculateStatistics(): Promise<{ stats: Stadistics; limits: Limits }> {
    // Protegemos la consulta a la BD con un semáforo para limitar concurrencia
    return this.concurrencyService.withSemaphore('database-queries', async () => {
      const data = await this.grainSensorModel.find().exec();

      // Extraemos los datos que necesitamos para los cálculos
      const temperaturesOutside = data.map(record => record.temperature_outside);
      const temperaturesInside = data.map(record => record.temperature_inside);
      const humidities = data.map(record => record.humidity);
      const gases = data.map(record => record.gas);

      // Calculamos las estadísticas en paralelo usando worker threads
      const results = await this.concurrencyService.runTasksInParallel<SensorStats>([
        {
          task: this.createMetricsCalculator(),
          data: { data: temperaturesOutside, limits: this.limits.temperature }
        },
        {
          task: this.createMetricsCalculator(),
          data: { data: temperaturesInside, limits: this.limits.temperature }
        },
        {
          task: this.createMetricsCalculator(),
          data: { data: humidities, limits: this.limits.humidity }
        },
        {
          task: this.createMetricsCalculator(),
          data: { data: gases, limits: this.limits.gas }
        }
      ]);

      // Asegurarnos de que los resultados se mapean correctamente a la interfaz Stadistics
      const stats: Stadistics = {
        temperature_outside: this.ensureSensorStats(results[0]),
        temperature_inside: this.ensureSensorStats(results[1]),
        humidity: this.ensureSensorStats(results[2]),
        gas: this.ensureSensorStats(results[3])
      };

      return { stats, limits: this.limits };
    });
  }

  // Método auxiliar para asegurar que los datos recibidos cumplen con la interfaz SensorStats
  private ensureSensorStats(data: any): SensorStats {
    return {
      average: typeof data.average === 'number' ? data.average : 0,
      std_dev: typeof data.std_dev === 'number' ? data.std_dev : 0,
      probabilities: {
        below_min: typeof data.probabilities?.below_min === 'number' ? data.probabilities.below_min : 0,
        above_max: typeof data.probabilities?.above_max === 'number' ? data.probabilities.above_max : 0,
        within_limits: typeof data.probabilities?.within_limits === 'number' ? data.probabilities.within_limits : 0
      }
    };
  }

  private createMetricsCalculator(): Function {
    return function(workerData: { data: number[], limits: { min: number, max: number } }): SensorStats {
      // Esta función se ejecuta en un worker thread
      const { data, limits } = workerData;
      
      // Calculamos el promedio
      const sum = data.reduce((acc, value) => acc + value, 0);
      const average = sum / data.length;
      
      // Calculamos la desviación estándar
      const variance = data.reduce((acc, value) => acc + Math.pow(value - average, 2), 0) / data.length;
      const stdDev = Math.sqrt(variance);
      
      // Calculamos los z-scores
      const zMin = (limits.min - average) / stdDev;
      const zMax = (limits.max - average) / stdDev;
      
      // Calculamos las probabilidades usando una tabla de z-score simplificada
      const calculateZProbability = (z: number): number => {
        // Tabla simplificada - en producción se usaría una más detallada
        const zTable: {[key: string]: number} = {
          "-3.00": 0.0013, "-2.50": 0.0062, "-2.00": 0.0228, "-1.50": 0.0668, 
          "-1.00": 0.1587, "-0.50": 0.3085, "0.00": 0.5000, "0.50": 0.6915, 
          "1.00": 0.8413, "1.50": 0.9332, "2.00": 0.9772, "2.50": 0.9938, "3.00": 0.9987
        };
        
        // Encontrar el z-score más cercano de la tabla
        const zValues = Object.keys(zTable).map(parseFloat);
        const closestZ = zValues.reduce((prev, curr) => {
          return Math.abs(curr - z) < Math.abs(prev - z) ? curr : prev;
        });
        
        return zTable[closestZ.toFixed(2)];
      };
      
      // Calcular probabilidades
      const probBelowMin = calculateZProbability(zMin) * 100;
      const probAboveMax = (1 - calculateZProbability(zMax)) * 100;
      const probWithinLimits = (calculateZProbability(zMax) - calculateZProbability(zMin)) * 100;
      
      // Garantizar que devolvemos un objeto que cumpla con la interfaz SensorStats
      return {
        average,
        std_dev: stdDev,
        probabilities: {
          below_min: probBelowMin,
          above_max: probAboveMax,
          within_limits: probWithinLimits
        }
      };
    };
  }
}