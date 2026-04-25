import { Catch, ExceptionFilter, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response, Request } from 'express';
import { PostgreError } from './exception.model';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('DatabaseExceptionFilter');

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const driverError = (exception as unknown as PostgreError).driverError;

    const stackLines = exception.stack?.split('\n') || [];
    const callerLine = stackLines.find((line) => line.includes('.ts:'));
    const match = callerLine?.match(/at\s+([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\s\(/);
    const className = match ? match[1] : 'UnknownClass';
    const funcName = match ? match[2] : 'UnknownFunction';

    this.logger.error({
      message: `${request.method} ${request.url} - Database Error`,
      context: 'DatabaseExceptionFilter',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      stack: exception.stack,
      internalInfo: {
        dbCode: driverError?.code,
        dbDetail: driverError?.detail,
        func: funcName,
        location: className,
      },
    });

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Database operation failed',
    });
  }
}
