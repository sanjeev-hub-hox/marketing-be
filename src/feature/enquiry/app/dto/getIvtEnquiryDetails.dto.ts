import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested } from 'class-validator';

import {
  DocumentDto,
  ExistingSchoolDetailsDto,
  MasterFieldDto,
  ParentDetailsGroupDto,
  StudentDetailsDto,
} from './common.dto';

class GetIvtEnquiryDetailsResponseDataDto {
  @ApiProperty({ example: '18-07-2024' })
  @IsString()
  enquiry_date: string;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  academic_year: MasterFieldDto;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  school_location: MasterFieldDto;

  @ApiProperty({ type: ParentDetailsGroupDto })
  @ValidateNested()
  @Type(() => ParentDetailsGroupDto)
  parent_details: ParentDetailsGroupDto;

  @ApiProperty({ type: ExistingSchoolDetailsDto })
  @ValidateNested()
  @Type(() => ExistingSchoolDetailsDto)
  existing_school_details: ExistingSchoolDetailsDto;

  @ApiProperty({ type: StudentDetailsDto })
  @ValidateNested()
  @Type(() => StudentDetailsDto)
  student_details: StudentDetailsDto;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  board: MasterFieldDto;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  course: MasterFieldDto;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  stream: MasterFieldDto;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  shift: MasterFieldDto;

  @ApiProperty({ type: DocumentDto })
  @ValidateNested()
  @Type(() => DocumentDto)
  documents: [DocumentDto];
}

export class GetIvtEnquiryDetailsResponseDto {
  @ApiProperty({ example: 200 })
  @IsNumber()
  status: number;

  @ApiProperty({ type: GetIvtEnquiryDetailsResponseDataDto })
  @ValidateNested()
  @Type(() => GetIvtEnquiryDetailsResponseDataDto)
  data: GetIvtEnquiryDetailsResponseDataDto;

  @ApiProperty({ example: 'Enquiry details' })
  @IsString()
  message: string;
}
