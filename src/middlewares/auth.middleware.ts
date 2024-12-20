import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { Socket } from 'socket.io';


export const getToken = (token: string) => {
  try {
    const payload: JwtPayload | string = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    );
    if (payload === 'jwt expired') {
      return 'Token expirado';
    }
    if (payload === 'invalid token') {
      return 'Token inválido';
    }
    return payload;
  } catch (error) {
    return error;
  }
}

export const getTokenWs = (client: Socket) => {
  try {
    const token = client.handshake.headers['cookie'].split('=')[1] as string;
    console.log(token);
    const payload: JwtPayload | string = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    );
    if (payload === 'jwt expired') {
      client.disconnect();
    }
    if (payload === 'invalid token') {
      client.disconnect()
    }
    
  } catch (error) {
    client.disconnect();
    console.log(error);
  }
}

export const WsMiddleware = (client: Socket) => {
  try {
    getTokenWs(client);
  } catch (error) {
    client.disconnect()
    console.log(error);
  }
}
