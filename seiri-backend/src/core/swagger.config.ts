import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication, apiPrefix: string): void {
  const config = new DocumentBuilder()
    .setTitle('Seiri API')
    .setDescription('The Seiri API documentation')
    .addTag('Main')
    .addServer(`/${apiPrefix}`)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('seiri-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
