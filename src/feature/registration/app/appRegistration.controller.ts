import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import {
  LoggerService,
  RequestValidationError,
  ResponseService,
} from 'src/utils';

import { AppRegistrationService } from './appRegistration.service';
import { ERegistrationDetailsType } from './appRegistration.type';
@ApiTags('Mobile App Registration APIs')
@Controller('/app/registration')
export class AppRegistrationController {
  constructor(
    private loggerService: LoggerService,
    private responseService: ResponseService,
    private appRegistrationService: AppRegistrationService,
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
  @Get(':enquiryId')
  @ApiParam({ name: 'enquiryId', type: String, required: true })
  @ApiQuery({
    name: 'infoType',
    enum: ERegistrationDetailsType,
    type: String,
    required: true,
  })
  async getAdmissionJourneyTimeline(
    @Res() res: Response,
    @Param('enquiryId') enquiryId: string,
    @Query('infoType') infoType: ERegistrationDetailsType,
  ) {
    try {
      this.loggerService.log(
        `[MOBILE] Getregistration details API called with enquiryId: ${enquiryId} and infoType: ${infoType}`,
      );
      const updatedDetails =
        await this.appRegistrationService.viewRegistrationDetails(
          enquiryId,
          infoType,
        );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        updatedDetails,
        'Registration details',
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
  @Patch(':enquiryId/parent-details')
  @ApiParam({ name: 'enquiryId', type: String, required: true })
  async editParentDetails(
    @Res() res: Response,
    @Param('enquiryId') enquiryId: string,
    @Body() requestPayload: any,
  ) {
    try {
      this.loggerService.log(
        `[MOBILE] Edit registration parent details API called for enquiryId: ${enquiryId} with request body: ${JSON.stringify(requestPayload)}`,
      );
      const updatedDetails =
        await this.appRegistrationService.editParentDetails(
          enquiryId,
          requestPayload,
        );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        updatedDetails,
        'Parent details edited',
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
  @Patch(':enquiryId/contact-details')
  @ApiParam({ name: 'enquiryId', type: String, required: true })
  async editContactDetails(
    @Res() res: Response,
    @Param('enquiryId') enquiryId: string,
    @Body() requestPayload: any,
  ) {
    try {
      this.loggerService.log(
        `[MOBILE] Edit registration contact details API called for enquiryId: ${enquiryId} with request body: ${JSON.stringify(requestPayload)}`,
      );
      const updatedDetails =
        await this.appRegistrationService.editContactDetails(
          enquiryId,
          requestPayload,
        );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        updatedDetails,
        'Contact details edited',
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
  @Patch(':enquiryId/medical-details')
  @ApiParam({ name: 'enquiryId', type: String, required: true })
  async editMedicalDetails(
    @Res() res: Response,
    @Param('enquiryId') enquiryId: string,
    @Body() requestPayload: any,
  ) {
    try {
      this.loggerService.log(
        `[MOBILE] Edit registration medical details API called for enquiryId: ${enquiryId} with request body: ${JSON.stringify(requestPayload)}`,
      );
      const updatedDetails =
        await this.appRegistrationService.editMedicalDetails(
          enquiryId,
          requestPayload,
        );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        updatedDetails,
        'Medical details edited',
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
  @Patch(':enquiryId/bank-details')
  @ApiParam({ name: 'enquiryId', type: String, required: true })
  async editBankDetails(
    @Req() req: Request,
    @Res() res: Response,
    @Param('enquiryId') enquiryId: string,
    @Body() requestPayload: any,
  ) {
    try {
      this.loggerService.log(
        `[MOBILE] Edit registration bank details API called for enquiryId: ${enquiryId} with request body: ${JSON.stringify(requestPayload)}`,
      );
      const updatedDetails = await this.appRegistrationService.editBankDetails(
        enquiryId,
        requestPayload,
        req
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        updatedDetails,
        'Bank details edited',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }
}
