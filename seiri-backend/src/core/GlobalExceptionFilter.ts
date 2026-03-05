import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BussinessException } from './exception.model';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    let internalInfo = {};
    if (exception instanceof BussinessException) {
      internalInfo = {
        detailedMessage: exception.detailedMessage,
        func: exception.func,
        location: exception.location,
      };
    }

    this.logger.error({
      message: `${request.method} ${request.url} - ${message}`,
      context: 'ExceptionFilter',
      status: status,
      stack: exception instanceof Error ? exception.stack : undefined,
      internalInfo,
    });

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
