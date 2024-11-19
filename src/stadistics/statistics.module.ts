import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
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
    ZTableUtil,
    StatisticsUtil
  ],
  exports: [StatisticsService] 
})
export class StatisticsModule {}