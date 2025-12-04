import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsString, ValidateIf, ValidateNested } from "class-validator"
import { MetadataDto } from "./metadata.dto"

class MedicalDetailsDto {
    @ApiProperty({ type: Boolean })
    @IsString()
    'medical_details.was_hopitalised': boolean

    @ApiProperty({ type: String })
    @ValidateIf((o) => o['medical_details.was_hopitalised'] === true)
    @IsString()
    'medical_details.year_of_hospitalisation': string

    @ApiProperty({ type: String })
    @ValidateIf((o) => o['medical_details.was_hopitalised'] === true)
    @IsString()
    'medical_details.reason_of_hospitalisation': string

    @ApiProperty({ type: Boolean })
    @IsString()
    'medical_details.has_physical_disability': boolean

    @ApiProperty({ type: String })
    @ValidateIf((o) => o['medical_details.has_physical_disability'] === true)
    @IsString()
    'medical_details.physical_disability_description': string

    @ApiProperty({ type: Boolean })
    @IsString()
    'medical_details.has_medical_history': boolean

    @ApiProperty({ type: String })
    @ValidateIf((o) => o['medical_details.has_medical_history'] === true)
    @IsString()
    'medical_details.medical_history_description': string

    @ApiProperty({ type: Boolean })
    @IsString()
    'medical_details.has_allergy': boolean

    @ApiProperty({ type: String })
    @ValidateIf((o) => o['medical_details.has_allergy'] === true)
    @IsString()
    'medical_details.allergy_description': string

    @ApiProperty({ type: Boolean })
    @IsString()
    'medical_details.has_learning_needs': boolean

    @ApiProperty({ type: String })
    @ValidateIf((o) => o['medical_details.has_learning_needs'] === true)
    @IsString()
    'medical_details.personalised_learning_needs': string
}
export class UpdateMedicalDetailsDto {
    @ApiProperty({ type: MetadataDto })
    @ValidateNested({ each: true })
    @Type(() => MetadataDto)
    metadata: MetadataDto;

    @ApiProperty({ type: MedicalDetailsDto })
    @ValidateNested({ each: true })
    @Type(() => MedicalDetailsDto)
    data: MedicalDetailsDto;
}