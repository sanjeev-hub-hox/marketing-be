import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

import { CreatedByDto } from '../../middleware/auth/auth.dto';

export class ScheduleSchoolVisitRequestDto extends CreatedByDto {
  @ApiProperty({ type: String, format: 'date' })
  @IsString({ message: 'Date must be in the format DD-MM-YYYY' })
  date: string;

  @ApiProperty({ type: String })
  @IsString({ message: 'Id of the slot which is selected' })
  slot_id: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString({ message: 'Comments to be left against this action' })
  comment?: string | null;
}

export class CancelSchoolVisitRequestDto extends CreatedByDto {
  @ApiProperty({ type: String })
  @IsString({ message: 'Reason for cancelling the school visit' })
  reason: string;

  @ApiProperty({ type: String })
  @IsString({ message: 'Comments to be left against this action' })
  comment: string;
}

export class CompleteSchoolVisitRequestDto extends CreatedByDto {
  @ApiProperty({ type: [String] })
  @IsString({ each: true, message: 'each activity must be a string' })
  activities: string[];

  @ApiProperty({ type: String })
  @IsString({ message: 'comment must be a string' })
  comment: string;
}

export class RescheduleSchoolVisitRequestDto extends CreatedByDto {
  @ApiProperty({ type: String, format: 'date' })
  @IsString({ message: 'Date must be in the format DD-MM-YYYY' })
  date: string;

  @ApiProperty({ type: String })
  @IsString({ message: 'Id of the slot which is selected' })
  new_slot_id: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString({ message: 'comment must be a string' })
  comment?: string | null;
}

export class SchoolVisitUpdateResponseDto {
  @ApiProperty({ type: String, format: 'date' })
  @IsDateString(
    {},
    { message: 'school_visit_date must be a valid ISO date string' },
  )
  school_visit_date: string;

  @ApiProperty({ type: String })
  @Matches(/^(1[0-2]|0?[1-9]):([0-5]?[0-9]):([0-5]?[0-9])$/, {
    message: 'school_visit_time must be a valid time string (HH:MM:SS)',
  })
  school_visit_time: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString({ message: 'comment must be a string' })
  comment?: string | null;
}

export class SchoolVisitCreateResponseItemDto {
  @ApiProperty({ type: String, format: 'date' })
  @IsDateString(
    {},
    { message: 'school_visit_date must be a valid ISO date string' },
  )
  school_visit_date: string;

  @ApiProperty({ type: String })
  @Matches(/^(1[0-2]|0?[1-9]):([0-5]?[0-9]):([0-5]?[0-9])$/, {
    message: 'school_visit_time must be a valid time string (HH:MM:SS)',
  })
  school_visit_time: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString({ message: 'comment must be a string' })
  comment?: string | null;

  @ApiProperty({ type: Number })
  @IsInt({ message: 'added_by must be an integer' })
  added_by: number;
}

export class SchoolVisitCreateResponseDataDto {
  @ApiProperty({ type: [SchoolVisitCreateResponseItemDto] })
  @ValidateNested({ each: true })
  @Type(() => SchoolVisitCreateResponseItemDto)
  school_visit: SchoolVisitCreateResponseItemDto[];
}

export class SchoolVisitCreateResponseDto {
  @ApiProperty({ type: SchoolVisitCreateResponseDataDto })
  @ValidateNested()
  @Type(() => SchoolVisitCreateResponseDataDto)
  data: SchoolVisitCreateResponseDataDto;
}
