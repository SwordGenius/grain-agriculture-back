import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { getToken, getTokenWs } from '../../middlewares/auth.middleware';
import { IGetToken } from '../interfaces/IGetToken';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly userService: UsersService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }
    console.log(context.getType());

    if (context.getType() === 'http') {
      const req = context.switchToHttp().getRequest<Request>();
      context.switchToHttp().getResponse<Response>();
      const token = req.cookies['access_token'];
      if (!token || Array.isArray(token)) {
        throw new UnauthorizedException('No token provided');
      }

      const user: IGetToken = getToken(token.token);

      if (typeof user === 'string') {
        throw new UnauthorizedException('Invalid token');
      }

      const { sub } = user;

      const userFound = await this.userService.getUserById(sub);

      if (!userFound) {
        throw new UnauthorizedException('User not found');
      }

      req.body.payload = userFound;

      return true;
    } else if (context.getType() === 'ws') {
      const client = context.switchToWs().getClient();
      const user: IGetToken = <IGetToken>getTokenWs(client);

      const { sub } = user;

      const userFound = await this.userService.getUserById(sub);

      if (!userFound) {
        throw new UnauthorizedException('User not found');
      }

      client.payload = userFound;

      console.log(client.payload);

      return true;
    }
  }
}
