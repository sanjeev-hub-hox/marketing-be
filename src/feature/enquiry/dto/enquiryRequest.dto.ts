import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateIvtEnquiryStatusDto {
  @ApiProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  student_id?: number;

  @ApiProperty({ type: String })
  @IsString()
  enrolment_number: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  gr_number?: string;
}

export class GetEnquiryNumberWithGivenIvtDto {
  @ApiProperty({ type: Number })
  @IsNumber()
  studentId?: number;

  @ApiProperty({ type: String })
  @IsString()
  requestType: string;
}