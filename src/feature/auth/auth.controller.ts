import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { ResponseService } from '../../utils';
import { AuthService } from './auth.service';
import { TokenGenerateRequestDto } from './create-auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private responseService: ResponseService,
  ) {}

  @ApiResponse({
    status: 201,
    description: 'Access token successfully generated.',
  })
  @ApiQuery({ name: 'platform', required: false })
  @Post('generate-token')
  async getToken(
    @Req() req: Request,
    @Body() payload: TokenGenerateRequestDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.generatetoken(req, payload);
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Access token generated successfully',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'User validated',
  })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error occurred while validating',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @Post('/validate')
  @ApiQuery({ name: 'platform', required: false })
  @ApiBearerAuth('JWT-auth')
  async validate(@Req() req: Request, @Res() res: Response) {
    try {
      // Call the authentication service to validate token
      const result = await this.authService.validateToken(req);
      // Check if the validation was successful
      if (result.active === true) {
        // Send success response
        return this.responseService.sendResponse(
          res,
          HttpStatus.OK,
          result,
          'validated successfully',
        );
      } else {
        // Send error response if validation failed
        return this.responseService.errorResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          'Failed while validating',
        );
      }
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'validated successfully',
  })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error occurred while validating',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiQuery({ name: 'platform', required: false })
  @ApiBearerAuth('JWT-auth')
  @Post('/validate/key-cloak')
  async validateKeyClock(@Req() req: Request, @Res() res: Response) {
    try {
      // Call the authentication service to validate token
      const result = await this.authService.validateKeyClock(
        req.headers.authorization,
        req,
      );
      // Check if the validation was successful
      if (result.status === true) {
        // Send success response
        return this.responseService.sendResponse(
          res,
          HttpStatus.OK,
          result,
          'validated successfully',
        );
      } else {
        // Send error response if validation failed
        return this.responseService.sendResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          result,
          'Unauthorized: keycloak validation failed',
        );
      }
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'validated successfully',
  })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error occurred while validating',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiBearerAuth('JWT-auth')
  @Post('/validate/key-cloak-marketing')
  async validateKeyClockMarketing(@Req() req: Request, @Res() res: Response) {
    try {
      // Call the authentication service to validate token
      const result = await this.authService.validateKeyClockMarketing(
        req.headers.authorization,
        req,
      );
      // Check if the validation was successful
      if (result.status === true) {
        // Send success response
        return this.responseService.sendResponse(
          res,
          HttpStatus.OK,
          result,
          'validated successfully',
        );
      } else {
        // Send error response if validation failed
        return this.responseService.sendResponse(
          res,
          HttpStatus.UNAUTHORIZED,
          result,
          'Unauthorized: Keycloak for marketing service failed',
        );
      }
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'validated successfully',
  })
  @ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error occurred while validating',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiBearerAuth('JWT-auth')
  @Post('/logout')
  async logoutKeyClock(@Req() req: Request, @Res() res: Response) {
    try {
      // Call the authentication service to validate token
      const result = await this.authService.validateKeyClock(
        req.headers.authorization,
        req,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'logout successfully',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }
}
