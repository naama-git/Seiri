import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';

import databaseConfig from './core/database.config';
import corsConfig from './core/cors.config';
import { winstonConfig } from './core/winston.config';
import { GlobalExceptionFilter } from './core/global-exception.filter';
// import { FileSystemItemModule } from './file-system-item/file-system-item.module';
// import { AuthModule } from './auth/auth.module';
// import { FileModule } from './file/file.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import throttlerConfig from './core/throttler.config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import appConfig from './core/app.config';
import { TerminusModule } from '@nestjs/terminus/dist/terminus.module';
import { HealthController } from './core/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, corsConfig, appConfig, throttlerConfig],
    }),
    TerminusModule,
    WinstonModule.forRoot(winstonConfig),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('throttler')!,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database')!,
    }),
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true, transform: true }),
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
