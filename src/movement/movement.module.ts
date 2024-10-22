import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MovementSchema } from './schemas/movement.schema';
import { MovementService } from './movement.service';
import { MovementController } from './movement.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Movement', schema: MovementSchema }]),
  ],
  providers: [MovementService],
  controllers: [MovementController],
})
export class MovementModule {}
