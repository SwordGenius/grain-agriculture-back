import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GrainSensor } from '../grain-sensor/interfaces/grainSensor.interface';
import { Statistics, Limits } from './interfaces/statistics.interface';
import { ZTableUtil } from './z-table.util';
import { StatisticsUtil } from './statistics.util';
import { MovementPredictionUtil} from './movement-prediction.util';

@Injectable()
export class StatisticsService {
  private readonly limits: Limits = {
    temperature: { min: 10, max: 30 },
    humidity: { min: 8, max: 14 },
    gas: { min: 0, max: 800 }
  };

  constructor(
    @InjectModel('GrainSensor')
    private readonly grainSensorModel: Model<GrainSensor>,
  ) {
    ZTableUtil.initialize();
  }
  async predictMovement(): Promise<number> {
    const data = await this.grainSensorModel.find().exec();
    return MovementPredictionUtil.predictMovement(data);
  }

  async calculateStatistics(): Promise<{ stats: Statistics; limits: Limits }> {
    const data = await this.grainSensorModel.find().exec();

    const temperaturesOutside = data.map(record => record.temperature_outside);
    const temperaturesInside = data.map(record => record.temperature_inside);
    const humidities = data.map(record => record.humidity);
    const gases = data.map(record => record.gas);

    const stats = {
      temperature_outside: this.calculateMetrics(temperaturesOutside, this.limits.temperature),
      temperature_inside: this.calculateMetrics(temperaturesInside, this.limits.temperature),
      humidity: this.calculateMetrics(humidities, this.limits.humidity),
      gas: this.calculateMetrics(gases, this.limits.gas)
    };

    return { stats, limits: this.limits };
  }

  private calculateMetrics(data: number[], limits: { min: number; max: number }) {
    const average = StatisticsUtil.calculateAverage(data);
    const stdDev = StatisticsUtil.calculateStandardDeviation(data, average);

    const zMin = StatisticsUtil.calculateZScore(limits.min, average, stdDev);
    const zMax = StatisticsUtil.calculateZScore(limits.max, average, stdDev);

    return {
      average,
      std_dev: stdDev,
      probabilities: {
        below_min: ZTableUtil.findClosestProbability(zMin) * 100,
        above_max: (1 - ZTableUtil.findClosestProbability(zMax)) * 100,
        within_limits: (ZTableUtil.findClosestProbability(zMax) - ZTableUtil.findClosestProbability(zMin)) * 100
      }
    };
  }
}