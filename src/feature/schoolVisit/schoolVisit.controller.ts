import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import {
  extractCreatedByDetailsFromBody,
  RequestValidationError,
  ResponseService,
} from '../../utils';
import { EUnavailabilityOf } from '../slots/slot.type';
import {
  CancelSchoolVisitRequestDto,
  CompleteSchoolVisitRequestDto,
  RescheduleSchoolVisitRequestDto,
  ScheduleSchoolVisitRequestDto,
  SchoolVisitCreateResponseDto,
} from './schoolVisit.dto';
import { SchoolVisitService } from './schoolVisit.service';

@ApiTags('School Visit')
@ApiBearerAuth('JWT-auth')
@Controller('school-visit')
export class SchoolVisitController {
  constructor(
    private responseService: ResponseService,
    private schoolVisitService: SchoolVisitService,
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
  @ApiQuery({ name: 'enquiryId', required: true, type: String })
  @ApiQuery({ name: 'date', required: true, type: String })
  @Get('/slots')
  async getAvailableSlots(
    @Query('enquiryId') enquiryId: string,
    @Query('date') date: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.schoolVisitService.getAvailableSlots(
        enquiryId,
        date,
      );
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'School visit found by id.',
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
  @Post('/unavailable/add')
  async addUnavailableSlots(
    @Query('slotId') slotId: string,
    @Query('date') date: string,
    @Query('unavailabilityOf') unavailabilityOf: EUnavailabilityOf,
    @Res() res: Response,
  ) {
    try {
      const result = await this.schoolVisitService.addUnavailableSlots(
        slotId,
        date,
        unavailabilityOf,
      );
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Competency test slots',
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
  @Post('/unavailable/available-slot-list')
  async getSlotListForMarkingUnavailableSlots(
    @Query('schoolId', ParseIntPipe) schoolId: number,
    @Query('date') date: string,
    @Query('unavailabilityOf') unavailabilityOf: EUnavailabilityOf,
    @Res() res: Response,
  ) {
    try {
      const result =
        await this.schoolVisitService.getSlotListForMarkingUnavailableSlots(
          schoolId,
          date,
          unavailabilityOf,
        );
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'School visit slots',
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
  @ApiParam({ name: 'enquiryId', required: false, type: String })
  @Get('/:enquiryId')
  async getSchoolVisitDetails(
    @Param('enquiryId') enquiryId: string,
    @Res() res: Response,
  ) {
    try {
      const result =
        await this.schoolVisitService.getSchoolVisitDetails(enquiryId);
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'School visit found by id.',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: SchoolVisitCreateResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @ApiParam({ name: 'enquiryId', required: true, type: String })
  @Post('/:enquiryId/schedule')
  async scheduleSchoolVisit(
    @Req() req: Request,
    @Param('enquiryId') enquiryId: string,
    @Body() reqBody: ScheduleSchoolVisitRequestDto,
    @Res() res: Response,
  ) {
    try {
      const createdByDetails = extractCreatedByDetailsFromBody(req);
      const userInfo = createdByDetails;
      delete req?.body?.created_by;

      const result = await this.schoolVisitService.scheduleSchoolVisit(
        enquiryId,
        reqBody,
        userInfo,
      );
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'School visit schedule',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: SchoolVisitCreateResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Post('/:enquiryId/cancel')
  async cancelSchoolVisit(
    @Req() req: Request,
    @Param('enquiryId') enquiryId: string,
    @Body() reqBody: CancelSchoolVisitRequestDto,
    @Res() res: Response,
  ) {
    try {
      const createdByDetails = extractCreatedByDetailsFromBody(req);
      const userInfo = createdByDetails;
      delete req?.body?.created_by;

      const result = await this.schoolVisitService.cancelSchoolVisit(
        enquiryId,
        reqBody,
        userInfo,
      );
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'School visit cancelled',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: SchoolVisitCreateResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Post('/:enquiryId/complete')
  async completeSchoolVisit(
    @Req() req: Request,
    @Param('enquiryId') enquiryId: string,
    @Body() reqBody: CompleteSchoolVisitRequestDto,
    @Res() res: Response,
  ) {
    try {
      const createdByDetails = extractCreatedByDetailsFromBody(req);
      const userInfo = createdByDetails;
      delete req?.body?.created_by;

      const result = await this.schoolVisitService.completeSchoolVisit(
        enquiryId,
        reqBody,
        userInfo,
      );
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'School visit completed.',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: SchoolVisitCreateResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Post('/:enquiryId/reschedule')
  async rescheduleSchoolVisit(
    @Req() req: Request,
    @Param('enquiryId') enquiryId: string,
    @Body() reqBody: RescheduleSchoolVisitRequestDto,
    @Res() res: Response,
  ) {
    try {
      const createdByDetails = extractCreatedByDetailsFromBody(req);
      const userInfo = createdByDetails;
      delete req?.body?.created_by;

      const result = await this.schoolVisitService.rescheduleSchoolVisit(
        enquiryId,
        reqBody,
        userInfo,
      );
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'School visit rescheduled',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }
}
