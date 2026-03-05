import { HttpException, HttpStatus } from '@nestjs/common';

export class BussinessException extends HttpException {
  constructor(
    message: string | string[],
    status: HttpStatus,
    public readonly detailedMessage?: string,
    public readonly func?: string,
    public readonly location?: string,
  ) {
    super({ message, detailedMessage, func, location }, status);
  }
}
