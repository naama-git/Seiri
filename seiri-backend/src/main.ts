import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './core/swagger.config';
import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston/dist/winston.constants';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  const corsOptions = configService.get<CorsOptions>('cors');
  if (corsOptions) {
    app.enableCors(corsOptions);
  }
  setupSwagger(app);
  app.use(helmet());
  const apiPrefix = configService.get<string>('api_prefix') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);
  const port = configService.get<number>('port') || 3000;
  await app.listen(port);
  console.log(
    `Server ready at http://localhost:${port}/${apiPrefix}/\n swagger at http://localhost:${port}/${apiPrefix}/seiri-docs`,
  );
}
void bootstrap();
