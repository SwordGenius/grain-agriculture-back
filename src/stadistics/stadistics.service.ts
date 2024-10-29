import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stadistics } from './interfaces/stadistics.interface';
import { CreateStadisticsDto } from './dto/create-stadistics.dto';

@Injectable()
export class StadisticsService {
  constructor(@InjectModel('Stadistic') private readonly stadisticModel: Model<Stadistics>,
  ) {}

  async create (createStadisticDto: CreateStadisticsDto): Promise<Stadistics> {
    const createdStadistic = new this.stadisticModel(createStadisticDto);
    return createdStadistic.save();
  }

  async findAll(limit: number, page: number): Promise<Stadistics[]> {
    if (limit && page) {
      return this.stadisticModel
        .find()
        .limit(limit)
        .skip(page * (limit - 1))
        .exec();
    }
    return this.stadisticModel.find().exec();
  }

  async findOne(id: string) : Promise<Stadistics> {
    return this.stadisticModel.findById(id).exec();
  }

  async update(
    id: string,
    updateStadisticDto: CreateStadisticsDto,
  ): Promise<Stadistics> {
    return this.stadisticModel
      .findByIdAndUpdate(id, updateStadisticDto, { new: true })
      .exec();
  }

  async delete (id: string) : Promise<any> {
    return this.stadisticModel.findByIdAndDelete(id).exec();
  }
}
