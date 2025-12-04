import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class MetadataDto {
    @ApiProperty({ type: String })
    @IsString()
    form_id: string

    @ApiProperty({ type: String })
    @IsString()
    enquiry_type_id: string
}