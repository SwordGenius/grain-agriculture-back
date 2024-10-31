import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';
import { GrainSensorService } from './grain-sensor.service';
import * as process from 'node:process'; // Servicio CRUD donde guardarás los datos

@Injectable()
export class MqttClientService implements OnModuleInit {
  private client: MqttClient;
  private readonly topic = process.env.MQTT_TOPIC;
  private readonly brokerUrl = process.env.MQTT_BROKER;
  private readonly logger = new Logger(MqttClientService.name);

  constructor(private readonly sensorService: GrainSensorService) {}
  onModuleInit() {
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
      await this.sensorService.create(data);
      this.logger.log('Sensor data saved to database');
    } catch (error) {
      this.logger.error(`Failed to handle message: ${error.message}`);
    }
  }
}
