import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import {
  ExistingSchoolDetailsDto,
  MasterFieldDto,
  ParentDetailsGroupDto,
  StudentDetailsDto,
} from './common.dto';

export class EditIvtEnquiryDetailsRequestDataDto {
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
}
