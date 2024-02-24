import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const user = configService.get<string>('DATABASE_USER');
        const password = configService.get<string>('DATABASE_PASSWORD');
        const name = configService.get<string>('DATABASE_NAME');
        const host = configService.get<string>('DATABASE_HOST');

        return {
          uri: `mongodb+srv://${user}:${password}@${host}/${name}?retryWrites=true&w=majority&appName=${name}`,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
