import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { ResponseService } from '../../utils';
import { SlotService } from './slot.service';

@ApiTags('Slot APIs')
@ApiBearerAuth('JWT-auth')
@Controller('slots')
export class SlotController {
  constructor(
    private responseService: ResponseService,
    private slotService: SlotService,
  ) {}

  @Get('add-master-slots')
  async fetchSchoolVisit(@Res() res: Response) {
    try {
      const result = await this.slotService.addSlots();
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Slots added',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }
}
