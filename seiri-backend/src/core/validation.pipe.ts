import { ValidationPipe, HttpStatus } from '@nestjs/common';
import { BusinessException } from './exception.model';

export const globalValidationPipe = new ValidationPipe({
  whitelist: true,

  forbidNonWhitelisted: true,

  transform: true,

  transformOptions: {
    enableImplicitConversion: true,
  },

  exceptionFactory: (validationErrors) => {
    const messages = validationErrors
      .map((error) => {
        const constraints = Object.values(error.constraints || {}).join(', ');
        return `${error.property}: ${constraints}`;
      })
      .join('; ');

    return new BusinessException(
      'Validation Failed',
      HttpStatus.BAD_REQUEST,
      messages,
      'GlobalValidationPipe',
      '',
    );
  },
});
