import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { LoggerService, ResponseService } from 'src/utils';

import { DashboardDto } from './dashboard.dto';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private loggerService: LoggerService,
    private responseService: ResponseService,
    private dashboardService: DashboardService,
  ) {}

  @Get('/enquiry-management-summary')
  async getEnquiryManagementSummary(
    @Res() res: Response,
    @Query() query: DashboardDto,
  ) {
    try {
      this.loggerService.log(
        `Get enquiry manangement summary with req body: ${JSON.stringify(query)}`,
      );
      const academic_year_ids = query?.academic_year_ids;
      const result =
        await this.dashboardService.getEnquiryManagementSummary(
          academic_year_ids,
        );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Enquiry management summary found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Get('/admission-management-summary')
  async getAdmissionManagementSummary(
    @Res() res: Response,
    @Query() query: DashboardDto,
  ) {
    try {
      this.loggerService.log(
        `Get admission manangement summary with req body: ${JSON.stringify(query)}`,
      );
      const academic_year_ids = query?.academic_year_ids;
      const result =
        await this.dashboardService.getAdmissionManagementSummary(
          academic_year_ids,
        );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Admission management summary found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }
  @Get('/target-achievement-summary')
  async getTargetVsManagementSummary(
    @Res() res: Response,
    @Query() query: DashboardDto,
  ) {
    try {
      this.loggerService.log(
        `Get target vs achivement manangement summary with req body: ${JSON.stringify(query)}`,
      );
      const academic_year_ids = query?.academic_year_ids;
      const result =
        await this.dashboardService.getTargetVsAchievementSummary(
          academic_year_ids,
        );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Target vs achivement summary found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }
}
