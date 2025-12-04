import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsOptional, IsString, ValidateNested } from "class-validator"
import { MetadataDto } from "./metadata.dto"

class BankDetailsDto {
    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    ifsc: string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    bank_name: string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    account_holder_name: string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    account_type: string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    account_number: string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    upi: string
}
export class UpdateBankDetailsDto {
    @ApiProperty({ type: MetadataDto })
    @ValidateNested({ each: true })
    @Type(() => MetadataDto)
    metadata: MetadataDto;

    @ApiProperty({ type: BankDetailsDto })
    @ValidateNested({ each: true })
    @Type(() => BankDetailsDto)
    data: BankDetailsDto;
}
