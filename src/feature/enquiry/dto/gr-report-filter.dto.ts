import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';

export class GrReportFilterDto {
  @IsOptional()
  @IsNumber()
  academic_year?: number;

  @IsOptional()
  @IsNumber()
  board?: number;

  @IsOptional()
  @IsNumber()
  course?: number;

  @IsOptional()
  @IsArray()
  grade?: number[];  // ← Changed from string[] to number[]

  @IsOptional()
  @IsNumber()
  stream?: number;

  @IsOptional()
  @IsNumber()
  batch?: number;

  @IsOptional()
  @IsNumber()
  school?: number;
}