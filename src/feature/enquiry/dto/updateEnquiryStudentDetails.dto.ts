import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { MetadataDto } from './metadata.dto';

export class EnquiryStudentDetailsDto {
  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  enquiry_number: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  enquiry_date: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  enquiry_type: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  'school_location.id': number;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'school_location.value': string;

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

  @ApiProperty({ type: String })
  @IsString()
  'student_details.first_name': string;

  @ApiProperty({ type: String })
  @IsString()
  'student_details.last_name': string;

  @ApiProperty({ type: Number })
  @IsNumber()
  'student_details.grade.id': number;

  @ApiProperty({ type: String })
  @IsString()
  'student_details.grade.value': string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  'student_details.gender.id': number;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'student_details.gender.value': string;

  @ApiProperty({ type: String })
  @IsString()
  'student_details.dob': string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  'student_details.eligible_grade.id': number;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'student_details.eligible_grade.value': string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'student_details.aadhar': string;

  @ApiProperty({ type: String })
  @IsString()
  'parent_details.father_details.first_name': string;

  @ApiProperty({ type: String })
  @IsString()
  'parent_details.father_details.last_name': string;

  @ApiProperty({ type: String })
  @IsString()
  'parent_details.father_details.mobile': string;

  @ApiProperty({ type: String })
  @IsString()
  'parent_details.father_details.email': string;

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
  'student_details.place_of_birth': string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'student_details.religion': string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'student_details.caste': string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'student_details.sub_caste': string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  'student_details.nationality': string;

  @ApiProperty({ type: String })
  @IsString()
  'student_details.mother_tongue': string;
}

export class UpdateEnquiryStudentDetailsRequestDto {
  @ApiProperty({ type: MetadataDto })
  @ValidateNested({ each: true })
  @Type(() => MetadataDto)
  metadata: MetadataDto;

  @ApiProperty({ type: EnquiryStudentDetailsDto })
  @ValidateNested({ each: true })
  @Type(() => EnquiryStudentDetailsDto)
  data: EnquiryStudentDetailsDto;
}
