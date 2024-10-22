import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movement } from './interfaces/movement.interface';
import { CreateMovementDto } from './dto/create-movement.dto';

@Injectable()
export class MovementService {
  constructor(
    @InjectModel('Movement') private readonly movementModel: Model<Movement>,
  ) {}

  async create(createMovementDto: CreateMovementDto): Promise<Movement> {
    const createdMovement = new this.movementModel(createMovementDto);
    return createdMovement.save();
  }

  async findAll(limit: number, page: number): Promise<Movement[]> {
    if (limit && page) {
      return this.movementModel
        .find()
        .limit(limit)
        .skip(page * (limit - 1))
        .exec();
    }
    return this.movementModel.find().exec();
  }

  async findOne(id: string): Promise<Movement> {
    return this.movementModel.findById(id).exec();
  }

  async update(
    id: string,
    updateMovementDto: CreateMovementDto,
  ): Promise<Movement> {
    return this.movementModel
      .findByIdAndUpdate(id, updateMovementDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<any> {
    return this.movementModel.deleteOne({ _id: id }).exec();
  }
}
