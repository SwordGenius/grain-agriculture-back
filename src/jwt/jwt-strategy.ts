import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import * as process from 'node:process';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
          jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => {
              return req?.cookies?.access_token;
          } ]),
          ignoreExpiration: false,
          secretOrKey: process.env.JWT_SECRET,
      });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
