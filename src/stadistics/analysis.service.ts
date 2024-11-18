import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GrainSensor } from '../grain-sensor/interfaces/grainSensor.interface';

@Injectable()
export class MovementAnalysisService {
  constructor(
    @InjectModel('GrainSensor')
    private readonly grainSensorModel: Model<GrainSensor>,
  ) {}

  async analyzeMovements() {
    // Obtener datos de la última semana
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const data = await this.grainSensorModel
      .find({ date: { $gte: lastWeek } })
      .sort({ date: 1 })
      .exec();

    // Verificar si hay datos
    if (!data || data.length === 0) {
      return {
        message: "No hay datos suficientes para realizar el análisis",
        weeklyAnalysis: null,
        prediction: null,
        environmentalFactors: null
      };
    }

    const weeklyAnalysis = this.analyzeWeeklyPatterns(data);
    const prediction = this.predictNextMovements(weeklyAnalysis, data);
    const environmentalFactors = this.analyzeEnvironmentalFactors(data);

    return {
      weeklyAnalysis,
      prediction,
      environmentalFactors
    };
  }

  private analyzeWeeklyPatterns(data: GrainSensor[]) {
    if (!data || data.length === 0) return null;

    const dailyMovements = {
      movement1: 0,
      movement2: 0,
      totalReadings: data.length
    };

    // Contar movimientos totales
    data.forEach(reading => {
      if (reading?.movement_1) dailyMovements.movement1++;
      if (reading?.movement_2) dailyMovements.movement2++;
    });

    // Calcular frecuencias
    const movement1Frequency = (dailyMovements.movement1 / dailyMovements.totalReadings) * 100;
    const movement2Frequency = (dailyMovements.movement2 / dailyMovements.totalReadings) * 100;
    
    // Analizar patrones secuenciales
    const sequentialPatterns = this.analyzeSequentialPatterns(data);

    return {
      totalReadings: dailyMovements.totalReadings,
      movement1: {
        count: dailyMovements.movement1,
        frequency: movement1Frequency.toFixed(2) + '%'
      },
      movement2: {
        count: dailyMovements.movement2,
        frequency: movement2Frequency.toFixed(2) + '%'
      },
      sequentialPatterns
    };
  }

  private analyzeSequentialPatterns(data: GrainSensor[]) {
    let patterns = {
      movement1AfterMovement1: 0,
      movement2AfterMovement2: 0,
      movement1AfterMovement2: 0,
      movement2AfterMovement1: 0
    };

    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i-1];

      if (!current || !previous) continue;

      if (previous?.movement_1 && current?.movement_1) patterns.movement1AfterMovement1++;
      if (previous?.movement_2 && current?.movement_2) patterns.movement2AfterMovement2++;
      if (previous?.movement_2 && current?.movement_1) patterns.movement1AfterMovement2++;
      if (previous?.movement_1 && current?.movement_2) patterns.movement2AfterMovement1++;
    }

    return patterns;
  }

  private predictNextMovements(weeklyAnalysis: any, data: GrainSensor[]) {
    if (!data || data.length === 0 || !weeklyAnalysis) {
      return {
        nextMovementProbabilities: {
          movement1: "0%",
          movement2: "0%"
        },
        confidence: "0%"
      };
    }

    // Obtener los últimos estados
    const lastReading = data[data.length - 1];
    if (!lastReading) {
      return {
        nextMovementProbabilities: {
          movement1: "0%",
          movement2: "0%"
        },
        confidence: "0%"
      };
    }

    const lastMovement1 = lastReading.movement_1 || false;
    const lastMovement2 = lastReading.movement_2 || false;

    // Evitar división por cero
    const movement1Count = weeklyAnalysis.movement1.count || 1;
    const movement2Count = weeklyAnalysis.movement2.count || 1;

    // Calcular probabilidades basadas en patrones históricos
    const totalPatterns = weeklyAnalysis.sequentialPatterns;
    const movement1Probability = lastMovement1 ? 
      (totalPatterns.movement1AfterMovement1 / movement1Count) * 100 :
      (totalPatterns.movement1AfterMovement2 / movement2Count) * 100;

    const movement2Probability = lastMovement2 ? 
      (totalPatterns.movement2AfterMovement2 / movement2Count) * 100 :
      (totalPatterns.movement2AfterMovement1 / movement1Count) * 100;

    return {
      nextMovementProbabilities: {
        movement1: movement1Probability.toFixed(2) + '%',
        movement2: movement2Probability.toFixed(2) + '%'
      },
      confidence: this.calculateConfidence(weeklyAnalysis.totalReadings)
    };
  }

  private analyzeEnvironmentalFactors(data: GrainSensor[]) {
    if (!data || data.length === 0) return null;

    let movementWithFactors = {
      highTemp: { count: 0, total: 0 },
      lowTemp: { count: 0, total: 0 },
      highHumidity: { count: 0, total: 0 },
      lowHumidity: { count: 0, total: 0 }
    };

    const tempThreshold = 30;  // °C
    const humidityThreshold = 40;  // %

    data.forEach(reading => {
      if (!reading) return;

      const hasMovement = reading.movement_1 || reading.movement_2;

      // Análisis de temperatura
      if (reading.temperature_inside > tempThreshold) {
        movementWithFactors.highTemp.total++;
        if (hasMovement) movementWithFactors.highTemp.count++;
      } else {
        movementWithFactors.lowTemp.total++;
        if (hasMovement) movementWithFactors.lowTemp.count++;
      }

      // Análisis de humedad
      if (reading.humidity > humidityThreshold) {
        movementWithFactors.highHumidity.total++;
        if (hasMovement) movementWithFactors.highHumidity.count++;
      } else {
        movementWithFactors.lowHumidity.total++;
        if (hasMovement) movementWithFactors.lowHumidity.count++;
      }
    });

    return {
      temperature: {
        highTempCorrelation: ((movementWithFactors.highTemp.count / 
          (movementWithFactors.highTemp.total || 1)) * 100).toFixed(2) + '%',
        lowTempCorrelation: ((movementWithFactors.lowTemp.count / 
          (movementWithFactors.lowTemp.total || 1)) * 100).toFixed(2) + '%'
      },
      humidity: {
        highHumidityCorrelation: ((movementWithFactors.highHumidity.count / 
          (movementWithFactors.highHumidity.total || 1)) * 100).toFixed(2) + '%',
        lowHumidityCorrelation: ((movementWithFactors.lowHumidity.count / 
          (movementWithFactors.lowHumidity.total || 1)) * 100).toFixed(2) + '%'
      }
    };
  }

  private calculateConfidence(sampleSize: number) {
    // Calcula la confianza basada en el tamaño de la muestra
    const minSamplesForHighConfidence = 100;
    return Math.min(((sampleSize || 0) / minSamplesForHighConfidence) * 100, 100).toFixed(2) + '%';
  }
}