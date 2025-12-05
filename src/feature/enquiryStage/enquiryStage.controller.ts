import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  HttpException,
  HttpStatus,
  Post,
  Body,
  Delete,
  ParseIntPipe,
  Patch,
  Type,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags
} from '@nestjs/swagger';
import { Response } from 'express';
import { ESwaggerDecorators, ResponseService, Swagger, TSwaggerOptions, RequestValidationError } from '../../utils';
import { EnquiryStageService } from './enquiryStage.service';
import {
  CreateEnquiryStageRequestDto,
  EnquiryStageResponseDto,
  DeleteEnquiryStageResponseDto,
  GetEnquiryStageListResponseDto,
  UpdateEnquiryStageRequestDto,
  UpdateEnquiryStageResponseDto,
  GetEnquiryListForMappingDto,
  FilterDto
} from './enquiryStage.dto';

@ApiTags('Enquiry Stage')
@ApiBearerAuth('JWT-auth')
@Controller('enquiry-stage')
export class EnquiryStageController {
  constructor(
    private enquiryStageService: EnquiryStageService,
    private responseService: ResponseService,
  ) { }

  // Create enquiry stage
  @Swagger({
    response: {
      [ESwaggerDecorators.CREATED_RESPONSE]: {
        status: HttpStatus.CREATED,
        description: 'Success response',
        type: EnquiryStageResponseDto as Type<unknown>
      },
      [ESwaggerDecorators.BAD_REQUEST_RESPONSE]: {
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error response',
        type: RequestValidationError as Type<unknown>
      }
    }
  } as TSwaggerOptions)
  @Post('create')
  async createEnquiryStage(
    @Res() res: Response,
    @Body() reqBody: CreateEnquiryStageRequestDto,
  ) {
    try {
      const result = await this.enquiryStageService.createEnquiryStage(reqBody);
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Enquiry stage created',
      );
    } catch (err) {
      throw err;
    }
  }

  @Swagger({
    response: {
      [ESwaggerDecorators.OK_RESPONSE]: {
        status: HttpStatus.OK,
        description: 'Success response',
        type: GetEnquiryStageListResponseDto as Type<unknown>
      },
      [ESwaggerDecorators.BAD_REQUEST_RESPONSE]: {
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error response',
        type: RequestValidationError as Type<unknown>
      }
    },
    query: [
      { name: 'pageNumber', description: 'Current page number', required: true, type: 'number' },
      { name: 'pageSize', description: 'Number of data on a single page', required: true, type: 'number' },
    ]
  } as TSwaggerOptions)
  @Post('list')
  async getAllEnquiryStages(
    @Res() res: Response,
    @Query('pageNumber', ParseIntPipe) pageNumber: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
    @Body() filterArray?: FilterDto
  ) {
    try {
      delete filterArray?.email
      const result = await this.enquiryStageService.getEnquiryStageList(
        pageNumber,
        pageSize,
        filterArray.filters
      );
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Enquiry stage list',
      );
    } catch (err) {
      throw err;
    }
  }

  // Get enquiry stage details by _id
  @Swagger({
    response: {
      [ESwaggerDecorators.OK_RESPONSE]: {
        status: HttpStatus.OK,
        description: 'Success response',
        type: GetEnquiryStageListResponseDto as Type<unknown>,
      },
      [ESwaggerDecorators.BAD_REQUEST_RESPONSE]: {
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        type: RequestValidationError as Type<unknown>,
      }
    }
  } as TSwaggerOptions)
  @Get(':stageId')
  async getEnquiryStageById(
    @Res() res: Response,
    @Param('stageId') stageId: string,
  ) {
    try {
      const result = await this.enquiryStageService.getById(stageId);
      if (!result) {
        throw new HttpException(
          { message: 'Enquiry stage not found', error: null },
          HttpStatus.NOT_FOUND,
        );
      }
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Enquiry stage found',
      );
    } catch (err) {
      if (err.status === HttpStatus.NOT_FOUND) {
        throw err;
      }
      throw new HttpException(
        {
          message: 'Error occurred while getting lead stage details',
          error: err,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Update enquiry stage details 
  @Swagger({
    response: {
      [ESwaggerDecorators.OK_RESPONSE]: {
        status: HttpStatus.OK,
        description: 'Success response',
        type: UpdateEnquiryStageResponseDto as Type<unknown>,
      },
      [ESwaggerDecorators.BAD_REQUEST_RESPONSE]: {
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        type: RequestValidationError as Type<unknown>,
      }
    }
  } as TSwaggerOptions)
  @Patch(':stageId')
  async updateEnquiryStage(
    @Param('stageId') stageId: string,
    @Body() reqBody: UpdateEnquiryStageRequestDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.enquiryStageService.updateById(
        stageId,
        reqBody,
      );
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Enquiry stage updated successfully',
      );
    } catch (err) {
      throw new HttpException(
        {
          message: 'Error occurred while updating lead stage',
          error: err,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Soft delete enquiry stage
  @Swagger({
    response: {
      [ESwaggerDecorators.OK_RESPONSE]: {
        status: HttpStatus.OK,
        description: 'Success response',
        type: DeleteEnquiryStageResponseDto as Type<unknown>
      },
      [ESwaggerDecorators.BAD_REQUEST_RESPONSE]: {
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        type: RequestValidationError as Type<unknown>,
      }
    }
  } as TSwaggerOptions)
  @Delete(':stageId')
  async deleteEnquiryStage(
    @Param('stageId') stageId: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.enquiryStageService.deleteById(stageId);
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Enquiry stage deleted',
      );
    } catch (err) {
      throw new HttpException(
        {
          message: 'Error occurred while deleting enquiry stage',
          error: err,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // get enquiry stage list for enquiry type mapping
  @Swagger({
    response: {
      [ESwaggerDecorators.OK_RESPONSE]: {
        status: HttpStatus.OK,
        description: 'Success response',
        type: GetEnquiryListForMappingDto as Type<unknown>
      },
      [ESwaggerDecorators.BAD_REQUEST_RESPONSE]: {
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        type: RequestValidationError as Type<unknown>,
      }
    }
  } as TSwaggerOptions)
  @Get('/mapping/list')
  async getEnquiryStagesForMapping(
    @Res() res: Response,
  ) {
    try {
      const result = await this.enquiryStageService.getEnquiryStagesForMapping(
      );
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Enquiry stage list',
      );
    } catch (err) {
      throw err;
    }
  }

  @Swagger({
    response: {
      [ESwaggerDecorators.OK_RESPONSE]: {
        status: HttpStatus.OK,
        description: 'Success response',
        type: GetEnquiryStageListResponseDto as Type<unknown>
      },
      [ESwaggerDecorators.BAD_REQUEST_RESPONSE]: {
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error response',
        type: RequestValidationError as Type<unknown>
      }
    },
    query: [
      { name: 'pageNumber', description: 'Current page number', required: true, type: 'number' },
      { name: 'pageSize', description: 'Number of data on a single page', required: true, type: 'number' },
    ]
  } as TSwaggerOptions)
  @Get('list/global-search')
  async globalSerchEnquiryStageList(
    @Res() res: Response,
    @Query('pageNumber', ParseIntPipe) pageNumber: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
    @Query('search') search: string,
  ) {
    try {
      const result = await this.enquiryStageService.globalSearchEnquiryStageListing(
        pageNumber,
        pageSize,
        search
      );
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Enquiry stage list',
      );
    } catch (err) {
      throw err;
    }
  }
}
