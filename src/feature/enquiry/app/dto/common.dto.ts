import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class MasterFieldDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'India', nullable: true })
  @IsString()
  @IsOptional()
  value: string | null;
}

export class ParentDetailsDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsOptional()
  first_name: string | null;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsOptional()
  last_name: string | null;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsString()
  @IsOptional()
  email: string | null;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsOptional()
  mobile: string | null;
}

export class ParentDetailsGroupDto {
  @ApiProperty({ type: ParentDetailsDto })
  @ValidateNested()
  @Type(() => ParentDetailsDto)
  father_details: ParentDetailsDto;

  @ApiProperty({ type: ParentDetailsDto })
  @ValidateNested()
  @Type(() => ParentDetailsDto)
  mother_details: ParentDetailsDto;
}

export class ExistingSchoolDetailsDto {
  @ApiProperty({ example: 'School Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  board: MasterFieldDto;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  grade: MasterFieldDto;

  @ApiProperty({ type: MasterFieldDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MasterFieldDto)
  academic_year: MasterFieldDto;
}

export class DocumentDto {
  @ApiProperty({
    description: 'Unique identifier for the document',
    example: 1,
  })
  @IsInt()
  document_id: number;

  @ApiProperty({
    description: 'Name of the document',
    example: 'Aadhar Card of Father',
  })
  @IsString()
  document_name: string;

  @ApiProperty({
    description: 'File associated with the document',
    example: null,
  })
  @IsOptional()
  @IsString()
  file: string | null;

  @ApiProperty({
    description: 'Indicates if the document is verified',
    example: false,
  })
  @IsBoolean()
  is_verified: boolean;

  @ApiProperty({
    description: 'Indicates if the document is deleted',
    example: false,
  })
  @IsBoolean()
  is_deleted: boolean;
}

export class StudentDetailsDto {
  @ApiProperty({ example: 'Parthav' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ example: 'Tarfe' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  grade: MasterFieldDto;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  gender: MasterFieldDto;

  @ApiProperty({ example: '18-08-1999' })
  @IsString()
  @IsNotEmpty()
  dob: string;

  @ApiProperty({ type: String, nullable: true })
  @IsString()
  @IsOptional()
  aadhar: string;

  @ApiProperty({ type: String, nullable: true })
  @IsString()
  @IsOptional()
  eligible_grade: string | null;

  @ApiProperty({ type: String, nullable: true })
  @IsString()
  @IsOptional()
  place_of_birth: string | null;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  religion: MasterFieldDto;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  caste: MasterFieldDto;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  sub_caste: MasterFieldDto;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  nationality: MasterFieldDto;

  @ApiProperty({ type: MasterFieldDto })
  @ValidateNested()
  @Type(() => MasterFieldDto)
  mother_tongue: MasterFieldDto;
}
