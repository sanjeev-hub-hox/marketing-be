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

class GetPsaEnquiryDetailsResponse {
  @ApiProperty({ example: '06-08-2024' })
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
  psa_sub_type: MasterFieldDto;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  psa_category: MasterFieldDto;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  psa_sub_category: MasterFieldDto;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  psa_period_of_service: MasterFieldDto;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  psa_batch: MasterFieldDto;

  @ApiProperty({ type: DocumentDto })
  @ValidateNested()
  @Type(() => DocumentDto)
  documents: [DocumentDto];
}

export class GetPsaEnquiryDetailsResponseDto {
  @ApiProperty({ example: 200 })
  @IsNumber()
  status: number;

  @ApiProperty({ type: GetPsaEnquiryDetailsResponse })
  @ValidateNested()
  @Type(() => GetPsaEnquiryDetailsResponse)
  data: GetPsaEnquiryDetailsResponse;

  @ApiProperty({ example: 'Enquiry details' })
  @IsString()
  message: string;
}
