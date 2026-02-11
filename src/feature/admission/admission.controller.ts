import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { LoggerService, ResponseService } from '../../utils';
import { RegexValidationPipe } from '../../validation';
import {
  AddSubjectDetailsRequestDto,
  AddVasOptionRequestDto,
  CreateAdmissionDetailsDto,
  DefaultFeesDto,
  UpdateAdmissionApprovalStatusRequestDto,
  UpdateAdmissionDetailsDto,
} from './admission.dto';
import { AdmissionService } from './admission.service';
import { EAdmissionDetailsType } from './admission.type';

@ApiTags('Admission')
@ApiBearerAuth('JWT-auth')
@Controller('admission')
export class AdmissionController {
  constructor(
    private admissionService: AdmissionService,
    private loggerService: LoggerService,
    private responseService: ResponseService,
  ) {}

  @Post('update-approval-status')
  async updateAdmissionApprovalStatus(
    @Res() res: Response,
    @Body() reqBody: UpdateAdmissionApprovalStatusRequestDto,
  ) {
    try {
      this.loggerService.log(
        `Update admission approval status API called with req body: ${JSON.stringify(reqBody)}`,
      );
      const { enquiry_id, status } = reqBody;
      const admissionDetails =
        await this.admissionService.updateAdmissionApprovalStatus(
          enquiry_id,
          status,
        );
      return this.responseService.sendResponse(
        res,
        HttpStatus.CREATED,
        admissionDetails,
        'Admission approval status updated',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Get(':enrolmentNumber/student-details')
  @ApiParam({
    name: 'enrolmentNumber',
    type: String,
    required: true,
    description: 'Enrolment number of student',
  })
  async getStudentDetailsByEnrolmentNumber(
    @Res() res: Response,
    @Param('enrolmentNumber') enrolmentNumber: string,
  ) {
    try {
      this.loggerService.log(
        `Get student details API called for enrolment number - ${enrolmentNumber}`,
      );
      const studentDetails =
        await this.admissionService.getStudentDetailsByEnrolmentNumber(
          enrolmentNumber,
        );
      return this.responseService.sendResponse(
        res,
        HttpStatus.CREATED,
        studentDetails,
        'Student details found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Post(':enquiryId/create')
  async createAdmissionDetails(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Body() reqBody: CreateAdmissionDetailsDto,
    @Req() req: Request,
  ) {
    try {
      const { type } = reqBody;
      this.loggerService.log(
        `Add admission details API called with req param : type : ${type}, body: ${reqBody}`,
      );
      const admissionDetails = await this.admissionService.create(
        type,
        enquiryId,
        reqBody,
        req,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.CREATED,
        admissionDetails,
        'Admission details added',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Post(':enquiryId/subject-details')
  async addSubjectDetails(
    @Req() req: Request,
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Body() reqBody: AddSubjectDetailsRequestDto[],
  ) {
    try {
      this.loggerService.log(
        `Add admission subject details API called with enquiryId : ${enquiryId}, body: ${JSON.stringify(reqBody)}`,
      );
      const admissionDetails = await this.admissionService.addAdmissionSubjects(
        req,
        enquiryId,
        reqBody,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.CREATED,
        admissionDetails,
        'Subject details added',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Post(':enquiryId/payment-request')
  async makePaymentRequest(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Req() req: Request,
  ) {
    try {
      this.loggerService.log(
        `Make payment request API called with enquiryId : ${enquiryId}`,
      );
      await this.admissionService.sendPaymentRequest(enquiryId, req);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        {},
        'Payment request sent',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Post(':enquiryId/vas/remove')
  @ApiParam({ name: 'enquiryId', required: true })
  @ApiQuery({ name: 'type', enum: EAdmissionDetailsType, required: true })
  async removeVasOptions(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Query('type') type: EAdmissionDetailsType,
  ) {
    try {
      this.loggerService.log(
        `Remove VAS option API called with enquiryId : ${enquiryId}, type: ${type}`,
      );
      await this.admissionService.removeVasOption(enquiryId, type);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        {},
        'VAS option removed',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Post(':enquiryId/vas/add')
  @ApiParam({ name: 'enquiryId', required: true })
  @ApiQuery({ name: 'type', enum: EAdmissionDetailsType, required: true })
  async addVasOptions(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Query('type') type: EAdmissionDetailsType,
    @Body() vasDetails: AddVasOptionRequestDto,
  ) {
    try {
      this.loggerService.log(
        `Add VAS option API called with enquiryId : ${enquiryId}, type: ${type}`,
      );
      await this.admissionService.addVasOption(enquiryId, type, vasDetails);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        {},
        'VAS option added',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Post(':enquiryId/submit-student-detail')
  @ApiParam({ name: 'enquiryId', required: true })
  async addStudentDetail(
    @Req() req: Request,
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
  ) {
    try {
      this.loggerService.log(
        `API to create student profile called against the enquiry Id: ${enquiryId}`,
      );
      const result = await this.admissionService.addStudentDetail(
        enquiryId,
        req,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        null,
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Patch(':enquiryId')
  async updateAdmissionDetails(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Body() reqBody: UpdateAdmissionDetailsDto,
  ) {
    try {
      const { type } = reqBody;
      this.loggerService.log(
        `Update admission details API called with req param : type : ${type}, body: ${reqBody}`,
      );
      const admissionDetails = await this.admissionService.update(
        type,
        enquiryId,
        reqBody,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.CREATED,
        admissionDetails,
        'Admission details updated',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Get(':enquiryId')
  async getAdmissionDetails(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
  ) {
    try {
      this.loggerService.log(
        `Get admission details API called with enquiry Id : ${enquiryId}`,
      );
      const admissionDetails =
        await this.admissionService.getAdmissionDetails(enquiryId);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        admissionDetails,
        'Admission details found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Post(':enquiryId/add-default-fees')
  async addDefaultFees(
    @Req() req: Request,
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Body() reqBody: DefaultFeesDto,
  ) {
    try {
      this.loggerService.log(
        `Default fees added for enquiry id :: ${enquiryId} for payload : ${JSON.stringify(reqBody)}`,
      );
      const { default_fees } = reqBody;
      const updatedEnquiryDetails = await this.admissionService.addDefaultFees(
        req,
        enquiryId,
        default_fees,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        updatedEnquiryDetails,
        'Deafult Fees Added',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }
}
