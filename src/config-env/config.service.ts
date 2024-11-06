import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigEnvService {
  constructor(private configService: ConfigService) {}

  getTopic(): string {
    return this.configService.get<string>('MQTT_TOPIC');
  }

  getBroker(): string {
    return this.configService.get<string>('MQTT_BROKER');
  }
}
