import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsString, IsOptional, IsArray, ValidateNested, IsNumber } from "class-validator"
import { MetadataDto } from "./metadata.dto"


class StudentParentDetails {
    @ApiProperty({ type: String })
    @IsString()
    'parent_details.father_details.first_name': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.father_details.last_name': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.father_details.aadhar': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.father_details.pan': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.father_details.qualification': string

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsOptional()
    'parent_details.father_details.occupation.id': number

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.father_details.occupation.value': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.father_details.organization_name': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.father_details.designation': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.father_details.office_address': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.father_details.area': string

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsOptional()
    'parent_details.father_details.country.id': number

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.father_details.country.value': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.father_details.pincode': string

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsOptional()
    'parent_details.father_details.state.id': number

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.father_details.state.value': string

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsOptional()
    'parent_details.father_details.city.id': number

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.father_details.city.value': string
    
    @ApiProperty({ type: String })
    @IsString()
    'parent_details.father_details.email': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.father_details.mobile': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.mother_details.first_name': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.mother_details.last_name': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.mother_details.aadhar': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.mother_details.pan': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.mother_details.qualification': string

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsOptional()
    'parent_details.mother_details.occupation.id': number

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.mother_details.occupation.value': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.mother_details.organization_name': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.mother_details.designation': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.mother_details.office_address': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.mother_details.area': string

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsOptional()
    'parent_details.mother_details.country.id': number

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.mother_details.country.value': string
    

    @ApiProperty({ type: String })
    @IsOptional()
    'parent_details.mother_details.pincode': string

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsOptional()
    'parent_details.mother_details.state.id': number

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.mother_details.state.value': string

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsOptional()
    'parent_details.mother_details.city.id': number

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.mother_details.city.value': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.mother_details.email': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.mother_details.mobile': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.guardian_details.first_name': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.guardian_details.last_name': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.guardian_details.email': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.guardian_details.mobile': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.guardian_details.relationship_with_child': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.guardian_details.address': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.guardian_details.house': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.guardian_details.street': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.guardian_details.landmark': string

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsOptional()
    'parent_details.guardian_details.country.id': number

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.guardian_details.country.value': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.guardian_details.pincode': string

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsOptional()
    'parent_details.guardian_details.state.id': number

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.guardian_details.state.value': string

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsOptional()
    'parent_details.guardian_details.city.id': number

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.guardian_details.city.value': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.guardian_details.aadhar': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.guardian_details.pan': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.guardian_details.guardian_type': string

    //TODO: sibling details
    [key: string]: any
}

export class UpdateParentDetailsRequestDto {
    @ApiProperty({ type: MetadataDto })
    @ValidateNested({ each: true })
    @Type(() => MetadataDto)
    metadata: MetadataDto;

    @ApiProperty({ type: StudentParentDetails })
    @ValidateNested({ each: true })
    @Type(() => StudentParentDetails)
    data: StudentParentDetails;
}