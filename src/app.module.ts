import { Module } from '@nestjs/common';
import { configDotenv } from 'dotenv';
configDotenv();
import { MongooseModule } from '@nestjs/mongoose';
import { MovementModule } from './movement/movement.module';
import * as process from 'node:process';

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URI), MovementModule],
})
export class AppModule {}
