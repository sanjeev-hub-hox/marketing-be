import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RedisService } from 'ampersand-common-module';
import { Request, Response } from 'express';

import {
  extractCreatedByDetailsFromBody,
  LoggerService,
  ResponseService,
} from '../../utils';
import { RequestValidationError } from '../../utils';
import { RegexValidationPipe } from '../../validation';
import { EEnquiryEventType } from '../enquiryLog/enquiryLog.type';
import { JobShadulerService } from '../jobShaduler/jobShaduler.service';
import { ShortUrlService } from '../shortUrl/shorturl.service';
import {
  GetEnquiryNumberWithGivenIvtDto,
  UpdateIvtEnquiryStatusDto,
} from './dto';
import {
  AddKitNumberRequestDto,
  ChangeEnquiryStatusResponseDto,
  CreateEnquiryResponseDto,
  FilterDto,
  FinanceEnquiryDetailsSearchRequestDto,
  GetEnquiryTimelineResponseDto,
  GetFileRequestDto,
  GetFinanceEnquiryDetailsResponseDto,
  GetFinanceEnquiryListResponseDto,
  GetMergeEnquiryDetailsApiResponse,
  GetUploadedDocumentUrlResponseDto,
  MoveToNextStageRequestDto,
  ReassignEnquiryRequestDto,
  ReassignRequestDto,
  TransferEnquiryRequestDto,
  UpdateBankDetailsDto,
  UpdateBankDetailsResponseDto,
  UpdateContactDetailsRequestDto,
  UpdateContactDetailsResponseDto,
  UpdateEnquiryParentDetailsResponseDto,
  UpdateEnquiryStatusRequestDto,
  UpdateMedicalDetailsDto,
  UpdateMedicalDetailsResponseDto,
  UpdateParentDetailsRequestDto,
} from './dto/apiResponse.dto';
import { GetMergeDto, PostMergeDto } from './dto/mergeEnquiry.dto';
import {
  CheckFeePayload,
  GetValidParent,
  MapSiblingsDto,
  UpdateAcStudentGuardianArrayDto,
  UpdateAdmissionDto,
  GlobalSearchEnquiryDto,
} from './dto/updateAdmission.dto';
import { EnquiryService } from './enquiry.service';
import { EEnquiryStatus } from './enquiry.type';
import { EnquiryStageUpdateService } from './EnquiryStageUpdate.service';

@ApiTags('Enquiry')
@ApiBearerAuth('JWT-auth')
@Controller('enquiry')
export class EnquiryController {
  constructor(
    private loggerService: LoggerService,
    private responseService: ResponseService,
    private enquiryService: EnquiryService,
    private jobShadulerService: JobShadulerService,
    private enquiryStageUpdateService: EnquiryStageUpdateService,
    private shortUrlService: ShortUrlService,
    @Inject('REDIS_INSTANCE') private redisInstance: RedisService,
  ) {}

