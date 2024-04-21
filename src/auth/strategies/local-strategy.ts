import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { AuthenticatedUser } from '../types/payload';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(
    username: string,
    password: string,
  ): Promise<AuthenticatedUser> {
    const user = await this.authService.findUserByEmail(username);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await this.authService.validateHashedData(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    return {
      sub: user.id,
      email: user.email,
    };
  }
}
