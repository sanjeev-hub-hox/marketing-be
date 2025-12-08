import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'ampersand-common-module';
import { NextFunction, Request, Response } from 'express';

import {
  APPLICATION_ID,
  LoggerService,
  MDM_API_URLS,
  MdmService,
  ResponseService,
  SERVICE_NAME,
} from '../../utils';
import { EAuthType } from './auth.type';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  private responseService = new ResponseService();
  private mdmService = new MdmService();
  private loggerService = new LoggerService();
  private configService = new ConfigService();
  public routePermission: string | string[];
  private redisInstance: RedisService;
  constructor(permission: string | string[], redisInstance: RedisService) {
    this.routePermission = permission;
    this.redisInstance = redisInstance;
  }

  // Helper function to standardize user name construction (First + Last name only)
  private constructUserName(user: any, userInfo: any): string | null {
    let firstName: string | null = null;
    let lastName: string | null = null;

    // Extract first and last names from available sources
    if (userInfo) {
      // If userInfo.name exists, try to split it
      if (userInfo.name) {
        const nameParts = userInfo.name.trim().split(/\s+/);
        firstName = nameParts[0] || null;
        lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : null;
      }
      // Override with explicit fields if available
      firstName = userInfo.first_name?.trim() || firstName;
      lastName = userInfo.last_name?.trim() || lastName;
    }

    if (user) {
      firstName = user.first_name?.trim() || firstName;
      lastName = user.last_name?.trim() || lastName;
    }

    // Construct name from first and last only
    const parts = [firstName, lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : null;
  }

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

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      this.loggerService.log(`Executing authorization`);

      let userId = null;
      let userName = null;
      let userEmail = null;
      const userPermissions = [];

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
      this.loggerService.log(`Auth type : ${authType}`);
      const redisData =
        authType === EAuthType.REDIS
          ? await this.redisInstance.getData(token)
          : null;

      const loggedInUserEmail =
        req.body?.email ?? req.body?.userInfo?.email ?? null;
      if (loggedInUserEmail) {
        if (req.body?.email) delete req.body?.email;
        if (req.body?.userInfo?.email) delete req.body?.userInfo.email;
      }

      if (
        (authType === EAuthType.SESSION && req.session[token]) ||
        (authType === EAuthType.REDIS && redisData?.[SERVICE_NAME])
      ) {
        const { permissions, userInfo, user } =
          authType === EAuthType.SESSION
            ? req.session[token]
            : redisData?.[SERVICE_NAME];
        this.loggerService.log(
          `Found session data : ${JSON.stringify({ permissions, userInfo })}`,
        );
        if (userInfo) {
          userId = userInfo?.id ?? null;
          userEmail = userInfo?.email ?? null;
        } else if (user) {
          userId = user?.id ?? null;
          userEmail = user?.email ?? null;
        }
        // Use the helper function to construct userName
        userName = this.constructUserName(user, userInfo);
        userPermissions.push(...permissions);
      } else {
        const permissionsApiResponse = await this.mdmService.postDataToAPI(
          `${this.isAppRequest(req) ? MDM_API_URLS.EXTERNAL_USER_PERMISSION : MDM_API_URLS.RBAC_USER_PERMISSION}`,
          this.isAppRequest(req)
            ? {
                email: loggedInUserEmail,
                service: SERVICE_NAME,
              }
            : {
                user_email: loggedInUserEmail,
                application_id: APPLICATION_ID,
                service: SERVICE_NAME,
              },
        );

        const { permissions, user, hrisCodes } = permissionsApiResponse?.data;
        let { userInfo } = permissionsApiResponse?.data;
        this.loggerService.log(
          `Session data not found (Getting data from API): ${JSON.stringify({ permissions, userInfo, user, hrisCodes })}`,
        );

        if (user) {
          userId = user?.id ?? null;
          userEmail = user?.email ?? null;
        } else if (userInfo) {
          userId = userInfo?.id ?? null;
          userEmail = userInfo?.email ?? null;
        } else {
          userInfo = {
            id: req.body?.id ?? req.body?.userInfo.id ?? null,
            name: req.body?.name ?? req.body?.userInfo.name ?? null,
            email: loggedInUserEmail ?? null,
          };
          userId = req.body?.id ?? req.body?.userInfo.id ?? null;
          userEmail = loggedInUserEmail ?? null;
        }
        // Use the helper function to construct userName
        userName = this.constructUserName(user, userInfo);
        userPermissions.push(...permissions);
        if (authType === EAuthType.REDIS) {
          this.loggerService.log('Setting data in redis');
          await this.redisInstance.setData(
            token,
            {
              [SERVICE_NAME]: {
                user: user,
                userInfo: userInfo,
                permissions: permissions,
                hrisCodes: hrisCodes,
              },
            },
            3600,
          );
        } else {
          this.loggerService.log('Setting data in session');
          req.session[token] = {
            user: user,
            userInfo: userInfo,
            permissions: permissions,
            hrisCodes: hrisCodes,
          };
        }
      }

      if (this.routePermission !== '*' && Array.isArray(this.routePermission)) {
        let userHasApiPermission = false;
        this.routePermission.forEach((permission) => {
          if (userPermissions.includes(permission)) {
            userHasApiPermission = true;
          }
        });

        if (!userHasApiPermission) {
          throw new HttpException(
            'User does not have permission to accept this API',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      req.body = {
        ...req.body,
        created_by: {
          user_id: userId,
          user_name: userName,
          email: userEmail,
        },
      };
      next();
    } catch (error: Error | unknown) {
      console.log(error);
      this.responseService.errorResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Something went wrong while checking authorization',
      );
      throw new HttpException(
        'Something went wrong while checking authorization',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
