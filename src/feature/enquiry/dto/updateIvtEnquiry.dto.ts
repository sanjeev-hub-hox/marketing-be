import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { EParentType } from '../enquiry.type';
import { MetadataDto } from './metadata.dto';

class UpdateEnquiryDataDto {
  //TODO: Enquiry number field
  @ApiProperty({ type: String })
  @IsString()
  enquiry_date: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  'academic_year.id': number;

  @ApiProperty({ type: String })
  @IsString()
  'academic_year.value': string;

  @ApiProperty({ type: Number })
  @IsNumber()
  'school_location.id': number;

  @ApiProperty({ type: String })
  @IsString()
  'school_location.value': string;

  @ApiProperty({ enum: EParentType })
  @IsEnum(EParentType, { message: 'Parent value is incorrect' })
  @IsOptional()
  parent_type: EParentType;

  @ApiProperty({ type: String })
  @ValidateIf((o) => o.parent_type === EParentType.FATHER)
  @IsString()
  'parent_details.father_details.first_name': string;

  @ApiProperty({ type: String })
  @ValidateIf((o) => o.parent_type === EParentType.FATHER)
  @IsString()
  'parent_details.father_details.last_name': string;

  @ApiProperty({ type: String })
  @ValidateIf((o) => o.parent_type === EParentType.FATHER)
  @IsString()
  'parent_details.father_details.mobile': string;

  @ApiProperty({ type: String })
  @ValidateIf((o) => o.parent_type === EParentType.FATHER)
  @IsString()
  'parent_details.father_details.email': string;

  @ApiProperty({ type: String })
  @ValidateIf((o) => o.parent_type === EParentType.MOTHER)
  @IsString()
  'parent_details.mother_details.first_name': string;

  @ApiProperty({ type: String })
  @ValidateIf((o) => o.parent_type === EParentType.MOTHER)
  @IsString()
  'parent_details.mother_details.last_name': string;

  @ApiProperty({ type: String })
  @ValidateIf((o) => o.parent_type === EParentType.MOTHER)
  @IsString()
  'parent_details.mother_details.mobile': string;

  @ApiProperty({ type: String })
  @ValidateIf((o) => o.parent_type === EParentType.MOTHER)
  @IsString()
  'parent_details.mother_details.email': string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  'existing_school_details.name.id': number;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'existing_school_details.name.value': string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  'existing_school_details.board.id': number;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'existing_school_details.board.value': string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  'existing_school_details.grade.id': number;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'existing_school_details.grade.value': string;

  @ApiProperty({ type: String })
  @IsString()
  'student_details.first_name': string;

  @ApiProperty({ type: String })
  @IsString()
  'student_details.last_name': string;

  @ApiProperty({ type: String })
  @IsString()
  'student_details.grade': string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'student_details.gender': string;

  @ApiProperty({ type: String })
  @IsString()
  'student_details.dob': string;

  @ApiProperty({ type: Number })
  @IsNumber()
  'student_details.eligible_grade.id': number;

  @ApiProperty({ type: String })
  @IsString()
  'student_details.eligible_grade.value': string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  'board.id': number;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'board.value': string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  'course.id': number;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'course.value': string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  'stream.id': number;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'stream.value': string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  'shift.id': number;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'shift.value': string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  'enquiry_mode.id': number;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'enquiry_mode.value': string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  'enquiry_source_type.id': number;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'enquiry_source_type.value': string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  'enquiry_source.id': number;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'enquiry_source.value': string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  'enquiry_sub_source.id': number;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'enquiry_sub_source.value': string;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @IsOptional()
  'another_child_enquiry': boolean;

  @ApiProperty({ type: String })
  @ValidateIf((o) => o.another_child_enquiry === true)
  @IsString()
  'another_student_details.first_name': string;

  @ApiProperty({ type: String })
  @ValidateIf((o) => o.another_child_enquiry === true)
  @IsString()
  'another_student_details.last_name': string;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.another_child_enquiry === true)
  @IsNumber()
  'another_student_details.grade.id': number;

  @ApiProperty({ type: String })
  @ValidateIf((o) => o.another_child_enquiry === true)
  @IsString()
  'another_student_details.grade.value': string;

  @ApiProperty({ type: String })
  @ValidateIf((o) => o.another_child_enquiry === true)
  @IsString()
  'another_student_details.gender': string;

  @ApiProperty({ type: String })
  @ValidateIf((o) => o.another_child_enquiry === true)
  @IsString()
  'another_student_details.dob': string;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.another_child_enquiry === true)
  @IsNumber()
  'another_student_details.eligible_grade.id': number;

  @ApiProperty({ type: String })
  @ValidateIf((o) => o.another_child_enquiry === true)
  @IsString()
  'another_student_details.eligible_grade.value': string;

  [key: string]: any;
}

export class UpdateIvtEnquiryRequestDto {
  @ApiProperty({ type: MetadataDto })
  @ValidateNested({ each: true })
  @Type(() => MetadataDto)
  metadata: MetadataDto;

  @ApiProperty({ type: UpdateEnquiryDataDto })
  @ValidateNested({ each: true })
  @Type(() => UpdateEnquiryDataDto)
  data: UpdateEnquiryDataDto;
}
