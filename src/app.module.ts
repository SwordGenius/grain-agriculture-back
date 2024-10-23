import { Module } from '@nestjs/common';
import { configDotenv } from 'dotenv';
configDotenv();
import { MongooseModule } from '@nestjs/mongoose';
import { StadisticsModule } from './stadistics/stadistics.module';


@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URI), StadisticsModule],
})
export class AppModule {}
