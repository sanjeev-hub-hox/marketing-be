import { IsString, IsOptional, IsEnum, ValidateNested, IsArray, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ColumnMapping {
  @ApiProperty({ description: 'Source column name' })
  @IsString()
  source: string;

  @ApiProperty({ description: 'Target column name' })
  @IsString()
  target: string;
}

export class ExcelImportDto {
  @ApiProperty({ description: 'Path to the Excel file' })
  @IsString()
  filePath: string;

  @ApiProperty({ description: 'Slug for the import' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'Unique field for the import', nullable: true })
  @IsOptional()
  @IsString()
  uniqueField?: string | null;

  @ApiProperty({ type: [ColumnMapping], description: 'Column mappings for the import' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnMapping)
  colMap: ColumnMapping[];

  @ApiProperty({ enum: ['bulkAdd', 'bulkUpdate', 'bulkUpsert'], description: 'Action to be performed' })
  @IsEnum(['bulkAdd', 'bulkUpdate', 'bulkUpsert'])
  action: 'bulkAdd' | 'bulkUpdate' | 'bulkUpsert';
}
