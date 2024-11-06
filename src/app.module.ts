import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { configDotenv } from 'dotenv';
configDotenv();
import { StadisticsModule } from './stadistics/stadistics.module';
import { GrainSensorModule } from './grain-sensor/grain-sensor.module';


@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
    GrainSensorModule,
    StadisticsModule,
    UsersModule,
  ]
})
export class AppModule {}
