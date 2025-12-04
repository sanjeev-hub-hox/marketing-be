import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsString, ValidateNested } from 'class-validator';

class DynamicFormDataDto {
  @ApiProperty({ type: String })
  @IsString()
  _id: string;

  @ApiProperty({ type: String, description: 'Name of this enquiry type' })
  @IsString()
  name: string;

  @ApiProperty({
    type: Number,
    description: 'Order sequence of this enquiry type',
  })
  @IsBoolean()
  is_active: boolean;
}

export class ApiResponseDto<T> {
  @ApiProperty({ type: Number, description: 'API response status' })
  @IsInt()
  status: number;

  @ApiProperty({ description: 'API response data' })
  @ValidateNested()
  @Type(() => Object)
  data: T;

  @ApiProperty({ description: 'API response message' })
  @IsString()
  message: string;
}

export class GetEnquiryStageListResponseDto extends ApiResponseDto<
  DynamicFormDataDto[]
> {}
