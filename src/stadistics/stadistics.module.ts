import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatisticsController } from './stadistics.controller';
import { StatisticsService } from './stadistics.service';
import { GrainSensorSchema } from '../grain-sensor/schemas/grainSensor.schema';
import { ZTableUtil } from './z-table.util';
import { StatisticsUtil } from './statistics.util';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'GrainSensor', schema: GrainSensorSchema }
    ]), UsersModule
  ],
  controllers: [StatisticsController],
  providers: [
    StatisticsService,
    ZTableUtil,
    StatisticsUtil,
  ],
  exports: [StatisticsService]
})
export class StadisticsModule {}