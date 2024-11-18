import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { MovementAnalysisService } from './analysis.service';
import { GrainSensorSchema } from '../grain-sensor/schemas/grainSensor.schema';
import { ZTableUtil } from './z-table.util';
import { StatisticsUtil } from './statistics.util';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'GrainSensor', schema: GrainSensorSchema }
    ])
  ],
  controllers: [StatisticsController],
  providers: [
    StatisticsService,
    MovementAnalysisService,
    ZTableUtil,
    StatisticsUtil
  ],
  exports: [StatisticsService] // Por si necesitas usar el servicio en otros módulos
})
export class StatisticsModule {}