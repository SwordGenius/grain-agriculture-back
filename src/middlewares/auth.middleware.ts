import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { UnauthorizedException } from '@nestjs/common';



export const getToken = (token: string) => {
  try {
    console.log(token);
    const payload: JwtPayload | string = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    );
    console.log(payload);
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
    const token = client.handshake.headers['cookie'].split('=')[1];
    console.log(token);
    const payload: JwtPayload | string = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    );
    console.log(payload);
    if (payload === 'jwt expired') {
      return 'Token expirado';
    }
    if (payload === 'invalid token') {
      return 'Token inválido';
    }
    return payload;
  } catch (error) {
    throw new UnauthorizedException(error);
  }
}

export const WsMiddleware = async () => {
  return async (client: Socket, next: (err?: Error) => void) => {
    try {
      getTokenWs(client);
      next();
    } catch (error) {
      next(new Error(error));
    }
  }
}