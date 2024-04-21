import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from 'nestjs-prisma';
import { AuthenticatedUser, Payload } from './types/payload';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async generateTokens(payload: Payload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(user: AuthenticatedUser) {
    const payload: Payload = {
      sub: user.sub,
      email: user.email,
    };
    const tokens = await this.generateTokens(payload);

    await this.updateRefreshToken(user.sub, tokens.refreshToken);

    return tokens;
  }

  async logout(user: AuthenticatedUser) {
    return this.prisma.user.update({
      where: {
        id: user.sub,
      },
      data: {
        refreshToken: null,
      },
    });
  }

  async me(user: AuthenticatedUser) {
    return this.prisma.user.findUnique({
      where: {
        id: user.sub,
      },
    });
  }

  async refresh(user: AuthenticatedUser) {
    if (!user.refreshToken) return null;

    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: user.sub,
      },
    });

    if (!existingUser || !existingUser.refreshToken) return null;

    const isRefreshTokenValid = await this.validateHashedData(
      user.refreshToken,
      existingUser.refreshToken,
    );

    if (!isRefreshTokenValid) return null;

    const payload: Payload = {
      sub: existingUser.id,
      email: existingUser.email,
    };
    const tokens = await this.generateTokens(payload);

    await this.updateRefreshToken(existingUser.id, tokens.refreshToken);

    return tokens;
  }

  async updateRefreshToken(id: string, refreshToken: string) {
    const hashedRefreshToken = await argon2.hash(refreshToken);

    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        refreshToken: hashedRefreshToken,
      },
    });
  }

  async validateHashedData(data: string, hashedData: string) {
    return argon2.verify(hashedData, data);
  }
}
