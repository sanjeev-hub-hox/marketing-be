import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RedisService } from 'ampersand-common-module';
import { Request, Response } from 'express';

import {
  extractCreatedByDetailsFromBody,
  LoggerService,
  RequestValidationError,
  ResponseService,
} from '../../utils';
import { FilterDto } from '../enquiry/dto/apiResponse.dto';
import { RegistrationService } from './registration.service';

@ApiTags('Enquiry Registration')
@ApiBearerAuth('JWT-auth')
@Controller('enquiry-registration')
export class RegistrationController {
  constructor(
    private loggerService: LoggerService,
    private responseService: ResponseService,
    private registrationService: RegistrationService,
    @Inject('REDIS_INSTANCE') private redisInstance: RedisService,
  ) {}
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Post('list')
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'size', required: false, type: String })
  async getRegistrationList(
    @Req() req: Request,
    @Res() res: Response,
    @Query('page') page: number,
    @Query('size') size: number,
    @Body() body: FilterDto,
  ) {
    try {
      const createdByDetails = extractCreatedByDetailsFromBody(req);
      const { user_id } = createdByDetails;

      const cacheKey = `user-${user_id}-registration-list-${page}-${size}-${JSON.stringify(body.filters)}`;

      const cachedData = await this.redisInstance?.getData(cacheKey);

      if (cachedData) {
        return this.responseService.sendResponse(
          res,
          HttpStatus.OK,
          cachedData,
          'Registered enquiries list found',
        );
      }
      this.loggerService.log(`API to get the registration list called`);
      const enquiryList =
        await this.registrationService.getRegisteredEnquiryList(
          req,
          page,
          size,
          body.filters,
        );

      await this.redisInstance?.setData(cacheKey, enquiryList, 60);

      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        enquiryList,
        'Registered enquiries list found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Get('list/global-search')
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'size', required: false, type: String })
  async globalSearchRegisteredEnquiryListing(
    @Req() req: Request,
    @Res() res: Response,
    @Query('page') page: number,
    @Query('size') size: number,
    @Query('search') globalSearchText: string,
  ) {
    try {
      this.loggerService.log(`API to get the registration list called`);
      const enquiryList =
        await this.registrationService.globalSearchRegisteredEnquiryListing(
          req,
          page,
          size,
          globalSearchText,
        );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        enquiryList,
        'Registered enquiries list found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }
}
