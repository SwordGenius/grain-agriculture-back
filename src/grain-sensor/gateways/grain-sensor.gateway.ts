import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GrainSensor} from '../interfaces/grainSensor.interface';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/auth.guard';

@WebSocketGateway({ cors: true })
@UseGuards(JwtAuthGuard)
export class SensorGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
  emitGrainSensorData(data: GrainSensor) {
    this.server.emit('grainSensorData', data);
  }
}
