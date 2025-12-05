import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

import { EFollowUpMode } from './followUp.type';

class CloseEnquiryDetailsDto {
  @ApiProperty({ type: String, description: 'Enquiry close status' })
  @IsString()
  status: string;

  @ApiProperty({ type: String, description: 'Reason of closing this enquiry' })
  @IsString()
  reason: string;
}

class ReminderDetailsDto {
  @ApiProperty({
    type: [String],
    enum: EFollowUpMode,
    description: 'Follow up modes',
  })
  @IsArray()
  @IsString({ each: true })
  mode: string[];

  @ApiProperty({ type: String, description: 'Reminder text' })
  @IsString()
  text: string;

  @ApiProperty({ type: String, description: 'Additional details' })
  @IsString()
  @IsOptional()
  additional_details: string;

  @ApiProperty({ type: String, description: 'Follow up date' })
  @IsString()
  date: string;

  @ApiProperty({ type: String })
  @Matches(/^(?:[01]\d|2[0-3]):(?:[0-5]\d)$/, {
    message: 'follow_up_time must be a valid time string (HH:MM)',
  })
  time: string;
}

class CreatedByDto {
  @ApiProperty({ type: String, description: 'Created by user id' })
  @IsNumber()
  user_id: number;

  @ApiProperty({ type: String, description: 'Created by user name' })
  @IsString()
  user_name: string;

  @ApiProperty({ type: String, description: 'Created by email' })
  @IsString()
  email: string;
}
export class FollowUpCreateRequestDto {
  @ApiProperty({
    type: [String],
    enum: EFollowUpMode,
    description: 'Follow up modes',
  })
  @IsArray()
  @IsString({ each: true })
  mode: string[];

  @ApiProperty({ type: String, description: 'Status' })
  @IsString()
  status: string;

  @ApiProperty({ type: String, description: 'Follow up date' })
  @IsString()
  date: string;

  @ApiProperty({ type: String })
  @Matches(/^(?:[01]\d|2[0-3]):(?:[0-5]\d)$/, {
    message: 'follow_up_time must be a valid time string (HH:MM)',
  })
  time: string;

  @ApiProperty({ type: String, description: 'Remarks' })
  @IsString()
  remarks: string;

  @ApiProperty({
    type: CloseEnquiryDetailsDto,
    description: 'Close enquiry details',
  })
  @IsOptional()
  close_enquiry_details: CloseEnquiryDetailsDto;

  @ApiProperty({ type: ReminderDetailsDto, description: 'Reminder details' })
  @IsOptional()
  reminder_details: ReminderDetailsDto;

  @ApiProperty({ type: CreatedByDto, description: 'Created by details' })
  @IsOptional()
  created_by: CreatedByDto;
}
