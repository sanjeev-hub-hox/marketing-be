import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateAdmissionDto {
  @ApiProperty({ required: true })
  @IsString()
  workflow_id: string;

  @ApiProperty({ required: true })
  @IsIn([1, 2, 3], { message: 'The value must be either 1, 2, or 3' })
  status: number;

  @ApiProperty({ required: true })
  @IsString()
  comment: string;

  @ApiProperty({ required: false })
  workflow_details: any;
}

class DropdownValue {
  @ApiProperty()
  id: any;

  @ApiProperty()
  @IsString()
  value: string;
}
export class CheckFeePayload {
  @ApiProperty()
  @IsString()
  enquiry_number: string;

  @ApiProperty({ type: DropdownValue })
  @ValidateNested()
  @Type(() => DropdownValue)
  school: DropdownValue;

  @ApiProperty({ type: DropdownValue })
  @ValidateNested()
  @Type(() => DropdownValue)
  brand: DropdownValue;

  @ApiProperty({ type: DropdownValue })
  @ValidateNested()
  @Type(() => DropdownValue)
  board: DropdownValue;

  @ApiProperty({ type: DropdownValue })
  @ValidateNested()
  @Type(() => DropdownValue)
  grade: DropdownValue;

  @ApiProperty({ type: DropdownValue })
  @ValidateNested()
  @Type(() => DropdownValue)
  course: DropdownValue;

  @ApiProperty({ type: DropdownValue })
  @ValidateNested()
  @Type(() => DropdownValue)
  shift: DropdownValue;

  @ApiProperty({ type: DropdownValue })
  @ValidateNested()
  @Type(() => DropdownValue)
  academicYearId: DropdownValue;

  @ApiProperty({ type: DropdownValue })
  @ValidateNested()
  @Type(() => DropdownValue)
  stream: DropdownValue;

}

export class UpdateAcStudentGuardianDto {
  @ApiProperty()
  @IsNumber()
  studentId: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  guardianId?: number;

  @ApiProperty()
  @IsNumber()
  relationshipId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  ParentfirstName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  ParentMiddleName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  ParentLastName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  ParentMobile?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  ParentEmail?: string;
}

export class UpdateAcStudentGuardianArrayDto {
  @ApiProperty({ type: [UpdateAcStudentGuardianDto] })
  @ValidateNested({ each: true })
  @Type(() => UpdateAcStudentGuardianDto)
  guardians: UpdateAcStudentGuardianDto[];
}
export class CorrectSiblingDto {
  @ApiProperty()
  @IsString()
  enrolmentNumber: String;

  @ApiProperty()
  @IsString()
  dob: String;

  @ApiProperty()
  @IsNumber()
  studentId: number;
}

export class MapSiblingsDto {
  @ApiProperty({ type: [CorrectSiblingDto] })
  @Type(() => CorrectSiblingDto)
  siblings: CorrectSiblingDto[];
}

export class GetValidParent {
  @ApiProperty()
  @IsString()
  enrolmentNumber: number;

  @ApiProperty()
  @IsString()
  dob: number;
}