import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ETaskEntityType } from './myTask.type';

export class CreateMyTaskRequestDto {
  @ApiProperty({ description: 'Id of the entity' })
  enquiry_id: string;

  @ApiProperty({ enum: ETaskEntityType })
  @IsEnum(ETaskEntityType, { message: 'Parent value is incorrect' })
  created_for_stage: ETaskEntityType;

  @ApiProperty({ description: 'Nuber of times this count was created', maximum: 3 })
  task_creation_count: number;

  @ApiProperty({ description: 'Date from which this task is valid from' })
  @IsDate()
  @Type(() => Date)
  valid_from: Date;

  @ApiProperty({ description: 'Date when this task gets expired' })
  @IsDate()
  @Type(() => Date)
  valid_till: Date;

  @ApiProperty({
    type: Number,
    description: 'Id of the user to whom this task is assigned',
  })
  @IsOptional()
  @IsNumber()
  assigned_to_id: number;
}