  @Post('upload-file')
  @ApiOperation({ summary: 'Upload document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document file to upload',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      this.loggerService.log(`Upload file Api called`);
      const result = await this.enquiryService.uploadFile(file);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'File uploaded successfully',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Post('file')
  async getUploadedFile(
    @Body() reqBody: GetFileRequestDto,
    @Res() res: Response,
  ) {
    try {
      this.loggerService.log(
        `API to get the file url called with request body : ${reqBody}`,
      );
      const result = await this.enquiryService.getUploadedFileUrl(reqBody);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Document file URL',
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
  @Post('create')
  // @UseInterceptors(ValidateCreateEnquiryRequest)
  // async createEnquiry(@Req() req: Request, @Res() res: Response) {

  //   try {
  //     this.loggerService.log(
  //       `Create enquiry API called with request body: ${JSON.stringify(req.body)}`,
  //     );
  //     const enquiry = await this.enquiryService.create(req);
  //     return this.responseService.sendResponse(
  //       res,
  //       HttpStatus.CREATED,
  //       enquiry,
  //       'Enquiry created',
  //     );
  //   } catch (err: Error | unknown) {
  //     throw err;
  //   }
  // }

  //  Nikhil
  async createEnquiry(@Req() req: Request, @Res() res: Response) {
    try {
      const requestBody = req.body?.data;
      this.loggerService.log(
        `Create enquiry API called with request body: ${JSON.stringify(requestBody)}`,
      );
      // const reoprnNeeded = await this.enquiryService.checkReopenNeeded(req);
      // No match found → create new enquiry
      const enquiry = await this.enquiryService.create(req);

      return this.responseService.sendResponse(
        res,
        HttpStatus.CREATED,
        enquiry,
        'Enquiry created',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Get('referrals/:id')
  async fetchReferralDetails(
    @Res() res: Response,
    @Param('id')
    id: string,
  ) {
    try {
      const data = await this.enquiryService.fetchReferralDetails(id);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        data,
        'Referral Details Fetched',
      );
    } catch (error) {
      return this.responseService.errorResponse(
        res,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'An error occurred fetching referral',
      );
    }
  }

  @Get('getAllReferrals')
  async getAllReferrals(
    @Res() res: Response,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('search') search: string,
  ) {
    try {
      const data = await this.enquiryService.getAllReferrals(page, pageSize, search);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        data,
        'Successful Referral Details Fetched',
      );
    } catch (error) {
      return this.responseService.errorResponse(
        res,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'An error occurred fetching referral',
      );
    }
  }

  @Get('getEnrollmentAndParentNumber')
  async getEnrollmentAndParentNumber(
    @Query('search') search: string,
    @Res() res: Response,
  ) {
    try {
      const data =
        await this.enquiryService.getEnrollmentAndParentNumber(search);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        data,
        'Enrollment Number and Parent Number Fetched',
      );
    } catch (error) {
      return this.responseService.errorResponse(
        res,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'An error occurred',
      );
    }
  }

  @Post('referrals/:id')
  async referralConfirmation(
    @Body() reqBody: any,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    try {
      const result = await this.enquiryService.referralConfirmation(
        id,
        reqBody,
      );

      // Check if the service returned the "already submitted" message
      if (result?.message === 'Referral details were already submitted.') {
        return this.responseService.sendResponse(
          res,
          HttpStatus.BAD_REQUEST,
          {},
          result.message,
        );
      }

      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        { response: 'Done' },
        'Referral Details Sent successfully',
      );
    } catch (error) {
      return this.responseService.errorResponse(
        res,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'An error occurred',
        error.cause,
      );
    }
  }

  //! verify referral manulally
  @Post('verifyReferralManually')
  async verifyReferralManually(
    @Body()
    body: {
      enquiryId: string;
      verificationType: 'both';
      verifiedBy: string;
      reason?: string;
    },
  ) {
    return this.enquiryService.verifyReferralManually(
      body.enquiryId,
      body.verificationType,
      body.verifiedBy,
      body.reason,
    );
  }

  @Post('rejectReferralManually')
  async rejectReferralManually(
    @Body() body: { enquiryId: string; rejectionReason?: string },
  ) {
    return this.enquiryService.rejectReferralManually(
      body.enquiryId,
      body.rejectionReason,
    );
  }

  @Get('admission-approvel/:enquiryNumber')
  async approveAdmission(
    @Res() res: Response,
    @Param('enquiryNumber')
    enquiryNumber: string,
  ) {
    try {
      await this.enquiryService.approveAdmissionworkflow(enquiryNumber);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        enquiryNumber,
        'admission approved',
      );
    } catch (error) {
      return this.responseService.errorResponse(
        res,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'An error occurred admission approvel',
      );
    }
  }

  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Patch('getDublicateEnquiry/enr')
  async getDublicateEnquirys(@Body() reqBody: any, @Res() res: Response) {
    if (!reqBody.enrollment || !reqBody.enquiryType) {
      return this.responseService.sendResponse(
        res,
        HttpStatus.BAD_REQUEST,
        reqBody,
        'invalid request',
      );
    }
    try {
      console.log('result', reqBody);
      const result = await this.enquiryService.findDublicateIVTenquiry(
        reqBody.enrollment,
        reqBody.enquiryType,
      ); //reqBody.enquiryNumber
      console.log('result', result);

      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'enquiry found',
      );
    } catch (error) {
      throw error;
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
  @Post('create/website')
  async createWebEnquiry(@Req() req: Request, @Res() res: Response) {
    try {
      this.loggerService.log(
        `Create enquiry from website API called with request body: ${JSON.stringify(req.body)}`,
      );
      req.body.created_by = {
        user_id: -1,
        user_name: 'External User',
        email: 'external-user@test.com',
      };
      const enquiry = await this.enquiryService.create(req);
      return this.responseService.sendResponse(
        res,
        HttpStatus.CREATED,
        enquiry,
        'Enquiry created',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Post('enquiryReopen/:enquiryId')
  async enquiryReOpen(
    @Body() reqBody: any,
    @Res() res: Response,
    @Param() enquiryId: any,
  ) {
    try {
      await this.enquiryService.reOpenEnquiry(enquiryId.enquiryId, reqBody);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        { response: 'Done' },
        'ReOpen Enquiry succesfull',
      );
    } catch (error) {
      return this.responseService.errorResponse(
        res,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'An error occurred',
        error.cause,
      );
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: UpdateContactDetailsResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Patch('/transfer')
  async updateTransferEnquiry(
    @Res() res: Response,
    @Body() reqBody: TransferEnquiryRequestDto,
    @Req() req: Request,
  ) {
    try {
      this.loggerService.log(
        `Transfer enquiry API called with the payload : ${JSON.stringify(reqBody)}`,
      );
      const { enquiryIds, school_location } = reqBody;
      const updatedEnquiryDetails = await this.enquiryService.transfer(
        enquiryIds,
        school_location,
        req,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        updatedEnquiryDetails,
        enquiryIds.length === 1 ? 'Enquiry transfered' : 'Enquiries transfered',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: UpdateContactDetailsResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Patch('reassign')
  async updateReassignEnquiry(
    @Res() res: Response,
    @Body() reqBody: ReassignEnquiryRequestDto,
    @Req() req: Request,
  ) {
    try {
      this.loggerService.log(
        `Reassign enquiry API called with the payload : ${JSON.stringify(reqBody)}`,
      );
      const { enquiryIds, ...reassignDetails } = reqBody;
      const updatedEnquiryDetails = await this.enquiryService.reassign(
        enquiryIds,
        reassignDetails,
        req.ip,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        updatedEnquiryDetails,
        enquiryIds.length === 1 ? 'Enquiry reassigned' : 'Enquiries reassigned',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Post('reassign')
  async reassignEmployee(
    @Res() res: Response,
    @Body() reqBody: ReassignRequestDto,
    @Req() req: Request,
  ) {
    try {
      this.loggerService.log(
        `Reassign enquiry API called with the payload : ${JSON.stringify(reqBody)}`,
      );
      const { school_code, hris_code } = reqBody;
      const updatedEnquiryDetails = await this.enquiryService.reassignEmployee(
        school_code,
        hris_code,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        updatedEnquiryDetails,
        'Reassigned',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }
  // Nikhil
  @Patch('/reopen')
  async updateReopenEnquiry(
    @Res() res: Response,
    @Body() reqBody: any,
    @Req() req: Request,
  ) {
    try {
      this.loggerService.log(
        `Reopen enquiry API called with the payload : ${JSON.stringify(reqBody)}`,
      );
      const { enquiryIds, ...reopenDetails } = reqBody;
      const updatedEnquiryDetails = await this.enquiryService.reopen(
        enquiryIds,
        reopenDetails,
        req.ip,
        'Bulk re-opened',
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        updatedEnquiryDetails,
        enquiryIds.length === 1 ? 'Enquiry reopened' : 'Enquiries reopened',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Get('eligible-grade')
  async calculateEligibleGrade(
    @Query('academicYearId', ParseIntPipe) academicYearId: number,
    @Query('schoolId', ParseIntPipe) schoolId: number,
    @Query('dob') dob: string,
    @Res() res: Response,
  ) {
    try {
      this.loggerService.log(
        `Calculate and get eligible grade API called with query string params : academicYearId: ${academicYearId}, schoolId: ${schoolId}, dob: ${dob}`,
      );
      const response = await this.enquiryService.calculateEligibleGrade(
        academicYearId,
        schoolId,
        dob,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        response,
        'Eligible grade calculated',
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
  @ApiQuery({ name: 'eventType', required: true, enum: EEnquiryEventType })
  @Get('timeline/event-sub-types')
  async getEnquiryTimelineEventSubTypes(
    @Res() res: Response,
    @Query('eventType') eventType: EEnquiryEventType,
  ) {
    try {
      this.loggerService.log(
        `API to get the enquiry timeline event sub types called for enquiryType - ${eventType}`,
      );
      const timelineEventSubTypes =
        await this.enquiryService.getTimeLineEventSubTypes(eventType);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        timelineEventSubTypes,
        'Enquiry timeline event sub types',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  // @ApiOkResponse({
  //   status: HttpStatus.OK,
  //   description: 'Success response',
  // })
  // @ApiBadRequestResponse({
  //   status: HttpStatus.OK,
  //   description: 'Invalid data validation error response',
  //   type: RequestValidationError,
  // })
  // @ApiParam({ name: 'sourceEnquiryId', required: true, type: String })
  // @ApiParam({ name: 'targetEnquiryId', required: true, type: String })
  // @Patch('merge/:sourceEnquiryId/:targetEnquiryId')
  // async mergeEnquiries(
  //   @Res() res: Response,
  //   @Param('sourceEnquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
  //   sourceEnquiryId: string,
  //   @Param('targetEnquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
  //   targetEnquiryId: string,
  // ) {
  //   try {
  //     this.loggerService.log(
  //       `Merge enquiries API called with sourceEnquiryId: ${sourceEnquiryId} and targetEnquiryId: ${targetEnquiryId}`,
  //     );
  //     await this.enquiryService.mergeEnquiry(sourceEnquiryId, targetEnquiryId);
  //     return this.responseService.sendResponse(
  //       res,
  //       HttpStatus.OK,
  //       {},
  //       'Enquiries merged',
  //     );
  //   } catch (err: Error | unknown) {
  //     throw err;
  //   }
  // }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @ApiParam({ name: 'targetEnquiryId', required: true, type: String })
  @Patch('merge/:targetEnquiryId')
  async mergeEnquiries(
    @Res() res: Response,
    @Body() body: PostMergeDto,
    @Param('targetEnquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    targetEnquiryId: string,
  ) {
    try {
      this.loggerService.log(
        `Merge enquiries API called with sourceEnquiryId: ${JSON.stringify(body.enquiryIds)} and targetEnquiryId: ${targetEnquiryId}`,
      );
      await this.enquiryService.mergeEnquiry(targetEnquiryId, body);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        {},
        'Enquiries merged',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: GetFinanceEnquiryDetailsResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @ApiQuery({ name: 'enquiryId', required: true, type: String })
  @Get('/finance/enquiry-details')
  async getEnquiryDetailsForFinance(
    @Req() req: Request,
    @Res() res: Response,
    @Query('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
  ) {
    try {
      this.loggerService.log(
        `Get enquiry details API called from finance with enquiryId: ${enquiryId}`,
      );
      const result = await this.enquiryService.getEnquiryDetailsForFinance(
        req,
        enquiryId,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Enquiry details found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: [GetFinanceEnquiryListResponseDto],
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Post('/finance/enquiry-list/search')
  async getEnquiryListForFinance(
    @Res() res: Response,
    @Body() reqBody: FinanceEnquiryDetailsSearchRequestDto,
  ) {
    try {
      this.loggerService.log(
        `Get enquiry list search API called from finance with search value : ${JSON.stringify(reqBody)}`,
      );
      const result =
        await this.enquiryService.searchEnquiriesForFinance(reqBody);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        result?.length ? 'Enquiry found' : 'Enquiry not found',
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
  @Post('/finance/payment-status')
  async updatePaymentStatus(
    @Req() req: Request,
    @Res() res: Response,
    @Body() reqBody: any,
  ) {
    try {
      this.loggerService.log(
        `Update payment status API called from finance with payload ${JSON.stringify(reqBody)}`,
      );
      await this.enquiryService.handlePaymentDetails(reqBody, req);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        {},
        'Payment status updated',
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
  @Patch(':enquiryId/move-to-next-stage')
  async moveEnquiryToNextStage(
    @Req() req: Request,
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Body() reqBody: MoveToNextStageRequestDto,
  ) {
    console.log('is it here');

    try {
      this.loggerService.log(
        `Move enquiry to next Stage API called for enquiryId - ${enquiryId} with payload - ${JSON.stringify(reqBody)}`,
      );
      const object = await this.enquiryStageUpdateService.moveToNextStage(
        enquiryId,
        reqBody.currentStage,
        req,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        {},
        'Enquiry stages updated',
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
  // @UseInterceptors(ValidateUpdateEnquiryRequest)
  @Patch(':enquiryId')
  async updateEnquiry(
    @Req() req: Request,
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Body() reqBody: any,
  ) {
    try {
      this.loggerService.log(
        `Update enquiry registration API called with payload - ${JSON.stringify(reqBody)}`,
      );

      const createdByDetails = extractCreatedByDetailsFromBody(req);
      const userInfo = createdByDetails;
      delete req?.body?.created_by;

      const updatedEnquiryDetails = await this.enquiryService.update(
        enquiryId,
        reqBody,
        userInfo,
        req,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        updatedEnquiryDetails,
        'Enquiry registration updated',
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
  @Get(':enquiryId')
  async getEnquiryDetails(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Query('platform') platform: string,
  ) {
    try {
      this.loggerService.log(
        `Get enquiry details by enquiry id API called with id: ${enquiryId}`,
      );
      const enquiryDetails =
        await this.enquiryService.getEnquiryDetails(enquiryId);
      return this.responseService.sendResponse(
        res,
        enquiryDetails ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        enquiryDetails ?? {},
        enquiryDetails ? 'Enquiry details found' : 'Enquiry details not found',
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
  @Post('cc/list')
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'size', required: false, type: String })
  async getEnquiryDetailsCC(
    @Req() req: Request,
    @Res() res: Response,
    @Query('page') page: number,
    @Query('size') size: number,
    @Body() filter: FilterDto,
  ) {
    try {
      this.loggerService.log(`Post cc enquiries list api called`);
      const filtersArray = filter;
      const createdByDetails = extractCreatedByDetailsFromBody(req);
      const { user_id } = createdByDetails;

      const cacheKey = `cc_list:${user_id}:${page}:${size}:${JSON.stringify(filtersArray)}`;

      const cachedData = await this.redisInstance?.getData(cacheKey);
      if (cachedData) {
        this.loggerService.log(`Cache hit for key: ${cacheKey}`);
        return this.responseService.sendResponse(
          res,
          HttpStatus.OK,
          {
            ...cachedData,
            _fromCache: true,
            _cachedAt: new Date().toISOString(),
          },
          'Enquiries found (from cache)',
        );
      }

      const enquiryDetails = await this.enquiryService.getEnquiryDetailsCC(
        req,
        page,
        size,
        filtersArray.filters,
      );

      await this.redisInstance?.setData(cacheKey, enquiryDetails, 300);

      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        {
          ...enquiryDetails,
          _fromCache: false,
          _cachedAt: null,
        },
        'Enquiries found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: UpdateEnquiryParentDetailsResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Patch(':enquiryId/parent-details')
  async addParentDetails(
    @Req() req: Request,
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Body() reqBody: UpdateParentDetailsRequestDto,
  ) {
    try {
      this.loggerService.log(
        `Update enquiry parent details API called with the payload : ${JSON.stringify(reqBody)}`,
      );
      const updatedEnquiryDetails = await this.enquiryService.update(
        enquiryId,
        reqBody,
        null,
        req,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        updatedEnquiryDetails,
        'Parent details updated in enquiry',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: UpdateContactDetailsResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Patch(':enquiryId/contact-details')
  async addContactDetails(
    @Req() req: Request,
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Body() reqBody: UpdateContactDetailsRequestDto,
  ) {
    try {
      this.loggerService.log(
        `Update enquiry contact details API called with the payload : ${JSON.stringify(reqBody)}`,
      );
      const updatedEnquiryDetails = await this.enquiryService.update(
        enquiryId,
        reqBody,
        null,
        req,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        updatedEnquiryDetails,
        'Contact details updated in enquiry',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: UpdateMedicalDetailsResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Patch(':enquiryId/medical-details')
  async addMedicalDetails(
    @Req() req: Request,
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Body() reqBody: UpdateMedicalDetailsDto,
  ) {
    try {
      this.loggerService.log(
        `Update medical contact details API called with the payload : ${JSON.stringify(reqBody)}`,
      );
      const updatedEnquiryDetails = await this.enquiryService.update(
        enquiryId,
        reqBody,
        null,
        req,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        updatedEnquiryDetails,
        'Medical details updated in enquiry',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: UpdateBankDetailsResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Patch(':enquiryId/bank-details')
  async addBankDetails(
    @Req() req: Request,
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Body() reqBody: UpdateBankDetailsDto,
  ) {
    try {
      this.loggerService.log(
        `Update bank contact details API called with the payload : ${JSON.stringify(reqBody)}`,
      );
      let enquiryDetails = { ...reqBody.data };
      const { upi } = reqBody.data;
      if (upi) {
        const encrytedUpiID = this.enquiryService.encryptData(upi);
        enquiryDetails = { ...enquiryDetails, upi: encrytedUpiID };
      }
      const updatedEnquiryDetails = await this.enquiryService.update(
        enquiryId,
        reqBody,
        null,
        req,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        updatedEnquiryDetails,
        'Bank details updated in enquiry',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Post(':enquiryId/upload-document/:documentId')
  @ApiOperation({ summary: 'Upload document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document file to upload',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadEnquiryDocument(
    @Req() req: Request,
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Param('documentId', ParseIntPipe) documentId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      this.loggerService.log(
        `Upload document Api called with request param : enquiryId: ${enquiryId}`,
      );
      const result = await this.enquiryService.uploadEnquiryDocument(
        req,
        enquiryId,
        documentId,
        file,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Document uploaded',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: GetUploadedDocumentUrlResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Get(':enquiryId/document/:documentId')
  async getUploadedDocumentUrl(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Param('documentId', ParseIntPipe) documentId: number,
    @Query('download', ParseBoolPipe) download: boolean,
  ) {
    try {
      this.loggerService.log(
        `API to get uploaded document url called with enquiryId - ${enquiryId}, documentId - ${documentId}`,
      );
      const enquiryTimeline = await this.enquiryService.getUploadedDocumentUrl(
        enquiryId,
        documentId,
        download,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        enquiryTimeline,
        'Document url',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: GetUploadedDocumentUrlResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Patch(':enquiryId/document/:documentId')
  async deleteUploadedDocumentUrl(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Param('documentId', ParseIntPipe) documentId: number,
    @Query('delete') deleted: string,
    @Query('verify') verify: string,
  ) {
    try {
      this.loggerService.log(
        `API to delete or verify uploaded document url called with enquiryId - ${enquiryId}, documentId - ${documentId}, deleted - ${deleted}, verify - ${verify}`,
      );
      if (deleted && deleted === 'true') {
        await this.enquiryService.deleteUploadedDocument(enquiryId, documentId);
        return this.responseService.sendResponse(
          res,
          HttpStatus.OK,
          {},
          'Document deleted',
        );
      }
      if (verify) {
        await this.enquiryService.verifyUploadedDocument(
          enquiryId,
          documentId,
          verify === 'true' ? true : false,
        );
        return this.responseService.sendResponse(
          res,
          HttpStatus.OK,
          {},
          'Document verified',
        );
      }
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: GetEnquiryTimelineResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @ApiQuery({ name: 'eventType', required: false, type: String })
  @ApiQuery({ name: 'eventSubType', required: false, type: String })
  @Get(':enquiryId/timeline')
  async getEnquiryTimeline(
    @Res() res: Response,
    @Query('eventType') eventType: string,
    @Query('eventSubType') eventSubType: string,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
  ) {
    try {
      this.loggerService.log(
        `API to get the enquiry timeline called for enquiryId - ${enquiryId}`,
      );
      const filter = {};
      if (eventType) filter['eventType'] = eventType;
      if (eventSubType) filter['eventSubType'] = eventSubType;
      const enquiryTimeline = await this.enquiryService.getEnquiryTimeline(
        enquiryId,
        filter,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        enquiryTimeline,
        'Enquiry timeline',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: ChangeEnquiryStatusResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Patch(':enquiryId/status')
  async changeEnquiryStatus(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Query('status') status: EEnquiryStatus,
    @Body() reqBody: UpdateEnquiryStatusRequestDto,
  ) {
    try {
      this.loggerService.log(
        `Update enquiry status API called with enquiryId : ${enquiryId} and status : ${status}`,
      );
      await this.enquiryService.updateEnquiryStatus(enquiryId, status, reqBody);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        {},
        'Enquiry status changed',
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
  @ApiParam({ name: 'enquiryId', required: true, type: String })
  @Get('/:enquiryId/similar-enquiries')
  async getSimilarEnquiries(
    @Req() req: Request,
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
  ) {
    try {
      this.loggerService.log(
        `Get similar enquiries API called with enquiryId: ${enquiryId}`,
      );
      const result = await this.enquiryService.getSimilarEnquiries(
        enquiryId,
        req.query?.user_id ? +req.query?.user_id : null,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Similar enquiries found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Get('/:enquiryId/merged-enquiries')
  async getMergedEnquiry(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
  ) {
    try {
      this.loggerService.log(
        `Get merged enquiries API called with enquiryId: ${enquiryId}`,
      );
      const result = await this.enquiryService.getMergedEnquiries(enquiryId);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Merged enquiries',
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
  @ApiQuery({ name: 'pageSize', type: Number, required: true })
  @ApiQuery({ name: 'pageNumber', type: Number, required: true })
  @Get(':enquiryId/enquirer-details')
  async getEnquirerDetails(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Query('pageSize', ParseIntPipe) pageSize: number,
    @Query('pageNumber', ParseIntPipe) pageNumber: number,
  ) {
    try {
      this.loggerService.log(
        `API to get the enquirer details is called with enquiryId: ${enquiryId}`,
      );
      const enquirerDetails = await this.enquiryService.getEnquirerDetails(
        enquiryId,
        pageSize,
        pageNumber,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        enquirerDetails,
        'Enquirer details found',
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
  @ApiParam({ name: 'enquiryId', required: true, type: String })
  @Get('/:enquiryId/transfer-enquiry-details')
  async getTransferEnquiryDetails(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
  ) {
    try {
      this.loggerService.log(
        `Get transfer enquiry details API called with enquiryId: ${enquiryId}`,
      );
      const result =
        await this.enquiryService.getEnquiryTransferDetails(enquiryId);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Transfer enquiry details found',
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
  @ApiParam({ name: 'enquiryId', required: true, type: String })
  @Get('/:enquiryId/reassign-enquiry-details')
  async getReassignEnquiryDetails(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
  ) {
    try {
      this.loggerService.log(
        `Get reassign enquiry details API called with enquiryId: ${enquiryId}`,
      );
      const result =
        await this.enquiryService.getEnquiryReassignDetails(enquiryId);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Reassign enquiry details found',
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
  status: HttpStatus.BAD_REQUEST,
  description: 'Invalid data validation error response',
  type: RequestValidationError,
})
@Post('list/global-search')
  async searchEnquiryListGloballyByText(
    @Req() req: Request,
    @Res() res: Response,
    @Body() searchDto: GlobalSearchEnquiryDto,
  ) {
    try {
      this.loggerService.log(`Global search enquiry list api called`);
      const enquiryDetails =
        await this.enquiryService.globalSearchEnquiryListing(
          req,
          searchDto.page,
          searchDto.size,
          searchDto.search,
        );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        enquiryDetails,
        'Enquiries found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiParam({ name: 'enquiryId', required: true, type: String })
  @Post('/:enquiryId/merge-enquiry-details')
  async postMergeEnquiries(
    @Body() body: GetMergeDto,
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
  ) {
    try {
      this.loggerService.log(
        `Get merge enquiry details API called with enquiryId: ${enquiryId}`,
      );
      const result = await this.enquiryService.getMergeEnquiryDetails(
        enquiryId,
        body,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Merge enquiry details found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: GetMergeEnquiryDetailsApiResponse,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @ApiParam({ name: 'enquiryId', required: true, type: String })
  @Get('/:enquiryId/merge-enquiry-details')
  async getMergeEnquiries(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
  ) {
    try {
      this.loggerService.log(
        `Get merge enquiry details API called with enquiryId: ${enquiryId}`,
      );
      const result =
        await this.enquiryService.getMergeEnquiryDetails(enquiryId);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Merge enquiry details found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiParam({ name: 'schoolId', required: true, type: Number })
  @ApiParam({ name: 'enquiryId', required: true, type: String })
  @ApiParam({ name: 'download', required: false, type: Boolean })
  @Get('/:enquiryId/:schoolId/generate-terms-and-conditions-pdf')
  async generateTermsAndConditionPdf(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Param('schoolId', ParseIntPipe)
    schoolId: number,
    @Query('download') download?: boolean,
  ) {
    try {
      const result = await this.enquiryService.generateTermsAndConditionPdf(
        enquiryId,
        schoolId,
        download,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Terms and conditions pdf Generated',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiParam({ name: 'enquiryId', required: true, type: String })
  @Get('/:enquiryId/trigger-terms-and-condition-email')
  async triggerTermsAndConditionEmail(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
  ) {
    try {
      this.loggerService.log(
        `API to trigger terms and conditions email called for enquiryId - ${enquiryId}`,
      );
      await this.enquiryService.triggerTermsAndConditionEmail(enquiryId);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        {},
        'Terms and conditions email sent',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiParam({ name: 'enquiryId', required: true, type: String })
  @Get('/:enquiryId/accept-terms-and-condition')
  async showTermsAndCondition(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
  ) {
    try {
      const result =
        await this.enquiryService.acceptTermsAndCondition(enquiryId);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Terms and conditions accepted',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Post('admission-status-update')
  async admissionStatusUpdate(
    @Req() req: Request,
    @Res() res: Response,
    @Body() dto: UpdateAdmissionDto,
  ) {
    try {
      const result = await this.enquiryService.updateAdmissionStatus(dto, req);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Merge enquiry details found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Post('edit-fee-attached')
  async checkFeeAttached(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CheckFeePayload,
  ) {
    try {
      const result = await this.enquiryService.checkIfFeeAttached(body, req);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'succesfull checkIfFeeAttached',
      );
    } catch (error) {
      return this.responseService.errorResponse(
        res,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'An error occurred',
        error.cause,
      );
    }
  }

  //API: use to map correct sibling
  @Post('map-correct-sibling')
  async updateCoGloble(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: MapSiblingsDto,
  ) {
    try {
      const result = await this.enquiryService.mapCorrectSibling(
        body?.siblings,
        req,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Sibling mapped Succesfull',
      );
    } catch (error) {
      return this.responseService.errorResponse(
        res,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'An error occurred',
        error.cause,
      );
    }
  }
  //API: use to map correct guardian
  @Post('map-correct-guardian')
  async mapCorrectGuardian(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateAcStudentGuardianArrayDto,
  ) {
    try {
      const result = await this.enquiryService.updateStudentGuardianMapping(
        body.guardians,
        req,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Guardian Update Succesfull',
      );
    } catch (error) {
      return this.responseService.errorResponse(
        res,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'An error occurred',
        error.cause,
      );
    }
  }
  //API: use to find list of guardian
  @Post('validate-child-parent')
  async upadteAcStudentGuardian(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: GetValidParent,
  ) {
    try {
      const result = await this.enquiryService.findGurdian(body, req);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Guardian Found Succesfull',
      );
    } catch (error) {
      return this.responseService.errorResponse(
        res,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'An error occurred',
        error.cause,
      );
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
  @Get('/ay/enquiry-report')
  async getReport(@Res() res: Response, @Req() req: Request) {
    const createdByDetails = extractCreatedByDetailsFromBody(req);
    const { user_id } = createdByDetails;

    const cacheKey = `user-${user_id}-enquiry-report-${1}`;
    const cachedData = await this.redisInstance?.getData(cacheKey);

    if (cachedData) {
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        cachedData,
        'Enquiry details report found',
      );
    }
    const result = await this.enquiryService.enquiryDetailsReport();

    await this.redisInstance?.setData(cacheKey, result, 60);

    try {
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Inquiry details report found',
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
  @Get('/ay/admission-enquiry-report')
  async getReportForAdmissionEnquiry(
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const createdByDetails = extractCreatedByDetailsFromBody(req);
    const { user_id } = createdByDetails;

    const cacheKey = `admission-enquiry-report`;
    const cachedData = await this.redisInstance?.getData(cacheKey);

    if (cachedData) {
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        cachedData,
        'Enquiry details report found from redis',
      );
    }
    const result = await this.enquiryService.admissionEnquiryReport();
    await this.redisInstance?.setData(cacheKey, result, 720);
    // await this.redisInstance?.setData(cacheKey, result, 60 * 10);

    try {
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Inquiry details report found',
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
  @Get('/request-report/:reportType')
  async getEnquiryReport(
    @Res() res: Response,
    @Req() req: Request,
    @Param('reportType') reportType: string,
  ) {
    const jobId: any = Number(Date.now().toString().slice(-5));

    await this.jobShadulerService.createLog({
      jobId,
      user: 'System',
      event: `${reportType} details report`,
      jobData: null,
    });

    console.log('jobId--->', jobId);

    // ✅ Assign background task to request
    setTimeout(async () => {
      console.log(`Started processing job: ${jobId}`);

      try {
        if (reportType === 'enquiry') {
          await this.enquiryService.enquiryDetailsReport(jobId);
        } else {
          await this.enquiryService.admissionEnquiryReport(jobId);
        }

        console.log(`✅ Completed job: ${jobId}`);
      } catch (err) {
        console.error(`❌ Failed job: ${jobId}`, err);

        await this.jobShadulerService.updateJob(jobId, {
          jobId,
          user: 'System',
          event: `${reportType} details report`,
          jobData: {
            error: err?.message,
            status: 'failed',
            timestamp: new Date().toISOString(),
          },
        });
      }
    }, 10);

    // ✅ Send response immediately (user not waiting)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: jobId,
      message: 'Report generation started',
    });
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
  @Get('/get/report/:jobId')
  async getAdmissionReport(
    @Param('jobId') jobId: string,
    @Res() res: Response,
  ) {
    let result: any = await this.jobShadulerService.getOneByJobId(jobId);

    if (result?.jobData?.url) {
      result = result?.jobData;
      await this.jobShadulerService.deleteJob(jobId);
    } else if (result) {
      result = 'InProgress';
    } else {
      result = 'Job Not Found';
    }
    try {
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Inquiry details report by jobId',
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
  @ApiParam({ name: 'enquiryId', required: true, type: String })
  @Post(':enquiryId/kit-number/add')
  async addKitNumber(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Body() reqBody: AddKitNumberRequestDto,
  ) {
    try {
      const response = await this.enquiryService.addKitNumber(
        enquiryId,
        reqBody.kitNumber,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        {},
        response ? 'Kit number added' : 'Kit number already exists',
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
  @ApiParam({ name: 'enquiryId', required: true, type: String })
  @Patch(':enquiryId/ivt-status')
  async updateIvtEnquiryStatus(
    @Res() res: Response,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
    @Body() reqBody: UpdateIvtEnquiryStatusDto,
  ) {
    try {
      this.loggerService.log(
        `API to update IVT enquiry status called with the payload : [EnquiryId] : ${enquiryId}, [RequestBody] : ${JSON.stringify(reqBody)}`,
      );
      await this.enquiryService.updateIvtEnquiryStatus(enquiryId, reqBody);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        {},
        'IVT inquiry status updated',
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
  @Post('ivt-status/getEnquiry')
  async getEnquiryNumberWithGivenIvtData(
    @Res() res: Response,
    @Body() reqBody: GetEnquiryNumberWithGivenIvtDto,
  ) {
    try {
      console.log('reqBody', reqBody);

      const data = await this.enquiryService.getEnquirybyStudentId(reqBody);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        data,
        'IVT inquiry detail',
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
  @Post('/ay/appointment-report')
  async getAppointementReport(
    @Res() res: Response,
    @Req() req: Request,
    @Body() body: { start_date?: string; end_date?: string },
    // @Query() query: { start_date?: string; end_date?: string },
  ) {
    // const createdByDetails = extractCreatedByDetailsFromBody(req);
    // const { user_id } = createdByDetails;

    // const cacheKey = `user-${user_id}-admission-enquiry-report-${1}`;
    // const cachedData = await this.redisInstance?.getData(cacheKey);

    // if (cachedData) {
    //   return this.responseService.sendResponse(
    //     res,
    //     HttpStatus.OK,
    //     cachedData,
    //     'Enquiry details report found',
    //   );
    // }

    const result = await this.enquiryService.dailyEnquiryReport(body);

    // await this.redisInstance?.setData(cacheKey, result, 60 * 10);

    try {
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Inquiry details report found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Get('metabase/student-profile-details')
  async getStudentProfileDetails(@Res() res: Response) {
    try {
      const result = await this.enquiryService.getMetabaseStudentProfileDetails();
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'AC Student Profile Details from Metabase',
      );
    } catch (err) {
      return this.responseService.errorResponse(
        res,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        err.message || 'Failed to fetch data from Metabase',
      );
    }
  }

  @Get('metabase/student-profile-summary')
  async getStudentProfileSummary(@Res() res: Response) {
    try {
      const result = await this.enquiryService.getMetabaseStudentProfileSummary();
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'AC Student Profile Summary from Metabase',
      );
    } catch (err) {
      return this.responseService.errorResponse(
        res,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        err.message || 'Failed to fetch data from Metabase',
      );
    }
  }

 @Get('/ay/outside-tat-followup-report')
  async getReportForOutsideTatFollowup(
    @Res() res: Response,
    @Req() req: Request,
  ) {
    // parse filters from query (keeps GET-compatible)
    const {
      start_date,
      end_date,
      filter_by,   // "CC Only", "School Only", "All"
      group_by,    // comma separated values if sent (not used in this report's grouping)
    } = req.query as any;

    // helper to coerce query params -> array
    const toArray = (v: any) => {
      if (v === undefined || v === null) return undefined;
      if (Array.isArray(v)) return v;
      // accept comma separated string too
      return String(v).split(',').map((s) => s.trim()).filter(Boolean);
    };

    const filters: any = {};
    if (start_date) filters.start_date = start_date;
    if (end_date) filters.end_date = end_date;
    if (filter_by) filters.filter_by = filter_by;
    // ensure group_by is always an array when present
    if (group_by) {
      filters.group_by = Array.isArray(group_by) ? group_by : String(group_by).split(',').map((s) => s.trim());
    }

    // Parse common multi-value filters (accept single, array, comma-separated)
    const maybeArrayKeys = ['cluster', 'school', 'enquiryNo', 'enquiryName', 'studentName', 'academicYear', 'contactNo', 'enquiryStage','currentOwner','followUpDate','ageingDays'];
    maybeArrayKeys.forEach((k) => {
      // allow both foo[] and foo
      const val = toArray((req.query as any)[k] ?? (req.query as any)[`${k}[]`]);
      if (val && val.length) filters[k] = val;
    });

    const cacheKeyParts = [
      'outside-tat-followup-report',
      `start=${filters.start_date || 'NA'}`,
      `end=${filters.end_date || 'NA'}`,
      `filter_by=${filters.filter_by || 'All'}`,
      `group_by=${filters.group_by ? filters.group_by.join('-') : 'default'}`,
      `cluster=${filters.cluster ? filters.cluster.join('-') : 'NA'}`,
      `school=${filters.school ? filters.school.join('-') : 'NA'}`,
      `course=${filters.enquiryNo ? filters.enquiryNo.join('-') : 'NA'}`,
      `board=${filters.enquiryName ? filters.enquiryName.join('-') : 'NA'}`,
      `grade=${filters.studentName ? filters.studentName.join('-') : 'NA'}`,
      `stream=${filters.academicYear ? filters.academicYear.join('-') : 'NA'}`,
      `source=${filters.contactNo ? filters.contactNo.join('-') : 'NA'}`,
      `subSource=${filters.enquiryStage ? filters.enquiryStage.join('-') : 'NA'}`,
      `currentOwner=${filters.currentOwner ? filters.currentOwner.join('-') : 'NA'}`,
      `followUpDate=${filters.followUpDate ? filters.followUpDate.join('-') : 'NA'}`,
      `ageingDays=${filters.ageingDays ? filters.ageingDays.join('-') : 'NA'}`,
    ];
    const cacheKey = cacheKeyParts.join(':');
    const cachedData = await this.redisInstance?.getData(cacheKey);

    if (cachedData) {
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        cachedData,
        'Outside TAT details report found from redis',
      );
    }

    // console.log("filters=>\n", JSON.stringify(filters, null, 2));
    const finalRows = await this.enquiryService.outsideTatFollowupReport(filters);
    const reportFile = await this.enquiryService.generateAndUploadOutsideTatFollowupReportCsv(finalRows);
    await this.redisInstance?.setData(cacheKey, reportFile, 720);

    try {
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        reportFile,
        'Outside TAT follow up report',
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
  @Post('handleReopn')
  async handleReopn(@Res() res: Response, @Body() reqBody: any) {
    try {
      const data = await this.enquiryService.checkReopenNeeded(reqBody);
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        data,
        'handleReopn',
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
  @Post('/ay/source-conversion-report')
  async get(
    @Res() res: Response,
    @Req() req: Request,
    @Body() body: any,
    // @Query() query: { start_date?: string; end_date?: string },
  ) {
    // const createdByDetails = extractCreatedByDetailsFromBody(req);
    // const { user_id } = createdByDetails;

    // const cacheKey = `user-${user_id}-admission-enquiry-report-${1}`;
    // const cachedData = await this.redisInstance?.getData(cacheKey);

    // if (cachedData) {
    //   return this.responseService.sendResponse(
    //     res,
    //     HttpStatus.OK,
    //     cachedData,
    //     'Enquiry details report found',
    //   );
    // }

    const result = await this.shortUrlService.getByHashUrl(body);

    // await this.redisInstance?.setData(cacheKey, result, 60 * 10);

    try {
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Inquiry details report found',
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
  @Get('/ay/source-wise-conversion-report')
  async getReportForSourceConversion(
    @Res() res: Response,
    @Req() req: Request,
  ) {
    // parse filters from query (keeps GET-compatible)
    const {
      start_date,
      end_date,
      filter_by, // "CC Only", "School Only", "All"
      group_by, // comma separated values if sent (not used in this report's grouping)
    } = req.query as any;

    // helper to coerce query params -> array
    const toArray = (v: any) => {
      if (v === undefined || v === null) return undefined;
      if (Array.isArray(v)) return v;
      // accept comma separated string too
      return String(v)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    };

    const filters: any = {};
    if (start_date) filters.start_date = start_date;
    if (end_date) filters.end_date = end_date;
    if (filter_by) filters.filter_by = filter_by;
    // ensure group_by is always an array when present
    if (group_by) {
      filters.group_by = Array.isArray(group_by)
        ? group_by
        : String(group_by)
            .split(',')
            .map((s) => s.trim());
    }

    // Parse common multi-value filters (accept single, array, comma-separated)
    const maybeArrayKeys = [
      'cluster',
      'school',
      'course',
      'board',
      'grade',
      'stream',
      'source',
      'subSource',
    ];
    maybeArrayKeys.forEach((k) => {
      // allow both foo[] and foo
      const val = toArray(
        (req.query as any)[k] ?? (req.query as any)[`${k}[]`],
      );
      if (val && val.length) filters[k] = val;
    });

    const cacheKeyParts = [
      'source-wise-inquiry-status-report',
      `start=${filters.start_date || 'NA'}`,
      `end=${filters.end_date || 'NA'}`,
      `filter_by=${filters.filter_by || 'All'}`,
      `group_by=${filters.group_by ? filters.group_by.join('-') : 'default'}`,
      `cluster=${filters.cluster ? filters.cluster.join('-') : 'NA'}`,
      `school=${filters.school ? filters.school.join('-') : 'NA'}`,
      `course=${filters.course ? filters.course.join('-') : 'NA'}`,
      `board=${filters.board ? filters.board.join('-') : 'NA'}`,
      `grade=${filters.grade ? filters.grade.join('-') : 'NA'}`,
      `stream=${filters.stream ? filters.stream.join('-') : 'NA'}`,
      `source=${filters.source ? filters.source.join('-') : 'NA'}`,
      `subSource=${filters.subSource ? filters.subSource.join('-') : 'NA'}`,
    ];
    const cacheKey = cacheKeyParts.join(':');
    const cachedData = await this.redisInstance?.getData(cacheKey);

    if (cachedData) {
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        cachedData,
        'Enquiry details report found from redis',
      );
    }

    // console.log("filters=>\n", JSON.stringify(filters, null, 2));
    const finalRows =
      await this.enquiryService.sourceWiseInquiryStatusReport_BA(filters);
    const reportFile =
      await this.enquiryService.generateAndUploadSourceWiseInquiryStatusCsv(
        finalRows,
      );

    await this.redisInstance?.setData(cacheKey, reportFile, 720);

    try {
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        reportFile,
        'Source Wise Conversioneport',
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
  @Post('/createShortUrl')
  async createShortUrl(
    @Res() res: Response,
    @Req() req: Request,
    @Body() body: any,
  ) {
    const result = await this.shortUrlService.createUrl(body);

    try {
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'ShortUrl created',
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
  @Get('/getshortUrl/:id')
  async getshortUrl(@Res() res: Response, @Param('id') id: any) {
    console.log('id___', id);
    const result = await this.shortUrlService.getByHashUrl(id);
    console.log('result___', result);
    try {
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Short Url Found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }
}
