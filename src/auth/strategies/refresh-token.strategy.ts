import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser, TokenPayload } from '../types/payload';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.REFRESH_TOKEN_SECRET,
      passReqToCallback: true,
    });
  }

  validate(request: Request, payload: TokenPayload): AuthenticatedUser {
    const refreshToken = request
      .get('Authorization')
      ?.replace('Bearer ', '')
      .trim();

    return {
      sub: payload.sub,
      email: payload.email,
      refreshToken,
    };
  }
}
