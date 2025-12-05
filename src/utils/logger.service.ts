import { Injectable } from '@nestjs/common';
import { createLogger, transports, format } from 'winston';

@Injectable()
export class LoggerService {
  //   createLogger() {

  private readonly logger = createLogger({
    transports: [
      new transports.Console(),
      // Add more transports as needed, e.g., file transport
      new transports.File({ filename: 'combined.log' }),
    ],
    format: format.combine(format.timestamp(), format.json()),
  });

  log(message: string, meta?: Record<string, any>) {
    this.logger.log('info', message, meta);
  }

  error(message: string, trace: string, meta?: Record<string, any>) {
    this.logger.error(message, { trace, ...meta });
  }

  warn(message: string, meta?: Record<string, any>) {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: Record<string, any>) {
    this.logger.debug(message, meta);
  }
}
