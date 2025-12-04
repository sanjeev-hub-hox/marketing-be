import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import {
  LoggerService,
  RequestValidationError,
  ResponseService,
} from '../../utils';
import { RegexValidationPipe } from '../../validation';
import {
  AddEnquiryTypeMetadataRequestDto,
  ChangeStatus,
  DeleteEnquiryTypeResponseDto,
  FilterDto,
  GetEnquiryTypeDetailsResponseDto,
  GetEnquiryTypeListResponseDto,
  GetEnquiryTypesResponseDto,
  MapEnquiryTypeStagesRequestDto,
  UpdateEnquiryTypeMetadataRequestDto,
  UpdateEnquiryTypeRequestDto,
  UpdateEnquiryTypeResponseDto,
  UpdateEnquiryTypeStatusResponseDto,
  ValidateEnquirySlugRequestDto,
  ValidateEnquirySlugResponseDto,
} from './enquiryType.dto';
import { EnquiryTypeService } from './enquiryType.service';

@ApiTags('Enquiry Type')
@ApiBearerAuth('JWT-auth')
@Controller('enquiry-type')
export class EnquiryTypeController {
  constructor(
    private enquiryTypeService: EnquiryTypeService,
    private loggerService: LoggerService,
    private responseService: ResponseService,
    public readonly configService: ConfigService,
  ) { }

