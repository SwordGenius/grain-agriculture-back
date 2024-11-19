import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StadisticsSchema } from './schemas/stadistics.schema';
import { StadisticsController } from './stadistics.controller';
import { StadisticsService } from './stadistics.service';
import { StadisticsGateway } from './gateways/stadistics.gateway';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Stadistic', schema: StadisticsSchema }]),
    UsersModule,
  ],
  controllers: [StadisticsController],
  providers: [StadisticsService, StadisticsGateway]
})
export class StadisticsModule {}
