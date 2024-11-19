import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';

import { CreateGrainSensorDto } from '../dto/create-grain-sensor.dto';
import { UserGuard } from '../../users/guards/user.guard';

@WebSocketGateway(3002, {
  cors: true,
  namespace: 'grain-sensor',
  transports: ['websocket'],
})
@UseGuards(UserGuard)
export class SensorGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit(client: Socket) {

    console.log('WebSocket Grain Sensor gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  emitGrainSensorData(data: CreateGrainSensorDto) {
    this.server.emit('grainSensorData', data);
  }
  @SubscribeMessage('grainSensorData')
  handleGrainSensorData(client: Socket, data: CreateGrainSensorDto) {
    this.server.emit('grainSensorData', data);
  }
}
