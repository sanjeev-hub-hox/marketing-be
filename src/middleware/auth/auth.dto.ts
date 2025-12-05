import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreatedByDetailsDto {
  @IsNumber()
  user_id: number;

  @IsString()
  user_name: string;

  @IsString()
  email: string;
}

export class CreatedByDto {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatedByDetailsDto)
  created_by: CreatedByDetailsDto;
}
