import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import {
  LoggerService,
  RequestValidationError,
  ResponseService,
} from '../../../utils';
import { CreateEnquiryResponseDto } from '../dto/apiResponse.dto';
import { EEnquiryStatus } from '../enquiry.type';
import { AppEnquiryService } from './appEnquiry.service';
import { EEnquiryType, ETimelineType } from './appEnquiry.type';
import {
  EditIvtEnquiryDetailsRequestDataDto,
  EditNewAdmissionEnquiryDetailsRequestDto,
  EditPsaEnquiryDetailsRequestDto,
  GetIvtEnquiryDetailsResponseDto,
  GetNewAdmissionEnquiryDetailsResponseDto,
  GetPsaEnquiryDetailsResponseDto,
} from './dto';
@ApiTags('Mobile App Enquiry APIs')
@Controller('/app/enquiry')
export class AppEnquiryController {
  constructor(
    private loggerService: LoggerService,
    private responseService: ResponseService,
    private appEnquiryService: AppEnquiryService,
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
  @Get('enquiry-list')
  @ApiQuery({ name: 'phone', type: String, required: true })
  @ApiQuery({ name: 'pageNumber', type: Number, required: true })
  @ApiQuery({ name: 'pageSize', type: Number, required: true })
  @ApiQuery({
    name: 'status',
    enum: EEnquiryStatus,
    type: String,
    required: true,
  })
  async getEnquiryList(
    @Res() res: Response,
    @Query('phone') phone: string,
    @Query('pageNumber', ParseIntPipe) pageNumber: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
    @Query('status') status: EEnquiryStatus,
  ) {
    try {
      this.loggerService.log(
        `[MOBILE] Get enquiry list API called with phone: ${phone}, pageNumber: ${pageNumber}, pageSize: ${pageSize}`,
      );
      const enquiry = await this.appEnquiryService.getEnquiryList(
        phone,
        pageNumber,
        pageSize,
        EEnquiryType.ENQUIRY,
        status,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        enquiry,
        'Enquiry list',
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
  @Get('admission-list')
  @ApiQuery({ name: 'phone', type: String, required: true })
  @ApiQuery({ name: 'pageNumber', type: Number, required: true })
  @ApiQuery({ name: 'pageSize', type: Number, required: true })
  @ApiQuery({
    name: 'status',
    enum: EEnquiryStatus,
    type: String,
    required: true,
  })
  async getAdmissionEnquiryList(
    @Res() res: Response,
    @Query('phone') phone: string,
    @Query('pageNumber', ParseIntPipe) pageNumber: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
    @Query('status') status: EEnquiryStatus,
  ) {
    try {
      this.loggerService.log(
        `[MOBILE] Get admission enquiry list API called with phone: ${phone}, pageNumber: ${pageNumber}, pageSize: ${pageSize}`,
      );
      const enquiry = await this.appEnquiryService.getEnquiryList(
        phone,
        pageNumber,
        pageSize,
        EEnquiryType.ADMISSION,
        status,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        enquiry,
        'Enquiry list',
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
  @Get(':enquiryId/admission-journey')
  @ApiParam({ name: 'enquiryId', type: String, required: true })
  @ApiQuery({ name: 'type', enum: ETimelineType, required: true })
  async getAdmissionJourneyTimeline(
    @Res() res: Response,
    @Param('enquiryId') enquiryId: string,
    @Query('type') type: ETimelineType,
  ) {
    try {
      this.loggerService.log(
        `[MOBILE] Get admission journey timeline API called with enquiryId: ${enquiryId} and type ${type}`,
      );
      const enquiry = await this.appEnquiryService.getAdmissionJourneyTimeline(
        enquiryId,
        type,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        enquiry,
        'Enquiry details',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: GetNewAdmissionEnquiryDetailsResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Get(':enquiryId/new-admission')
  @ApiParam({ name: 'enquiryId', type: String, required: true })
  async getNewAdmissionEnquiryDetails(
    @Res() res: Response,
    @Param('enquiryId') enquiryId: string,
  ) {
    try {
      this.loggerService.log(
        `[MOBILE] Get new admission enquiry details API called with enquiryId: ${enquiryId}`,
      );
      const enquiry =
        await this.appEnquiryService.getNewAdmissionEnquiryDetails(enquiryId);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        enquiry,
        'Enquiry details',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: GetPsaEnquiryDetailsResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Get(':enquiryId/psa')
  @ApiParam({ name: 'enquiryId', type: String, required: true })
  async getPsaEnquiryDetails(
    @Res() res: Response,
    @Param('enquiryId') enquiryId: string,
  ) {
    try {
      this.loggerService.log(
        `[MOBILE] Get PSA enquiry details API called with enquiryId: ${enquiryId}`,
      );
      const enquiry =
        await this.appEnquiryService.getPsaEnquiryDetails(enquiryId);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        enquiry,
        'Enquiry details',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: GetIvtEnquiryDetailsResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Get(':enquiryId/kids-club')
  @ApiParam({ name: 'enquiryId', type: String, required: true })
  async getIvtEnquiryDetails(
    @Res() res: Response,
    @Param('enquiryId') enquiryId: string,
  ) {
    try {
      this.loggerService.log(
        `[MOBILE] Get IVT enquiry details API called with enquiryId: ${enquiryId}`,
      );
      const enquiry =
        await this.appEnquiryService.getKidsClubEnquiryDetails(enquiryId);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        enquiry,
        'Enquiry details',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: CreateEnquiryResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Get(':enquiryId')
  @ApiParam({ name: 'enquiryId', type: String, required: true })
  async getEnquiryDetails(
    @Res() res: Response,
    @Param('enquiryId') enquiryId: string,
  ) {
    try {
      this.loggerService.log(
        `[MOBILE] Get enquiry details API called with enquiryId: ${enquiryId}`,
      );
      const enquiry = await this.appEnquiryService.getEnquiryDetails(enquiryId);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        enquiry,
        'Enquiry details',
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
  @Patch(':enquiryId/new-admission')
  @ApiParam({ name: 'enquiryId', type: String, required: true })
  async editNewAdmissionEnquiryDetails(
    @Res() res: Response,
    @Param('enquiryId') enquiryId: string,
    @Body() reqBody: EditNewAdmissionEnquiryDetailsRequestDto,
  ) {
    try {
      this.loggerService.log(
        `[MOBILE] Edit new admission enquiry details API called with enquiryId: ${enquiryId} and request body : ${reqBody}`,
      );
      const enquiry =
        await this.appEnquiryService.editNewAdmissionEnquiryDetails(
          enquiryId,
          reqBody,
        );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        enquiry,
        'Enquiry details updated',
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
  @Patch(':enquiryId/psa')
  @ApiParam({ name: 'enquiryId', type: String, required: true })
  async editPsaEnquiryDetails(
    @Res() res: Response,
    @Param('enquiryId') enquiryId: string,
    @Body() reqBody: EditPsaEnquiryDetailsRequestDto,
  ) {
    try {
      this.loggerService.log(
        `[MOBILE] Edit PSA enquiry details API called with enquiryId: ${enquiryId} and request body : ${reqBody}`,
      );
      const enquiry = await this.appEnquiryService.editPsaEnquiryDetails(
        enquiryId,
        reqBody,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        enquiry,
        'Enquiry details updated',
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
  @Patch(':enquiryId/kids-club')
  @ApiParam({ name: 'enquiryId', type: String, required: true })
  async editIvtEnquiryDetails(
    @Res() res: Response,
    @Param('enquiryId') enquiryId: string,
    @Body() reqBody: EditIvtEnquiryDetailsRequestDataDto,
  ) {
    try {
      this.loggerService.log(
        `[MOBILE] Edit IVT enquiry details API called with enquiryId: ${enquiryId} and request body : ${reqBody}`,
      );
      const enquiry = await this.appEnquiryService.editKidsClubEnquiryDetails(
        enquiryId,
        reqBody,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        enquiry,
        'Enquiry details updated',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }
}
