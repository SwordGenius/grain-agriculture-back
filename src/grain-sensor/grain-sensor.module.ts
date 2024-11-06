import { Module } from '@nestjs/common';
import { GrainSensorService } from './grain-sensor.service';
import { GrainSensorController } from './grain-sensor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GrainSensorSchema } from './schemas/grainSensor.schema';
import { MqttClientService } from './mqtt-client.service';
import { SensorGateway } from './gateways/grain-sensor.gateway';
import { ConfigEnvService } from '../config-env/config.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'GrainSensor', schema: GrainSensorSchema },
    ]),
  ],
  providers: [
    GrainSensorService,
    MqttClientService,
    SensorGateway,
    ConfigEnvService,
  ],
  controllers: [GrainSensorController],
  exports: [GrainSensorService, MqttClientService, ConfigEnvService],
})
export class GrainSensorModule {}
