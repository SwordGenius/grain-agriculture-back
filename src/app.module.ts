import { Module } from '@nestjs/common';
import { configDotenv } from 'dotenv';
configDotenv();
import { MongooseModule } from '@nestjs/mongoose';
import { StadisticsModule } from './stadistics/stadistics.module';
import { GrainSensorModule } from './grain-sensor/grain-sensor.module';


@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URI), GrainSensorModule, StadisticsModule],
  
})
export class AppModule {}
