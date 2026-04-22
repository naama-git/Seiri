import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string | string[],
    status: HttpStatus,
    public readonly detailedMessage?: string,
  ) {
    super({ message, detailedMessage }, status);
  }
}

export interface PostgreError extends Error {
  driverError: {
    code: string;
    detail: string;
  };
}
