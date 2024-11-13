import { Injectable } from '@nestjs/common';
import { GrainSensor } from './interfaces/grainSensor.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateGrainSensorDto } from './dto/create-grain-sensor.dto';
import { SensorGateway} from './gateways/grain-sensor.gateway';

@Injectable()
export class GrainSensorService {
  constructor(
    @InjectModel('GrainSensor')
    private readonly grainSensorModel: Model<GrainSensor>,
    private readonly grainSensorGateway: SensorGateway,
  ) {}

  async create(createGrainSensor: CreateGrainSensorDto) : Promise<GrainSensor> {
    const createdGrainSensor = new this.grainSensorModel(createGrainSensor);
    let result: GrainSensor;
    if (
      createGrainSensor.date.getMinutes() === 0 &&
      createGrainSensor.date.getSeconds() === 0
    )
      result = await createdGrainSensor.save();
    this.grainSensorGateway.emitGrainSensorData(createGrainSensor);
    return result;
  }

  async findAll(limit: number, skip: number): Promise<GrainSensor[]> {
    if (limit && skip) {
      return this.grainSensorModel.find().limit(limit).skip(skip).exec();
    }
    return this.grainSensorModel.find().exec();
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
