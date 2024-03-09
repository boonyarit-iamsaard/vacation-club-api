import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from 'nestjs-prisma';

@Module({
  imports: [
    ConfigModule,
    PrismaModule.forRootAsync({
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        explicitConnect: false,
        prismaOptions: {
          datasources: {
            db: {
              url: configService.get<string>('DATABASE_URL'),
            },
          },
          log: ['info', 'query'],
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
