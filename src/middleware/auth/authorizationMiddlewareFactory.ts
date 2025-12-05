import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

import { ResponseService } from '../../utils';
import { AuthorizationMiddleware } from './authorization.middleware';
import { RedisService } from 'ampersand-common-module';

export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

@Injectable()
export class AuthorizationMiddlewareFactory {
  constructor(
    private readonly configService: ConfigService,
    private responseService: ResponseService,
  ) {}
  create(routePermissions: string, redisInstance: RedisService): MiddlewareFunction {
    return (req, res, next) => {
      const middleware = new AuthorizationMiddleware(routePermissions, redisInstance);
      middleware.use(req, res, next);
    };
  }
}
