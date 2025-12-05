import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, ValidateNested } from 'class-validator';

import {
  MasterFieldDto,
  ParentDetailsGroupDto,
  StudentDetailsDto,
} from './common.dto';
import {
  GuestStudentDetailsDto,
  ResidentialAddressDto,
} from './getNewAdmissionEnquiryDetails.dto';

export class EditNewAdmissionEnquiryDetailsRequestDto {
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
}
