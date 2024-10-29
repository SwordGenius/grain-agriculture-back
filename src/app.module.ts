import { Module } from '@nestjs/common';
import { configDotenv } from 'dotenv';
configDotenv();
import { MongooseModule } from '@nestjs/mongoose';
import { GrainSensorModule } from './grain-sensor/grain-sensor.module';


@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URI), GrainSensorModule],
})
export class AppModule {}
