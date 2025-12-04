import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import {
  DocumentDto,
  MasterFieldDto,
  ParentDetailsGroupDto,
  StudentDetailsDto,
} from './common.dto';

export class GuestStudentDetailsDto {
  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  location: MasterFieldDto;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  board: MasterFieldDto;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  course: MasterFieldDto;
}

export class ResidentialAddressDto {
  @ApiProperty({ example: '1234 Elm St', nullable: true })
  @IsString()
  @IsOptional()
  house: string | null;

  @ApiProperty({ example: 'Main Street', nullable: true })
  @IsString()
  @IsOptional()
  street: string | null;

  @ApiProperty({ example: 'Near Park', nullable: true })
  @IsString()
  @IsOptional()
  landmark: string | null;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  country: MasterFieldDto;

  @ApiProperty({ example: '123456', nullable: true })
  @IsString()
  @IsOptional()
  pin_code: string | null;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  state: MasterFieldDto;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  city: MasterFieldDto;

  @ApiProperty({ example: false })
  @IsBoolean()
  is_permanent_address: boolean;
}

class GetNewAdmissionEnquiryDetailsDataDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  enquiry_date: string;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  academic_year: MasterFieldDto;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  school_location: MasterFieldDto;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  is_guest_student: boolean;

  @ApiProperty({ type: GuestStudentDetailsDto })
  @ValidateNested()
  @Type(() => GuestStudentDetailsDto)
  guest_student_details: GuestStudentDetailsDto;

  @ApiProperty({ type: ParentDetailsGroupDto })
  @ValidateNested()
  @Type(() => ParentDetailsGroupDto)
  parent_details: ParentDetailsGroupDto;

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

  @ApiProperty({ type: ResidentialAddressDto })
  @ValidateNested()
  @Type(() => ResidentialAddressDto)
  residential_address: ResidentialAddressDto;

  @ApiProperty({ type: DocumentDto })
  @ValidateNested()
  @Type(() => DocumentDto)
  documents: [DocumentDto];
}

export class GetNewAdmissionEnquiryDetailsResponseDto {
  @ApiProperty({ example: 200 })
  @IsNumber()
  status: number;

  @ApiProperty({ type: GetNewAdmissionEnquiryDetailsDataDto })
  @ValidateNested()
  @Type(() => GetNewAdmissionEnquiryDetailsDataDto)
  data: GetNewAdmissionEnquiryDetailsDataDto;

  @ApiProperty({ example: 'Enquiry details' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
