import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

enum COMPETENCY_TEST_MODE {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
}

export class CreatedByDto {
  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  user_id?: number;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  user_name?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class ScheduleCompetencyTestRequestDto extends CreatedByDto {
  @ApiProperty({ type: String, format: 'date' })
  @IsString({ message: 'Date must be in the format DD-MM-YYYY' })
  date: string;

  @ApiProperty({ type: String })
  @IsString({ message: 'Id of the slot which is selected' })
  slot_id: string;

  @ApiProperty({ enum: COMPETENCY_TEST_MODE })
  @IsEnum(COMPETENCY_TEST_MODE, { message: 'Mode of the test' })
  mode: COMPETENCY_TEST_MODE;
}

export class CancelCompetencyTestRequestDto extends CreatedByDto {
  @ApiProperty({ type: String })
  @IsString({ message: 'reason must be a string' })
  reason: string;

  @ApiProperty({ type: String })
  @IsString({ message: 'comment must be a string' })
  comment: string;

  @ApiProperty({ type: CreatedByDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatedByDto)
  created_by?: CreatedByDto;
}

export class RescheduleCompetencyTestRequestDto extends CreatedByDto {
  @ApiProperty({ type: String, format: 'date' })
  @IsString({ message: 'Date must be in the format DD-MM-YYYY' })
  date: string;

  @ApiProperty({ type: String })
  @IsString({ message: 'Id of the slot which is selected' })
  new_slot_id: string;

  @ApiProperty({ enum: COMPETENCY_TEST_MODE })
  @IsEnum(COMPETENCY_TEST_MODE, {
    message: 'mode must be either ONLINE or OFFLINE',
  })
  mode: COMPETENCY_TEST_MODE;

  @ApiProperty({ type: CreatedByDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatedByDto)
  created_by?: CreatedByDto;
}

export class RescheduleCompetencyResponseDto {
  @ApiProperty({ type: String, format: 'date' })
  @IsDateString(
    {},
    { message: 'competency_test_date must be a valid ISO date string' },
  )
  competency_test_date: string;

  @ApiProperty({ type: String })
  @Matches(/^(1[0-2]|0?[1-9]):([0-5]?[0-9]):([0-5]?[0-9])$/, {
    message: 'competency_test_time must be a valid time string (HH:MM:SS)',
  })
  competency_test_time: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString({ message: 'comment must be a string' })
  comment?: string | null;
}

export class ScheduleCompetencyTestResponseItemDto {
  @ApiProperty({ type: String, format: 'date' })
  @IsDateString(
    {},
    { message: 'competency_test_date must be a valid ISO date string' },
  )
  competency_test_date: string;

  @ApiProperty({ type: String })
  @Matches(/^(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)$/, {
    message: 'competency_test_time must be a valid time string (HH:MM:SS)',
  })
  competency_test_time: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString({ message: 'comment must be a string' })
  comment?: string | null;

  @ApiProperty({ type: Number })
  @IsInt({ message: 'added_by must be an integer' })
  added_by: number;
}

export class ScheduleCompetencyTestResponseDataDto {
  @ApiProperty({ type: [ScheduleCompetencyTestResponseItemDto] })
  @ValidateNested({ each: true })
  @Type(() => ScheduleCompetencyTestResponseItemDto)
  competency_test: ScheduleCompetencyTestResponseItemDto[];
}

export class ScheduleCompetencyTestResponseDto {
  @ApiProperty({ type: ScheduleCompetencyTestResponseDataDto })
  @ValidateNested()
  @Type(() => ScheduleCompetencyTestResponseDataDto)
  data: ScheduleCompetencyTestResponseDataDto;
}
