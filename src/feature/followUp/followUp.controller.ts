import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { LoggerService, ResponseService } from '../../utils';
import { RegexValidationPipe } from '../../validation';
import { FollowUpCreateRequestDto } from './followUp.dto';
import { FollowUpService } from './followUp.service';

@ApiTags('Follow Up')
@ApiBearerAuth('JWT-auth')
@Controller('follow-up')
export class FollowUpController {
  constructor(
    private responseService: ResponseService,
    private loggerService: LoggerService,
    private followUpService: FollowUpService,
  ) {}

  @Post('/:enquiryId/create')
  async createFollowUp(
    @Req() req: Request,
    @Res() res: Response,
    @Body() reqBody: FollowUpCreateRequestDto,
    @Param('enquiryId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryId: string,
  ) {
    try {
      this.loggerService.log(
        `Create follow up task API called with request payload : ${JSON.stringify(reqBody)} for enquiryId: ${enquiryId}`,
      );
      await this.followUpService.createFollowUp(enquiryId, reqBody);
      this.responseService.sendResponse(
        res,
        HttpStatus.CREATED,
        {},
        'Follow up details added',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }
}
