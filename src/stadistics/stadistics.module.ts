import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StadisticsSchema } from './schemas/stadistics.schema';
import { StadisticsController } from './stadistics.controller';
import { StadisticsService } from './stadistics.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Stadistic', schema: StadisticsSchema }]),
  ],
  controllers: [StadisticsController],
  providers: [StadisticsService]
})
export class StadisticsModule {}
