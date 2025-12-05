import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { LoggerService, ResponseService } from '../../../utils';
import { ExternalEnquiryService } from './externalEnquiry.service';

@ApiTags('External APIs related to enquiry')
@Controller('external/enquiry')
export class ExternalEnquiryController {
  constructor(
    private loggerService: LoggerService,
    private externalEnquiryService: ExternalEnquiryService,
    private responseService: ResponseService,
  ) {}

  @Post('create')
  async createExternalEnquiry(@Body() body: any, @Res() res: Response) {
    try {
      this.loggerService.log(
        `API to create external enquiry called with payload - ${JSON.stringify(body)}`,
      );
      const response = await this.externalEnquiryService.create(body);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        response,
        'Enquiry created',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Get('enquiry-type/list')
  async getEnquiryTypesByEnquiryMode(
    @Query('mode') mode: string,
    @Res() res: Response,
  ) {
    try {
      this.loggerService.log(
        `API to get enquiry type list by enquiry mode called with mode - ${mode}`,
      );
      const response =
        await this.externalEnquiryService.getEnquiryTypesByEnquiryMode(mode);
      this.loggerService.log(
        `Response of API to get enquiry type list by enquiry mode called with mode - ${mode} is ${JSON.stringify(response)}`,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        response,
        'Enquiry type list found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }
}
