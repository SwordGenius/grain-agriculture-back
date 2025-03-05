// src/app.module.ts
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { StadisticsModule } from './stadistics/stadistics.module';
import { GrainSensorModule } from './grain-sensor/grain-sensor.module';
import { configDotenv } from 'dotenv';
import { ConfigEnvService } from './config-env/config.service';
import { ConcurrencyModule } from './common/concurrency/concurrency.module';

configDotenv();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
    GrainSensorModule,
    StadisticsModule,
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ConcurrencyModule,
  ],
  providers: [ConfigEnvService],
  exports: [ConfigEnvService],
})
export class AppModule {}