import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { NextFunction, Request, Response } from 'express';

import { permissionsOnly, ResponseService } from '../utils';

@Injectable()
export class SlugMiddleware implements NestMiddleware {
  private allowedSlugs: string[] = ['slug1', 'slug2', 'slug3', 'slug4']; // Replace with your allowed slugs
  constructor(
    private readonly slug: string,
    private readonly configService: ConfigService,
    private responseService: ResponseService,
  ) {
    this.slug = slug;
    this.allowedSlugs = permissionsOnly;
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      try {
        const permissionsApiResponse = await axios.post(
          `${this.configService.get<string>('MDM_URL')}/api/rbac-role-permissions/role-permissions-for-user`,
          {
            userId: 1,
            service: 3,
            // service: this.configService.get<string>('ROLES_PERMISSIONS_SERVICE_ID')
          },
        );
        this.allowedSlugs = permissionsApiResponse.data;
      } catch (err) {
        if (err.response.status === HttpStatus.FORBIDDEN) {
          this.allowedSlugs = permissionsOnly;
        }
      }
      if (!this.slug) {
        throw new InternalServerErrorException(
          'Slug not found in route metadata',
        );
      }
      if (this.allowedSlugs.includes(this.slug)) {
        (req as any).slug = this.slug;
        return next();
      } else {
        throw new UnauthorizedException('Unauthorized access');
      }
    } catch (error) {
      return this.responseService.sendResponse(
        res,
        HttpStatus.UNAUTHORIZED,
        { status: false },
        'Unauthorized: Permissions not found',
      );
    }
  }
}
