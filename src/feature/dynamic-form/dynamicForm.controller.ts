import {
  Controller,
  Get,
  HttpStatus,
  ParseIntPipe,
  Query,
  Res,
  Type,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import {
  ESwaggerDecorators,
  RequestValidationError,
  ResponseService,
  Swagger,
  TSwaggerOptions,
} from '../../utils';
import { GetEnquiryStageListResponseDto } from './dynamicForm.dto';
import { DynamicFormService } from './dynamicForm.service';

@ApiTags('Dynamic Form Listing')
@ApiBearerAuth('JWT-auth')
@Controller('dynamic-form')
export class DynamicFormController {
  constructor(
    private dynamicFormService: DynamicFormService,
    private responseService: ResponseService,
  ) {}

  @Swagger({
    response: {
      [ESwaggerDecorators.OK_RESPONSE]: {
        status: HttpStatus.OK,
        description: 'Success response',
        type: GetEnquiryStageListResponseDto as Type<unknown>,
      },
      [ESwaggerDecorators.BAD_REQUEST_RESPONSE]: {
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error response',
        type: RequestValidationError as Type<unknown>,
      },
    },
    query: [
      {
        name: 'pageNumber',
        description: 'Current page number',
        required: true,
        type: 'number',
      },
      {
        name: 'pageSize',
        description: 'Number of data on a single page',
        required: true,
        type: 'number',
      },
      {
        name: 'sort',
        description: 'Name of the column to be filtered',
        required: false,
        type: 'string',
      },
      {
        name: 'sortBy',
        description: 'Order of sorting i.e asc or desc',
        required: false,
        type: 'string',
      },
      {
        name: 'search',
        description: 'Search text',
        required: false,
        type: 'string',
      },
      {
        name: 'columns',
        description:
          'Name of the columns in which the search text is to be searched',
        required: false,
        type: 'string',
      },
      {
        name: 'operator',
        description: 'Search operator i.e contains, equals, notequals',
        required: false,
        type: 'string',
      },
    ],
  } as TSwaggerOptions)
  @Get('')
  async getAllEnquiryStages(
    @Res() res: Response,
    @Query('pageNumber', ParseIntPipe) pageNumber: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 10,
    @Query('sort') sort?: string,
    @Query('sortBy') sortBy?: string,
    @Query('search') search?: string,
    @Query('columns') columns?: string,
    @Query('operator') operator?: string,
  ) {
    try {
      const result = await this.dynamicFormService.getAll(
        pageNumber,
        pageSize,
        sort ?? null,
        sortBy ?? null,
        search ?? null,
        columns ?? null,
        operator ?? null,
      );
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Dynamic Form list',
      );
    } catch (err) {
      throw err;
    }
  }
}
