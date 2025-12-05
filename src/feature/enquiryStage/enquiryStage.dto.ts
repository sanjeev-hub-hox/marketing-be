import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EEnquiryStageStatus, EEnquiryStageSubStageStatus } from './enquiryStage.type';

class EnquiryStageDataDto {
  @ApiProperty({ type: String })
  @IsString()
  _id: string;

  @ApiProperty({ type: String, description: 'Name of this enquiry type' })
  @IsString()
  name: string;

  @ApiProperty({ type: Number, description: 'Order sequence of this enquiry type' })
  @IsInt()
  order: number;

  @ApiProperty({ type: Number, description: 'Number of mapped stages' })
  @IsInt()
  stages_mapped: number;

  @ApiProperty({ type: Boolean, description: 'Active status of this enquiry type' })
  @IsBoolean()
  is_active: boolean;
}

class EnquiryStageContentDto {
  @ApiProperty({ type: Number, description: 'Total count of result' })
  @IsInt()
  totalCount: number;

  @ApiProperty({ type: Boolean, description: 'Is next page available' })
  @IsBoolean()
  isNextPage: boolean;

  @ApiProperty({ type: [EnquiryStageDataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnquiryStageDataDto)
  data: EnquiryStageDataDto[];
}

class EnquiryStagePaginationDto {
  @ApiProperty({ type: Number, description: 'Total result pages' })
  @IsInt()
  totalPages: number;

  @ApiProperty({ type: Number, description: 'Current page size' })
  @IsInt()
  pageSize: number;

  @ApiProperty({ type: Number, description: 'Total count of result' })
  @IsInt()
  totalCount: number;

  @ApiProperty({ type: Number, description: 'Current page number' })
  @IsInt()
  currentPage: number;

  @ApiProperty({ type: Boolean, description: 'Flag that indicates if there is any next page' })
  @IsBoolean()
  isNextPage: boolean;
}

export class EnquiryStageSchema {
  @ApiProperty({ type: [String], description: 'List of columns available for filtering' })
  @IsArray()
  @IsString({ each: true })
  columns: string[];

  @ApiProperty({ type: [String], description: 'List of operators available for filtering' })
  @IsArray()
  @IsString({ each: true })
  operators: string[];

  @ApiProperty({ type: EnquiryStageContentDto })
  @ValidateNested()
  @Type(() => EnquiryStageContentDto)
  content: EnquiryStageContentDto;

  @ApiProperty({ type: EnquiryStagePaginationDto })
  @ValidateNested()
  @Type(() => EnquiryStagePaginationDto)
  pagination: EnquiryStagePaginationDto;
}

class SubStageDto {
  @ApiProperty({ type: String, description: 'The name of the sub lead' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: EEnquiryStageSubStageStatus, description: 'The status of the sub lead' })
  @IsEnum(EEnquiryStageSubStageStatus)
  @IsOptional()
  status?: EEnquiryStageSubStageStatus;
}

export class CreateEnquiryStageRequestDto {
  @ApiProperty({ type: String, description: 'Name of this stage' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: EEnquiryStageStatus, description: 'The status of the lead' })
  @IsEnum(EEnquiryStageStatus)
  @IsOptional()
  is_active?: EEnquiryStageStatus;

  @ApiPropertyOptional({ type: String, description: 'The start date of this stage' })
  @IsString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({ type: String, description: 'The end date of this stage' })
  @IsString()
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional({ type: String, description: 'The end date of this stage' })
  @IsBoolean()
  @IsOptional()
  saved_as_draft?: boolean;
}

export class UpdateEnquiryStageRequestDto {
  @ApiPropertyOptional({ type: String, description: 'The updated name of the lead' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ enum: EEnquiryStageStatus, description: 'The updated status of the lead' })
  @IsEnum(EEnquiryStageStatus)
  @IsOptional()
  is_active?: EEnquiryStageStatus;

  @ApiPropertyOptional({ type: String, description: 'The start date of this stage' })
  @IsString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({ type: String, description: 'The end date of this stage' })
  @IsString()
  @IsOptional()
  end_date?: string;
}

export class ApiResponseDto<T> {
  @ApiProperty({ type: Number, description: 'API response status' })
  @IsInt()
  status: number;

  @ApiProperty({ description: 'API response data' })
  @ValidateNested()
  @Type(() => Object)
  data: T;

  @ApiProperty({ description: 'API response message' })
  @IsString()
  message: string;
}

export class FilterItemDto {
  @ApiProperty()
  column: string;

  @ApiProperty()
  operation: string;

  @ApiProperty()
  search: string | boolean;
}

export class FilterDto {
  @ApiProperty({ type: [FilterItemDto], required: false, description: 'Array of filters' })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => FilterItemDto)
  filters?: FilterItemDto[];

  @IsOptional()
  @IsString()
  email?: string;
}

export class EnquiryStageResponseDto extends ApiResponseDto<EnquiryStageSchema> { }

export class UpdateEnquiryStageResponseDto extends ApiResponseDto<EnquiryStageSchema> { }

export class GetEnquiryStageListResponseDto extends ApiResponseDto<EnquiryStageDataDto[]> { }

export class DeleteEnquiryStageResponseDto extends ApiResponseDto<{}> { }

export class GetEnquiryListForMappingDto extends ApiResponseDto<{ _id: string; name: string }[]> { }

