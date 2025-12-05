import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import {
  EEnquiryTypeMode,
  EEnquiryTypeStageTatUnit,
} from './enquiryType.type';

export class TatDto {
  @ApiProperty({
    enum: EEnquiryTypeStageTatUnit,
    description: 'Turn around time unit',
  })
  @IsEnum(EEnquiryTypeStageTatUnit)
  @IsDefined()
  unit: EEnquiryTypeStageTatUnit;

  @ApiProperty({ description: 'Turn around time value' })
  @IsNumber()
  @IsDefined()
  value: number;
}

export class StageDtoT {
  @ApiProperty({ description: 'Id of the enquiry stage' })
  @IsString()
  @IsDefined()
  stage_id: string;

  @ApiProperty({ description: 'Sequence order of this stage' })
  @IsNumber()
  @IsDefined()
  order: number;

  @ApiProperty({ description: 'Weightage allocated to this stage' })
  @IsNumber()
  @IsDefined()
  weightage: number;

  @ApiProperty({ description: 'Turn around time of this stage' })
  @ValidateNested()
  @Type(() => TatDto)
  @IsDefined()
  tat: TatDto;

  @ApiProperty({
    description: 'Flag that indicates whether this is a mandatory field or not',
  })
  @IsBoolean()
  @IsDefined()
  is_mandatory: boolean;

  @ApiProperty({
    description: 'The id of the workflow mapped against this stage',
  })
  @IsString()
  @IsDefined()
  workflow: string;

  @ApiProperty({
    type: [String],
    required: false,
    description: 'Registration forms associated with the enquiry type',
  })
  @IsArray()
  @ArrayMinSize(0)
  @IsString({ each: true })
  @IsOptional()
  stage_forms?: string[];
}

export class AddEnquiryTypeMetadataRequestDto {
  @ApiProperty({ type: String, description: 'Name of the enquiry type' })
  @IsString()
  @IsDefined()
  name: string;

  @ApiProperty({ type: String, description: 'Slug for the enquiry type' })
  @IsString()
  @IsDefined()
  slug: string;

  @ApiProperty({
    enum: EEnquiryTypeMode,
    description: 'Mode of the enquiry type',
  })
  @IsEnum(EEnquiryTypeMode)
  @IsDefined()
  mode: EEnquiryTypeMode;

  @ApiProperty({ type: Number, description: 'Order of the enquiry type' })
  @IsNumber()
  @IsDefined()
  order: number;

  @ApiProperty({
    type: [String],
    description: 'Enquiry forms associated with the enquiry type',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  enquiry_forms: string[];

  @ApiProperty({
    type: String,
    required: false,
    description: 'Description of the enquiry type',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the enquiry type is active',
  })
  @IsBoolean()
  @IsDefined()
  is_active: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the enquiry type is saved as draft',
  })
  @IsBoolean()
  @IsDefined()
  saved_as_draft: boolean;
}

export class UpdateEnquiryTypeMetadataRequestDto {
  @ApiProperty({ type: String, description: 'Name of the enquiry type' })
  @IsString()
  @IsDefined()
  @IsOptional()
  name?: string;

  @ApiProperty({ type: String, description: 'Slug for the enquiry type' })
  @IsString()
  @IsDefined()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    enum: EEnquiryTypeMode,
    description: 'Mode of the enquiry type',
  })
  @IsEnum(EEnquiryTypeMode)
  @IsDefined()
  @IsOptional()
  mode?: EEnquiryTypeMode;

  @ApiProperty({ type: Number, description: 'Order of the enquiry type' })
  @IsNumber()
  @IsDefined()
  @IsOptional()
  order?: number;

  @ApiProperty({
    type: [String],
    description: 'Enquiry forms associated with the enquiry type',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsOptional()
  @IsString({ each: true })
  enquiry_forms?: string[];

  @ApiProperty({
    type: String,
    required: false,
    description: 'Description of the enquiry type',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the enquiry type is active',
  })
  @IsBoolean()
  @IsDefined()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the enquiry type is saved as draft',
  })
  @IsBoolean()
  @IsDefined()
  @IsOptional()
  saved_as_draft?: boolean;
}

export class MapEnquiryTypeStagesRequestDto {
  @ApiProperty({
    type: [StageDtoT],
    description: 'List of stages',
    required: false,
  })
  @ValidateNested({ each: true })
  @Type(() => StageDtoT)
  @IsOptional()
  stages?: StageDtoT[];

  @ApiProperty({
    type: Boolean,
    description: 'Whether the enquiry type is saved as draft',
  })
  @IsBoolean()
  @IsDefined()
  saved_as_draft: boolean;
}

