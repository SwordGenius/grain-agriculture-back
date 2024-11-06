import { Module } from '@nestjs/common';
import { GrainSensorService } from './grain-sensor.service';
import { GrainSensorController } from './grain-sensor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GrainSensorSchema } from './schemas/grainSensor.schema';
import { MqttClientService } from './mqtt-client.service';
import { SensorGateway } from './gateways/grain-sensor.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'GrainSensor', schema: GrainSensorSchema },
    ]),
  ],
  providers: [GrainSensorService, MqttClientService, SensorGateway],
  controllers: [GrainSensorController],
  exports: [GrainSensorService, MqttClientService],
})
export class GrainSensorModule {}
