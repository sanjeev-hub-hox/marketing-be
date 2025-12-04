import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested } from 'class-validator';


class CauseDto {
    @ApiProperty({ type: String, description: 'Field in which the error occured' })
    @IsString()
    field: string

    @ApiProperty({ type: String, description: 'Error message' })
    @IsString()
    message: string
}

export class RequestValidationError {
    @ApiProperty({ type: Number, description: 'Error code' })
    @IsNumber()
    errorCode: number

    @ApiProperty({ type: String, description: 'Error message' })
    @IsString()
    errorMessage: string

    @ApiProperty({ type: CauseDto })
    @ValidateNested({ each: true })
    @Type(() => CauseDto)
    error: CauseDto
}