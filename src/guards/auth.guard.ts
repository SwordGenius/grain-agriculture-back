import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    if (context.getType() === 'ws') {
      const client = context.switchToWs().getClient();
      const token = client.handshake.headers.cookie?.split('=')[1];

      if (!token) throw new WsException('Unauthorized');

      return super.canActivate(context);
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: { name: string; }) {
    if (err || !user) {
      if (info && info.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Your session has expired. Please log in again.',
        );
      } else if (info && info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token. Please log in again.');
      }
      throw err || new UnauthorizedException();
    }
    return user;
  }

}
