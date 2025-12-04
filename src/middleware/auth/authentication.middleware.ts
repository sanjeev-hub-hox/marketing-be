// token-validation.middleware.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'ampersand-common-module';
import axios from 'axios';
import { NextFunction, Request, Response } from 'express';

import { LoggerService, ResponseService } from '../../utils';
import { EAuthType } from './auth.type';

export class Keycloak {
  public envFetcher: ConfigService;
  constructor(configServiceInstance: ConfigService) {
    this.envFetcher = configServiceInstance;
  }

  getKeyCloakCredentials(req: Request): {
    baseUrl: string;
    realm: string;
    clientId: string;
    clientSecret: string;
    portal: string;
  } {
    const credentials =
      req.query?.platform === 'app'
        ? {
            baseUrl: this.envFetcher.get('EXTERNAL_KEYCLOAK_BASE_URL'),
            realm: this.envFetcher.get('EXTERNAL_ACTIVE_REALM'),
            clientId: this.envFetcher.get('EXTERNAL_CLIENT_ID'),
            clientSecret: this.envFetcher.get('EXTERNAL_CLIENT_SECRET'),
            portal: this.envFetcher.get('EXTERNAL_KEYCLOCK_PORTAL'),
          }
        : {
            baseUrl: this.envFetcher.get('INTERNAL_KEYCLOAK_BASE_URL'),
            realm: this.envFetcher.get('INTERNAL_ACTIVE_REALM'),
            clientId: this.envFetcher.get('INTERNAL_CLIENT_ID'),
            clientSecret: this.envFetcher.get('INTERNAL_CLIENT_SECRET'),
            portal: this.envFetcher.get('INTERNAL_KEYCLOCK_PORTAL'),
          };
    if (req.query?.platform) {
      delete req.query?.platform;
    }

    return credentials;
  }
}

@Injectable()
export class AuthenticationMiddleware extends Keycloak {
  configService: ConfigService;
  responseService: ResponseService;
  loggerService: LoggerService;
  redisInstance: RedisService;

  constructor(
    configService: ConfigService,
    responseService: ResponseService,
    loggerService: LoggerService,
    redisInstance: RedisService,
  ) {
    super(configService);
    this.configService = configService;
    this.responseService = responseService;
    this.loggerService = loggerService;
    this.redisInstance = redisInstance;
  }

  //TODO: This function is repeated in authorization middleware as well, in future eliminate redundancy
  private isAppRequest(req: Request): boolean {
    let isAppRequest = false;
    const queryString = req.url.split('?')[1];
    if (queryString) {
      const queryStringParams = queryString.split('&');
      for (const param of queryStringParams) {
        const [key, value] = param.split('=');
        if (key === 'platform' && value === 'app') {
          isAppRequest = true;
          break;
        }
      }
    }
    return isAppRequest;
  }

  async use(
    req: Request,
    res: Response,
    next: NextFunction,
    options: { authorize: boolean },
  ) {
    // Extract the token from the Authorization header
    this.loggerService.log(`Executing authentication`);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new HttpException(
        'Authorization header missing',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new HttpException('Token not found', HttpStatus.UNAUTHORIZED);
    }

    const authType =
      this.configService.get<string>('AUTH_TYPE') === EAuthType.REDIS
        ? EAuthType.REDIS
        : EAuthType.SESSION;

    // Perform token validation using Axios
    try {
      const { baseUrl, realm, clientId, clientSecret, portal } =
        this.getKeyCloakCredentials(req);

      const response = await axios.post(
        `${baseUrl}/${realm}/${portal}/protocol/openid-connect/token/introspect`,
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          token: token as string, // Assert token as string
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          // Ensure that Axios follows redirects
          // maxRedirects: 5,
          // Set a timeout for the request (optional)
          // timeout: 5000, // 5 seconds timeout
        },
      );

      if (!response.data.active) {
        authType === EAuthType.REDIS
          ? await this.redisInstance.deleteData(token)
          : delete req?.session[token];
        return this.responseService.sendResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          { status: response.data.active },
          'Unauthorized : Invalid token',
        );
      }

      if (this.isAppRequest(req) && options.authorize) {
        req.body.userInfo = {
          id: -1,
          name: response?.data?.name,
          email: response?.data?.email.toLowerCase(),
        };
      } else if (options.authorize) {
        // Add the logged in user email in request body
        req.body.email = response.data.email.toLowerCase();
      }

      // Token is valid, proceed to the next middleware or route handler
      next();
    } catch (error) {
      this.loggerService.log(
        `Deleting session data if any because authentication failed`,
      );
      authType === EAuthType.REDIS
        ? await this.redisInstance.deleteData(token)
        : delete req?.session[token];
      throw new HttpException(
        'Unauthorized: Authentication failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
