import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect, SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Stadistics} from '../interfaces/stadistics.interface';
import { UseGuards } from '@nestjs/common';
import { UserGuard } from '../../users/guards/user.guard';


@WebSocketGateway(3002, {
  cors: true,
  namespace: 'wss-stadistics',
  transports: ['websocket'],
})
@UseGuards(UserGuard)

export class StadisticsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('WebSocket Stadistics gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
  emitStadisticsData(data: Stadistics) {
    this.server.emit('stadisticsData', data);
  }
  @SubscribeMessage('stadisticsData')
  handleStadisticsData(client: Socket, data: Stadistics) {
    this.server.emit('stadisticsData', data);
  }
}