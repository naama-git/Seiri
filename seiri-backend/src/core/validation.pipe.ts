import { ValidationPipe, BadRequestException } from '@nestjs/common';

export const globalValidationPipe = new ValidationPipe({
  whitelist: true,

  forbidNonWhitelisted: true,

  transform: true,

  transformOptions: {
    enableImplicitConversion: true,
  },

  exceptionFactory: (errors) => {
    const messages = errors.map(
      (err) =>
        `${err.property} has wrong value: ${Object.values(err.constraints || {}).join(', ')}`,
    );
    return new BadRequestException(messages);
  },
});
