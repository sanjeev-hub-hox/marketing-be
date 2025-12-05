import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNumber } from 'class-validator';
import { Types } from 'mongoose';
import { EnquiryDocument } from '../enquiry.schema';
import { EnquiryTypeDocument } from 'src/feature/enquiryType/enquiryType.schema';

export class GetMergeDto {
  @ApiProperty({ required: true })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  user_id: number;
}

export class PostMergeDto {
  @ApiProperty({ required: true })
  @IsArray()
  enquiryIds: string[];

  @ApiProperty({ required: true })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  user_id: number;
}

export interface EnquiryDetails extends EnquiryDocument {
  enquiry_type_details: EnquiryTypeDocument[]; // Array since $lookup returns an array
}
