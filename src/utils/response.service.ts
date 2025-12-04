import { Injectable, Res } from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from './logger.service';

@Injectable()
export class ResponseService {
  private loggerService: LoggerService;
  constructor() {
    this.loggerService = new LoggerService();
  }
  sendResponse(
    @Res() res: Response,
    statusCode: number,
    data: any,
    message: string,
  ) {
    this.loggerService.log(message, {
      status: statusCode,
      data: data,
    });
    res.status(statusCode).json({
      status: statusCode,
      data: data,
      message: message,
    });
  }

  errorResponse(
    @Res() res: Response,
    statusCode: number,
    message: string,
    cause?: string | Record<string, unknown>[] | unknown,
  ) {
    if (cause) {
      res.status(statusCode).json({
        errorCode: statusCode,
        errorMessage: message,
        error: cause,
      });
    } else {
      res.status(statusCode).json({
        errorCode: statusCode,
        errorMessage: message,
      });
    }
  }
}
