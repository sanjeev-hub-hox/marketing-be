import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { LoggerService, ResponseService } from '../utils';

@Catch()
export class ErrorHandler implements ExceptionFilter {
  private responseService: ResponseService;
  private loggerService: LoggerService;
  constructor() {
    this.loggerService = new LoggerService();
    this.responseService = new ResponseService();
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    console.log('This is the exception : ', exception);
    let statusCode: number,
      message: any,
      stack: string,
      cause: string | Record<string, unknown>[] | unknown;
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = (exception.getResponse() as any)?.message ?? exception.getResponse();
      stack = exception.stack;
      cause = exception?.cause ?? '';
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      cause = exception.toString()
    }

    this.loggerService.error(message, stack);
    this.responseService.errorResponse(response, statusCode, message, cause);
  }
}
