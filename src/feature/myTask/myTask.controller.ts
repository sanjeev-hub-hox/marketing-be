import {
  Body,
  Controller,
  Get,
  HttpStatus,
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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import {
  LoggerService,
  RequestValidationError,
  ResponseService,
} from '../../utils';
import { CreateMyTaskRequestDto } from './myTask.dto';
import { MyTaskService } from './myTask.service';
import { ETaskType } from './myTask.type';
import { MyTaskCron } from './myTask.cron';

@ApiTags('My Task')
@ApiBearerAuth('JWT-auth')
@Controller('my-task')
export class MyTaskController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly responseService: ResponseService,
    private readonly cronservice: MyTaskCron,
    private myTaskService: MyTaskService,
  ) {}

  // Route to create my task
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Post('create')
  async createMyTask(
    @Body() body: CreateMyTaskRequestDto,
    @Res() res: Response,
  ) {
    try {
      this.loggerService.log(
        `Create task API called with payload: ${JSON.stringify(body)}`,
      );
      await this.myTaskService.createMyTask(body);
      return this.responseService.sendResponse(
        res,
        HttpStatus.CREATED,
        {},
        'Task created',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  // Route to get the list of my task
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @Get('list')
  @ApiQuery({
    name: 'page',
    type: Number,
    required: true,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'size',
    type: Number,
    required: true,
    description: 'Page size',
  })
  @ApiQuery({
    name: 'type',
    enum: ETaskType,
    required: true,
    description: 'Task type',
  })
  async getMyTaskList(
    @Req() req: Request,
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number,
    @Query('type') type: ETaskType,
    @Res() res: Response,
  ) {
    try {
      this.loggerService.log(
        `Create task API called with payload: page: ${page}, size: ${size}, type: ${type}`,
      );
      const { created_by } = req.body;
      const { user_id } = created_by;
      const result = await this.myTaskService.getTaskList(
        page,
        size,
        type,
        user_id,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Task list',
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
  @Post('cron')
  async runCron(
    @Res() res: Response,
  ) {
    try {
      this.loggerService.log(
        `Running my task cron manually`,
      );
      await this.cronservice.createNewTaskOnTatExceeded();
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        {},
        'Successfully triggered the cron',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

}
