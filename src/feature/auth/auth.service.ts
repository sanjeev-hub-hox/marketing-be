import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Request } from 'express';
import { Model } from 'mongoose';

import { Keycloak } from '../../middleware/auth/authentication.middleware';
import { LoggerService } from '../../utils';
import { Auth } from './auth.schema';
import { TokenGenerateRequestDto } from './create-auth.dto';

@Injectable()
export class AuthService extends Keycloak {
  constructor(
    @InjectModel('auth') public authModel: Model<Auth>,
    public readonly configService: ConfigService,
    private loggerService: LoggerService,
  ) {
    super(configService);
  }

  extractTokenFromHeader(
    authorizationHeader: string | undefined,
  ): string | null {
    if (!authorizationHeader) {
      return null; // Return null if no header is present
    }

    const parts = authorizationHeader.split(' '); // Split on space
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return null; // Return null for invalid format (not Bearer or missing token)
    }

    return parts[1]; // Return the extracted token
  }

  async validateToken(req: Request): Promise<any> {
    const token = req.headers.authorization;
    const { clientId, clientSecret, realm, baseUrl, portal } =
      this.getKeyCloakCredentials(req);

    const body = new URLSearchParams({
      token: this.extractTokenFromHeader(token),
      client_id: clientId,
      client_secret: clientSecret,
    });

    try {
      const response = await axios.post(
        `${baseUrl}/${realm}/${portal}/protocol/openid-connect/token/introspect`,
        body.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      this.loggerService.log('res: ', response.data);
      return response.data;
    } catch (error) {
      this.loggerService.log('err : ', error);
      throw new HttpException(
        { message: `Validation failed: ${error.message}`, error: error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  toFormData(data: Record<string, any>): string {
    return Object.keys(data)
      .map(
        (key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]),
      )
      .join('&');
  }

  async generatetoken(req: Request, payload: TokenGenerateRequestDto) {
    const { clientId, clientSecret, baseUrl, realm, portal } =
      this.getKeyCloakCredentials(req);

    const formData = {
      grant_type: 'password',
      username: payload.username,
      password: payload.password,
      scope: 'openid profile email',
      client_id: clientId,
      client_secret: clientSecret,
    };

    try {
      const tokenEndpoint = `${baseUrl}/${realm}/${portal}/protocol/openid-connect/token`;

      const response = await axios.post(
        tokenEndpoint,
        this.toFormData(formData),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.loggerService.log('res: ', response.data);
      return { access_token: response.data.access_token };
    } catch (error) {
      this.loggerService.log('err : ', error);
      throw new HttpException(
        { message: `Validation failed: ${error.message}`, error: error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validateKeyClock(token: string, req: any): Promise<any> {
    try {
      const token = req.headers.authorization;
      const { baseUrl, clientId, clientSecret, realm, portal } =
        this.getKeyCloakCredentials(req);
      if (!token) {
        throw new HttpException(
          { message: `token not found` },
          HttpStatus.NOT_FOUND,
        );
      }
      const body = {
        token: this.extractTokenFromHeader(token),
        client_id: clientId,
        client_secret: clientSecret,
      };

      const response = await axios.post(
        `${baseUrl}/${realm}/${portal}/protocol/openid-connect/token/introspect`,
        body,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      let rolepermission = {
        roles: [],
        permissioms: [],
      };

      if (req.session[token]) {
        console.log('session data');
        rolepermission = req.session[token]; // Return cached user info
      } else {
        console.log('api call');
        //api call for get roles permission from db
        rolepermission =
          response.data.username === 'chandrasuperadmin'
            ? {
                roles: ['user_dashboard', 'other', 'other', 'other'],
                permissioms: ['admin', 'superadmin', 'student', 'management'],
              }
            : {
                roles: ['user_dashboard', 'other'],
                permissioms: ['admin', 'superadmin'],
              };
        req.session[token] = rolepermission;
      }

      const result = response.data.active
        ? {
            status: response.data.active,
            user_details: {
              name: response.data.name,
              email: response.data.email,
              phone: '12345',
              permissions: rolepermission.permissioms,
              roles: rolepermission.roles,
              portal: 'portal',
            },
          }
        : { status: response.data.active };

      this.loggerService.log('res: ', result);

      return result;
    } catch (error) {
      this.loggerService.log('err : ', error);
      throw new HttpException(
        { message: `Validation failed: ${error.message}`, error: error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validateKeyClockMarketing(token: string, req: any): Promise<any> {
    try {
      if (!token) {
        throw new HttpException(
          { message: `token not found` },
          HttpStatus.NOT_FOUND,
        );
      }
      const body = {
        token: this.extractTokenFromHeader(token),
        client_id: this.configService.get<string>('CLIENT_ID'),
        client_secret: this.configService.get<string>('CLIENT_SECRET'),
      };

      const response = await axios.post(
        `${this.configService.get<string>('KEYCLOAK_BASE_URL')}/${this.configService.get<string>('ACTIVE_REALM')}/${this.configService.get<string>('KEYCLOCK_PORTAL')}/protocol/openid-connect/token/introspect`,
        body,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      let rolepermission = {
        roles: [],
        permissioms: [],
      };

      if (req.session[token]) {
        console.log('session data');
        rolepermission = req.session[token]; // Return cached user info
      } else {
        console.log('api call');
        //api call for get roles permission from db
        rolepermission =
          response.data.username === 'chandrasuperadmin'
            ? {
                roles: ['user_dashboard', 'other', 'other', 'other'],
                permissioms: ['admin', 'superadmin', 'student', 'management'],
              }
            : {
                roles: ['user_dashboard', 'other'],
                permissioms: ['admin', 'superadmin'],
              };
        req.session[token] = rolepermission;
      }

      const result = response.data.active
        ? {
            status: response.data.active,
            user_details: {
              name: response.data.name,
              email: response.data.email,
              phone: '12345',
              permissions: rolepermission.permissioms,
              roles: rolepermission.roles,
              portal: 'portal',
            },
          }
        : { status: response.data.active };

      this.loggerService.log('res: ', result);

      return result;
    } catch (error) {
      this.loggerService.log('err : ', error);
      throw new HttpException(
        { message: `Validation failed: ${error.message}`, error: error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async logoutKeyClock(token: string, req: any): Promise<any> {
    try {
      if (!token) {
        throw new HttpException(
          { message: `token not found` },
          HttpStatus.NOT_FOUND,
        );
      }
      const body = {
        token: this.extractTokenFromHeader(token),
        client_id: this.configService.get<string>('CLIENT_ID'),
        client_secret: this.configService.get<string>('CLIENT_SECRET'),
      };

      const response = await axios.post(
        `${this.configService.get<string>('KEYCLOAK_BASE_URL')}/${this.configService.get<string>('ACTIVE_REALM')}/${this.configService.get<string>('KEYCLOCK_PORTAL')}/protocol/openid-connect/logout`,
        body,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      if (req.session[token]) {
        delete req.session[token];
      }
      return response.data;
    } catch (error) {
      this.loggerService.log('err : ', error);
      throw new HttpException(
        { message: `Validation failed: ${error.message}`, error: error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
