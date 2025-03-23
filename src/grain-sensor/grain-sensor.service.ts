import { Injectable } from '@nestjs/common';
import { GrainSensor } from './interfaces/grainSensor.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateGrainSensorDto } from './dto/create-grain-sensor.dto';

@Injectable()
export class GrainSensorService {
  constructor(
    @InjectModel('GrainSensor')
    private readonly grainSensorModel: Model<GrainSensor>,
  ) {}

  async create(createGrainSensor: CreateGrainSensorDto) : Promise<GrainSensor> {
    const createdGrainSensor = new this.grainSensorModel(createGrainSensor);
    return await createdGrainSensor.save();
  }

  async findAll(limit?: number, page?: number): Promise<any[]> {
    try {
      let query = this.grainSensorModel.find().sort({ date: -1 });
      
      if (limit && page) {
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
      } else if (limit) {
        query = query.limit(limit);
      }
      
      const results = await query.exec();
      
      // If no results, return empty array instead of throwing 404
      return results || [];
    } catch (error) {
      console.error('Error fetching grain sensor data:', error);
      return []; // Return empty array instead of throwing error
    }
  }

  async findOne(id: string): Promise<GrainSensor> {
    return this.grainSensorModel.findById(id).exec();
  }

  async update(
    id: string,
    createGrainSensor: CreateGrainSensorDto,
  ): Promise<GrainSensor> {
    return this.grainSensorModel
      .findByIdAndUpdate(id, createGrainSensor, { new: true })
      .exec();
  }
  
  async delete(id: string): Promise<GrainSensor> {
    return this.grainSensorModel.findByIdAndDelete(id).exec();
  }

}
