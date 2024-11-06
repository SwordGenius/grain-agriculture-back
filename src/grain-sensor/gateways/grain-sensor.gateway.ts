import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GrainSensor} from '../interfaces/grainSensor.interface';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/auth.guard';

@WebSocketGateway(3002, {
  cors: true,
  namespace: 'grain-sensor',
  transports: ['websocket'],
})
@UseGuards(JwtAuthGuard)
export class SensorGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('WebSocket Grain Sensor gateway initialized');
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
  @SubscribeMessage('grainSensorData')
  handleGrainSensorData(client: Socket, data: GrainSensor) {
    this.server.emit('grainSensorData', data);
  }
}
