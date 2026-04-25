import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException } from './exception.model';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException ? exception.message : 'Internal server error';

    const stack = exception instanceof HttpException ? exception.stack : 'no data about exception stack';

    const stackLines = stack?.split('\n') || [];
    const callerLine = stackLines.find((line) => line.includes('.ts:'));
    const match = callerLine?.match(/at\s+([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\s\(/);
    const className = match ? match[1] : 'UnknownClass';
    const funcName = match ? match[2] : 'UnknownFunction';

    let internalInfo = {};
    if (exception instanceof BusinessException) {
      internalInfo = {
        detailedMessage: exception.detailedMessage,
        func: funcName,
        location: className,
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