export class UpdateEnquiryTypeRequestDto {
  @ApiProperty({
    type: String,
    required: false,
    description: 'Updated name of the enquiry type',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Updated slug for the enquiry type',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    enum: EEnquiryTypeMode,
    required: false,
    description: 'Updated mode of the enquiry type',
  })
  @IsEnum(EEnquiryTypeMode)
  @IsOptional()
  mode?: EEnquiryTypeMode;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'Updated order of the enquiry type',
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({
    type: [String],
    required: false,
    description: 'Updated enquiry forms associated with the enquiry type',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsOptional()
  enquiry_forms?: string[];

  @ApiProperty({
    type: String,
    required: false,
    description: 'Updated description of the enquiry type',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: [StageDtoT],
    required: false,
    description: 'Updated stages associated with the enquiry type',
  })
  @ValidateNested({ each: true })
  @Type(() => StageDtoT)
  @IsOptional()
  stages?: StageDtoT[];

  @ApiProperty({
    type: Boolean,
    required: false,
    description: 'Updated status of whether the enquiry type is active',
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class UpdateEnquiryTypeResponseDto {
  @ApiProperty({ description: 'Status code of the operation' })
  @IsDefined()
  status: number;

  @ApiProperty({ description: 'Data of the updated enquiry type' })
  @ValidateNested()
  @IsDefined()
  data: UpdateEnquiryTypeRequestDto;

  @ApiProperty({ description: 'Message of the operation result' })
  @IsDefined()
  @IsString()
  message: string;
}
export class GetEnquiryTypeListResponseDataItemDto {
  @ApiProperty({
    type: String,
    description: 'ID of the enquiry type data item',
  })
  @IsString()
  @IsDefined()
  _id: string;

  @ApiProperty({
    type: String,
    description: 'Name of the enquiry type data item',
  })
  @IsString()
  @IsDefined()
  name: string;

  @ApiProperty({
    type: Number,
    description: 'Order of the enquiry type data item',
  })
  @IsNumber()
  @IsDefined()
  order: number;

  @ApiProperty({
    type: Number,
    description: 'Number of stages mapped for the enquiry type data item',
  })
  @IsNumber()
  @IsDefined()
  stages_mapped: number;

  @ApiProperty({
    type: [StageDtoT],
    description: 'Stages associated with the enquiry type data item',
  })
  @ValidateNested({ each: true })
  @IsDefined()
  @Type(() => StageDtoT)
  stages: StageDtoT[];

  @ApiProperty({
    type: Boolean,
    description: 'Whether the enquiry type data item is active',
  })
  @IsBoolean()
  @IsDefined()
  is_active: boolean;
}

export class GetEnquiryTypeListResponseContentDto {
  @ApiProperty({ type: Number, description: 'Total count of enquiry types' })
  @IsNumber()
  @IsDefined()
  totalCount: number;

  @ApiProperty({
    type: Boolean,
    description: 'Boolean indicating if there is a next page available',
  })
  @IsBoolean()
  @IsDefined()
  isNextPage: boolean;

  @ApiProperty({
    type: [GetEnquiryTypeListResponseDataItemDto],
    description: 'Array of enquiry type data items',
  })
  @IsArray()
  @IsDefined()
  data: GetEnquiryTypeListResponseDataItemDto[];
}

export class PaginationDto {
  @ApiProperty({ type: Number, description: 'Total number of pages' })
  @IsNumber()
  @IsDefined()
  totalPages: number;

  @ApiProperty({ type: Number, description: 'Page size' })
  @IsNumber()
  @IsDefined()
  pageSize: number;

  @ApiProperty({
    type: Number,
    description: 'Total count of items across all pages',
  })
  @IsNumber()
  @IsDefined()
  totalCount: number;

  @ApiProperty({ type: Number, description: 'Current page number' })
  @IsNumber()
  @IsDefined()
  currentPage: number;

  @ApiProperty({
    type: Boolean,
    description: 'Boolean indicating if there is a next page available',
  })
  @IsBoolean()
  @IsDefined()
  isNextPage: boolean;
}

export class GetEnquiryTypeListResponseDto {
  @ApiProperty({ type: [String], description: 'Array of column names' })
  @IsArray()
  @IsDefined()
  columns: string[];

  @ApiProperty({ type: [String], description: 'Array of operator names' })
  @IsArray()
  @IsDefined()
  operators: string[];

  @ApiProperty({
    type: GetEnquiryTypeListResponseContentDto,
    description: 'Content object for enquiry type list response',
  })
  @ValidateNested()
  @IsDefined()
  content: GetEnquiryTypeListResponseContentDto;

  @ApiProperty({
    type: PaginationDto,
    description: 'Pagination information for enquiry type list response',
  })
  @ValidateNested()
  @IsDefined()
  pagination: PaginationDto;
}

export class DeleteEnquiryTypeResponseDto {
  @ApiProperty({
    type: Number,
    description: 'Status code for the delete enquiry type operation',
  })
  @IsDefined()
  status: number;

  @ApiProperty({
    type: String,
    description:
      'Message indicating the result of the delete enquiry type operation',
  })
  @IsString()
  message: string;
}

export class UpdateEnquiryTypeStatusResponseDto {
  @ApiProperty({
    type: Number,
    description: 'Status code for the update enquiry type status operation',
  })
  @IsDefined()
  status: number;

  @ApiProperty({ description: 'Data for the updated enquiry type status' })
  @IsDefined()
  data: any; // Adjust this type according to your actual response data structure

  @ApiProperty({
    type: String,
    description:
      'Message indicating the result of the update enquiry type status operation',
  })
  @IsDefined()
  message: string;
}

export class ValidateEnquirySlugRequestDto {
  @ApiProperty({ type: String, description: 'Slug to be validated' })
  @IsString()
  @IsDefined()
  slug: string;

  @IsOptional()
  @IsString()
  email?: string
}

export class ValidateEnquirySlugResponseDto {
  @ApiProperty({
    type: Boolean,
    description: 'Boolean indicating whether the enquiry slug is unique',
  })
  @IsDefined()
  isUnique: boolean;
}

export class GetEnquiryTypeDetailsResponseDataDto {
  @ApiProperty({ type: String, description: 'Name of the enquiry type' })
  @IsString()
  @IsDefined()
  name: string;

  @ApiProperty({ type: String, description: 'Slug for the enquiry type' })
  @IsString()
  @IsDefined()
  slug: string;

  @ApiProperty({
    enum: EEnquiryTypeMode,
    description: 'Mode of the enquiry type',
  })
  @IsEnum(EEnquiryTypeMode)
  @IsDefined()
  mode: EEnquiryTypeMode;

  @ApiProperty({ type: Number, description: 'Order of the enquiry type' })
  @IsNumber()
  @IsDefined()
  order: number;

  @ApiProperty({
    type: [String],
    description: 'Enquiry forms associated with the enquiry type',
  })
  @IsArray()
  @IsDefined()
  @IsString({ each: true })
  enquiry_forms: string[];

  @ApiProperty({
    type: String,
    required: false,
    description: 'Description of the enquiry type',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: [StageDtoT],
    required: false,
    description: 'Stages associated with the enquiry type',
  })
  @ValidateNested({ each: true })
  @Type(() => StageDtoT)
  @IsOptional()
  stages?: StageDtoT[];

  @ApiProperty({
    type: Boolean,
    description: 'Whether the enquiry type is active',
  })
  @IsBoolean()
  @IsDefined()
  is_active: boolean;
}

export class GetEnquiryTypeDetailsResponseDto {
  @ApiProperty({
    type: GetEnquiryTypeDetailsResponseDataDto,
    description: 'Data for the requested enquiry type',
  })
  @ValidateNested()
  @IsDefined()
  data: GetEnquiryTypeDetailsResponseDataDto;

  @ApiProperty({
    type: Number,
    description: 'Status code for the get enquiry type details operation',
  })
  @IsDefined()
  status: number;

  @ApiProperty({
    type: String,
    description:
      'Message indicating the result of the get enquiry type details operation',
  })
  @IsDefined()
  message: string;
}

class FormDto {
  @ApiProperty({ type: String, description: 'id of form' })
  @IsString()
  _id: string;

  @ApiProperty({ type: String, description: 'form slug' })
  @IsString()
  slug: string;
}

class EnquirySubStageDto {
  @ApiProperty({ type: String, description: 'id of enquiry stage' })
  @IsString()
  name: string;
}
class EnquiryStageDto {
  @ApiProperty({ type: String, description: 'id of enquiry stage' })
  @IsString()
  _id: string;

  @ApiProperty({ type: String, description: 'Name of enquiry stage' })
  @IsString()
  name: string;

  @ApiProperty({
    type: [EnquirySubStageDto],
    description: "Enquiry stage's sub stage",
  })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => EnquirySubStageDto)
  sub_stages: EnquirySubStageDto[];
}
export class GetEnquiryTypesResponseDto {
  @ApiProperty({ type: String, description: 'id of enquiry type' })
  @IsString()
  _id: string;

  @ApiProperty({ type: String, description: 'name of enquiry type' })
  @IsString()
  name: string;

  @ApiProperty({ type: String, description: 'id of enquiry type' })
  @IsString()
  slug: string;

  @ApiProperty({
    type: Number,
    description: 'Order number of this enquiry type',
  })
  @IsNumber()
  order: number;

  @ApiProperty({ type: [FormDto], description: 'Form data' })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => FormDto)
  enquiry_forms: FormDto[];

  @ApiProperty({
    type: [EnquiryStageDto],
    description: 'Stages associated with the enquiry type data item',
  })
  @ValidateNested({ each: true })
  @IsDefined()
  @Type(() => EnquiryStageDto)
  stages: EnquiryStageDto[];
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
  @ApiProperty({
    type: [FilterItemDto],
    required: false,
    description: 'Array of filters',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => FilterItemDto)
  filters?: FilterItemDto[];

  @IsOptional()
  @IsString()
  email?: string
}

export class ChangeStatus {
  @IsOptional()
  @IsString()
  email?: string
}
