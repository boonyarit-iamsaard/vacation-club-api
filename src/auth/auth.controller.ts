import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserEntity } from '../shared/entities/user.entity';
import { AuthService } from './auth.service';
import { AccessTokenAuthGuard } from './guards/access-token-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshTokenAuthGuard } from './guards/refresh-token-auth.guard';
import { AuthenticatedRequest } from './interfaces/authenticated-request.interface';

@Controller({ version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: AuthenticatedRequest) {
    return this.authService.login(req.user);
  }

  @UseGuards(AccessTokenAuthGuard)
  @Put('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: AuthenticatedRequest) {
    if (await this.authService.logout(req.user)) {
      return;
    }

    throw new ForbiddenException();
  }

  @UseGuards(RefreshTokenAuthGuard)
  @Post('refresh')
  async refresh(@Req() req: AuthenticatedRequest) {
    const tokens = await this.authService.refresh(req.user);

    if (!tokens) {
      throw new ForbiddenException();
    }

    return tokens;
  }

  @UseGuards(AccessTokenAuthGuard)
  @Get('me')
  async me(@Req() req: AuthenticatedRequest) {
    const user = await this.authService.me(req.user);

    if (!user) {
      throw new UnauthorizedException();
    }

    return new UserEntity(user);
  }
}
