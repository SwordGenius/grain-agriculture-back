import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';
import { GrainSensorService } from './grain-sensor.service';
import { ConfigEnvService } from '../config-env/config.service';
import { SensorGateway } from './gateways/grain-sensor.gateway';
import { ConcurrencyService } from '../common/concurrency/concurrency.service';

@Injectable()
export class MqttClientService implements OnModuleInit {
  private client: MqttClient;
  private topic: string;
  private brokerUrl: string;
  private readonly logger = new Logger(MqttClientService.name);
  private readonly messageQueue: string[] = [];
  private isProcessing: boolean = false;

  constructor(
    private readonly sensorService: GrainSensorService,
    private readonly configEnv: ConfigEnvService,
    private readonly sensorGateway: SensorGateway,
    private readonly concurrencyService: ConcurrencyService,
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
      // En lugar de procesar el mensaje inmediatamente, lo ponemos en cola
      this.messageQueue.push(message.toString());
      
      // Iniciamos el procesamiento si no está en curso
      if (!this.isProcessing) {
        this.processMessageQueue();
      }
    });
  }

  private async processMessageQueue() {
    if (this.isProcessing || this.messageQueue.length === 0) return;
    
    this.isProcessing = true;
    
    try {
      // Creamos un semáforo para limitar la cantidad de mensajes procesados concurrentemente
      const messageSemaphore = this.concurrencyService.createSemaphore('mqtt-messages', 5);
      
      // Procesamos los mensajes en la cola hasta un máximo de 5 concurrentemente
      while (this.messageQueue.length > 0) {
        // Tomamos hasta 5 mensajes para procesar en paralelo
        const messagesToProcess = this.messageQueue.splice(0, 5);
        
        // Procesamos los mensajes en paralelo con el límite del semáforo
        await this.concurrencyService.withConcurrencyLimit('mqtt-messages', 
          messagesToProcess.map(message => () => this.handleMessage(this.topic, message))
        );
      }
    } catch (error) {
      this.logger.error(`Error processing message queue: ${error.message}`);
    } finally {
      this.isProcessing = false;
      
      // Si llegaron nuevos mensajes mientras procesábamos, continuamos
      if (this.messageQueue.length > 0) {
        this.processMessageQueue();
      }
    }
  }

  private async handleMessage(topic: string, message: string) {
    return this.concurrencyService.withMutex('mqtt', async () => {
      this.logger.log(`Processing message from ${topic}`);
      
      try {
        let data = JSON.parse(message);
        data = {
          temperature_inside: data.temperatura,
          temperature_outside: data.temperaturaDHT,
          humidity: data.humedad,
          gas: data.valorGas,
          movement_1: data.vibracion1,
          movement_2: data.vibracion2,
          date: new Date(),
        };
        
        // Log complete data
        this.logger.log('Processed sensor data:', JSON.stringify(data, null, 2));
        
        // Emitimos los datos a través del websocket
        this.sensorGateway.emitGrainSensorData(data);
        
        // Guardamos en BD si es el momento adecuado
        if (data.date.getMinutes() === 0 && data.date.getSeconds() === 0) {
          await this.sensorService.create(data);
          this.logger.log('Sensor data saved to database');
        }
      } catch (error) {
        this.logger.error(`Failed to handle message: ${error.message}`);
        throw error;
      }
    });
  }
}