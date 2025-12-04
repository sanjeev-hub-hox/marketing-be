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
  LoggerService,
  RequestValidationError,
  ResponseService,
} from '../../utils';
import { EUnavailabilityOf } from '../slots/slot.type';
import {
  CancelCompetencyTestRequestDto,
  RescheduleCompetencyTestRequestDto,
  ScheduleCompetencyTestRequestDto,
  ScheduleCompetencyTestResponseDto,
} from './competencyTest.dto';
import { CompetencyTestService } from './competencyTest.service';
import { ECompetencyTestResult } from './competencyTest.type';

@ApiTags('Competency Test')
@ApiBearerAuth('JWT-auth')
@Controller('competency-test')
export class CompetencyTestController {
  constructor(
    private responseService: ResponseService,
    private competencyTestService: CompetencyTestService,
    private loggerService: LoggerService,
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
      const result = await this.competencyTestService.getAvailableSlots(
        enquiryId,
        date,
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
  @Post('/unavailable/add')
  async addUnavailableSlots(
    @Query('slotId') slotId: string,
    @Query('date') date: string,
    @Query('unavailabilityOf') unavailabilityOf: EUnavailabilityOf,
    @Res() res: Response,
  ) {
    try {
      const result = await this.competencyTestService.addUnavailableSlots(
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
        await this.competencyTestService.getSlotListForMarkingUnavailableSlots(
          schoolId,
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
  @ApiParam({ name: 'enquiryId', required: true, type: String })
  @Get('/:enquiryId')
  async getCompetencyTestDetails(
    @Param('enquiryId') enquiryId: string,
    @Res() res: Response,
  ) {
    try {
      const result =
        await this.competencyTestService.getCompetencyTestDetails(enquiryId);
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Competency test data found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: ScheduleCompetencyTestResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @ApiParam({ name: 'enquiryId', required: true, type: String })
  @Post('/:enquiryId/create')
  async scheduleCompetencyTest(
    @Req() req: Request,
    @Param('enquiryId') enquiryId: string,
    @Body() reqBody: ScheduleCompetencyTestRequestDto,
    @Res() res: Response,
  ) {
    try {
      const createdByDetails = extractCreatedByDetailsFromBody(req);
      const userInfo = createdByDetails;
      delete req?.body?.created_by;

      const result = await this.competencyTestService.scheduleCompetencyTest(
        enquiryId,
        reqBody,
        userInfo,
      );
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Competency test scheduled',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: ScheduleCompetencyTestResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @ApiParam({ name: 'enquiryId', required: true, type: String })
  @Post('/:enquiryId/cancel')
  async cancelCompetencyTest(
    @Req() req: Request,
    @Param('enquiryId') enquiryId: string,
    @Body() reqBody: CancelCompetencyTestRequestDto,
    @Res() res: Response,
  ) {
    try {
      const createdByDetails = extractCreatedByDetailsFromBody(req);
      const userInfo = createdByDetails;
      delete req?.body?.created_by;

      const result = await this.competencyTestService.cancelCompetencyTest(
        enquiryId,
        reqBody,
        userInfo,
      );
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Competency test cancelled',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: ScheduleCompetencyTestResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @ApiParam({ name: 'enquiryId', required: true, type: String })
  @Post('/:enquiryId/reschedule')
  async rescheduleCompetencyTest(
    @Req() req: Request,
    @Param('enquiryId') enquiryId: string,
    @Body() reqBody: RescheduleCompetencyTestRequestDto,
    @Res() res: Response,
  ) {
    try {
      const createdByDetails = extractCreatedByDetailsFromBody(req);
      const userInfo = createdByDetails;
      delete req?.body?.created_by;

      const result = await this.competencyTestService.rescheduleCompetencyTest(
        enquiryId,
        reqBody,
        userInfo,
      );
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Competency test rescheduled',
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
  @ApiQuery({
    name: 'result',
    required: true,
    type: String,
    enum: ECompetencyTestResult,
  })
  @Post('/:enquiryId/update-test-result')
  async updateCompetencyTestResult(
    @Req() req: Request,
    @Param('enquiryId') enquiryId: string,
    @Query('result') result: ECompetencyTestResult,
    @Res() res: Response,
  ) {
    try {
      this.loggerService.log(
        `API to update competency test result called with enquiryId : ${enquiryId}, result: ${result}`,
      );

      const createdByDetails = extractCreatedByDetailsFromBody(req);
      const userInfo = createdByDetails;
      delete req?.body?.created_by;

      await this.competencyTestService.updateCompetencyTestResult(
        enquiryId,
        result,
        userInfo,
        req
      );
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        {},
        'Competency test result updated',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }
}
