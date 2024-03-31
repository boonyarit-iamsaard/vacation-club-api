import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(username: string, password: string) {
    const user = await this.authService.validateUser(username);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isValid = await this.authService.validatePassword(
      password,
      user.password,
    );

    if (!isValid) {
      throw new UnauthorizedException();
    }

    return {
      sub: user.id,
      email: user.email,
    };
  }
}
