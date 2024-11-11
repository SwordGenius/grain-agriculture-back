import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';
import { GrainSensorService } from './grain-sensor.service';
import { ConfigEnvService } from '../config-env/config.service';

@Injectable()
export class MqttClientService implements OnModuleInit {
  private client: MqttClient;
  private topic: string;
  private brokerUrl: string;
  private readonly logger = new Logger(MqttClientService.name);

  constructor(
    private readonly sensorService: GrainSensorService,
    private readonly configEnv: ConfigEnvService
  ) {}

  onModuleInit() {
    this.topic = this.configEnv.getTopic();
    this.brokerUrl = this.configEnv.getBroker();
    this.connectToBroker();
  }

  private connectToBroker() {
    this.client = connect(this.brokerUrl);

    this.client.on('connect', () => {
      this.logger.log('Connected to MQTT broker');

      this.client.subscribe(this.topic, (err) => {
        if (err) {
          this.logger.error('Failed to subscribe to topic: ' + this.topic);
        } else {
          this.logger.log('Subscribed to topic: sensorData');
        }
      });
    });

    this.client.on('error', (error) => {
      this.logger.error(`MQTT connection error: ${error.message}`);
    });

    this.client.on('message', (topic, message) => {
      this.handleMessage(topic, message.toString());
    });
  }

  private async handleMessage(topic: string, message: string) {
    this.logger.log(`Received message from ${topic}: ${message}`);
    try {
      let data = JSON.parse(message);
      data = {
        ...data,
        date: new Date(),
      };
      if (data.date.getMinutes() === 0 && data.date.getSeconds() === 0)
        await this.sensorService.create(data);
      this.logger.log('Sensor data saved to database');
    } catch (error) {
      this.logger.error(`Failed to handle message: ${error.message}`);
    }
  }
}