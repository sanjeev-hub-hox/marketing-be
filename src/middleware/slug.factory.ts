import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

import { ResponseService } from '../utils';
import { SlugMiddleware } from './slug.middleware';

export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

@Injectable()
export class SlugMiddlewareFactory {
  constructor(
    private readonly configService: ConfigService,
    private responseService: ResponseService,
  ) {}
  create(customValue: string): MiddlewareFunction {
    console.log(customValue);
    return (req, res, next) => {
      const middleware = new SlugMiddleware(
        customValue,
        this.configService,
        this.responseService,
      );
      middleware.use(req, res, next);
    };
  }
}
