import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsNumber } from 'class-validator';

export class DashboardDto {
  @Transform(({ value }) => (Array.isArray(value) ? value : [value])) // Wrap single value into array
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  @ApiProperty({ required: true })
  academic_year_ids: number;
}