  @Post('metadata')
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Success response',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  async addEnquiryTypeMetadata(
    @Body() reqBody: AddEnquiryTypeMetadataRequestDto,
    @Res() res: Response,
  ) {
    try {
      const result =
        await this.enquiryTypeService.addEnquiryTypeMetadata(reqBody);
      this.responseService.sendResponse(
        res,
        HttpStatus.CREATED,
        result,
        'Enquiry type created',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @Patch('/:enquiryTypeId/metadata')
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Success response',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiParam({ name: 'enquiryTypeId', required: true, type: String })
  async updateEnquiryTypeMetadata(
    @Param('enquiryTypeId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryTypeId: string,
    @Body() reqBody: UpdateEnquiryTypeMetadataRequestDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.enquiryTypeService.updateEnquiryTypeMetadata(
        enquiryTypeId,
        reqBody,
      );
      this.responseService.sendResponse(
        res,
        HttpStatus.CREATED,
        result,
        'Enquiry type created',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }
  @Patch('/:enquiryTypeId/map-stages')
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Success response',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiParam({ name: 'enquiryTypeId', required: true, type: String }) // Specify the request body schema
  async mapEnquiryTypeStages(
    @Param('enquiryTypeId') enquiryTypeId: string,
    @Body() reqBody: MapEnquiryTypeStagesRequestDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.enquiryTypeService.mapEnquiryTypeStages(
        enquiryTypeId,
        reqBody,
      );
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Enquiry type stages mapped',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: GetEnquiryTypeListResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
    type: RequestValidationError,
  })
  @ApiQuery({
    name: 'pageNumber',
    description: 'Current page number',
    required: true,
    type: 'number',
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'Number of data on a single page',
    required: true,
    type: 'number',
  })
  @Post('list')
  async getEnquiryTypeList(
    @Res() res: Response,
    @Query('pageNumber', ParseIntPipe) pageNumber: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
    @Body() filterArray?: FilterDto,
  ) {
    try {
      delete filterArray?.email;
      const enquiryTypeList = await this.enquiryTypeService.getEnquiryTypeList(
        pageNumber,
        pageSize,
        filterArray.filters,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        enquiryTypeList,
        'Enquiry types',
      );
    } catch (err) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: UpdateEnquiryTypeResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
    type: RequestValidationError,
  })
  @Patch('update/:enquiryTypeId')
  async updateEnquiryType(
    @Res() res: Response,
    @Param('enquiryTypeId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryTypeId: string,
    @Body() reqBody: UpdateEnquiryTypeRequestDto,
  ) {
    try {
      const updateResult = await this.enquiryTypeService.update(
        enquiryTypeId,
        reqBody,
      );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        updateResult,
        'Enquiry types',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: DeleteEnquiryTypeResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
    type: RequestValidationError,
  })
  @Delete('delete/:enquiryTypeId')
  async deleteEnquiryType(
    @Res() res: Response,
    @Param('enquiryTypeId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryTypeId: string,
  ) {
    try {
      const deleteResponse =
        await this.enquiryTypeService.deleteEnquiryType(enquiryTypeId);

      if (!deleteResponse) {
        throw new HttpException('Enquiry type not found', HttpStatus.NOT_FOUND);
      }

      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        {},
        'Enquiry type deleted',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: UpdateEnquiryTypeStatusResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
    type: RequestValidationError,
  })
  @Post('changeStatus/:enquiryTypeId/:status')
  async changeEnquiryTypeStatus(
    @Res() res: Response,
    @Param('enquiryTypeId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryTypeId: string,
    @Param('status') status: string,
    @Body() body: ChangeStatus
  ) {
    try {
      delete body.email;
      const updateResult =
        await this.enquiryTypeService.changeEnquiryTypeStatus(
          enquiryTypeId,
          status,
        );

      if (!updateResult) {
        throw new HttpException('Enquiry type not found', HttpStatus.NOT_FOUND);
      }

      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        {},
        'Enquiry type status changed',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: ValidateEnquirySlugResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid slug name validation error response',
    type: RequestValidationError,
  })
  @Post('checkSlugName')
  async validateEnquirySlug(
    @Body() reqBody: ValidateEnquirySlugRequestDto,
    @Res() res: Response,
  ) {
    try {
      delete reqBody?.email
      const result =
        await this.enquiryTypeService.isEnquiryTypeSlugUnique(reqBody);
      this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        {
          isUnique: result,
        },
        result
          ? 'Slug name is unique'
          : 'Slug with the given name already exists',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: GetEnquiryTypesResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Validation error response',
    type: RequestValidationError,
  })
  @Get('active-list')
  async getActiveEnquiryTypes(@Res() res: Response) {
    try {
      this.loggerService.log(`API to get the active enquiry type list called`);
      const enquiryTypeDetails =
        await this.enquiryTypeService.getActiveEnquiryTypeList();
      return this.responseService.sendResponse(
        res,
        enquiryTypeDetails.length ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        enquiryTypeDetails,
        enquiryTypeDetails.length
          ? 'Enquiry types found'
          : 'Enquiry types not found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: GetEnquiryTypesResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Validation error response',
    type: RequestValidationError,
  })
  @Get('dropdown-list')
  async getEnquiryTypes(
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      this.loggerService.log(`API to get the enquiry type details called`);
      const enquiryTypeDetails =
        await this.enquiryTypeService.getEnquiryTypeAndFormData(req.headers.authorization);
      return this.responseService.sendResponse(
        res,
        enquiryTypeDetails.length ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        enquiryTypeDetails,
        enquiryTypeDetails.length
          ? 'Enquiry types found'
          : 'Enquiry types not found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: GetEnquiryTypeDetailsResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid slug name validation error response',
    type: RequestValidationError,
  })
  @Get(':enquiryTypeId')
  async getEnquiryTypeById(
    @Res() res: Response,
    @Param('enquiryTypeId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryTypeId: string,
  ) {
    try {
      this.loggerService.log(
        `Get enquiry type by id API called with enquiry type id - ${enquiryTypeId}`,
      );
      const enquiryTypeDetails =
        await this.enquiryTypeService.getEnquiryTypeDetails(enquiryTypeId);
      return this.responseService.sendResponse(
        res,
        enquiryTypeDetails ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        enquiryTypeDetails ?? {},
        enquiryTypeDetails
          ? 'Enquiry type details found'
          : 'Enquiry details not found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    // type: ChangeEnquiryStatusResponseDto
  })
  @ApiBadRequestResponse({
    status: HttpStatus.OK,
    description: 'Invalid data validation error response',
    type: RequestValidationError,
  })
  @ApiParam({ name: 'enquiryTypeId', required: true, type: String })
  @Get('/:enquiryTypeId/formdata')
  async getSimilarEnquiryFormdata(
    @Req() req: Request,
    @Res() res: Response,
    @Param('enquiryTypeId', new RegexValidationPipe(/^[0-9a-fA-F]{24}$/))
    enquiryTypeId: string,
  ) {
    try {
      this.loggerService.log(
        `Get enquiry type formdata API called with enquiryTypeId: ${enquiryTypeId}`,
      );
      const result =
        await this.enquiryTypeService.getEnquiryTypeByIdAndFormData(
          enquiryTypeId,
          req.headers.authorization
        );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        result,
        'Enquiry type formdata found',
      );
    } catch (err: Error | unknown) {
      throw err;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success response',
    type: GetEnquiryTypeListResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
    type: RequestValidationError,
  })
  @ApiQuery({
    name: 'pageNumber',
    description: 'Current page number',
    required: true,
    type: 'number',
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'Number of data on a single page',
    required: true,
    type: 'number',
  })
  @Get('list/global-search')
  async globalSearchEnquiryTypeList(
    @Res() res: Response,
    @Query('pageNumber', ParseIntPipe) pageNumber: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
    @Query('search') search: string,
  ) {
    try {
      const enquiryTypeList =
        await this.enquiryTypeService.globalSearchEnquiryTypeListing(
          pageNumber,
          pageSize,
          search,
        );
      return this.responseService.sendResponse(
        res,
        HttpStatus.OK,
        enquiryTypeList,
        'Enquiry type list',
      );
    } catch (err) {
      throw err;
    }
  }
}
