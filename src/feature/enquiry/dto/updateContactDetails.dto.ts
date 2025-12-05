import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";
import { MetadataDto } from "./metadata.dto";
import { EParentType } from "../enquiry.type";

export class ContactDetailsDto {
    @ApiProperty({ enum: EParentType })
    @IsEnum(EParentType, { message: 'Parent value is incorrect' })
    @IsOptional()
    'contact_details.preference_1.mobile_of_parent': EParentType

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'contact_details.preference_1.mobile': string

    @ApiProperty({ enum: EParentType })
    @IsEnum(EParentType, { message: 'Parent value is incorrect' })
    @IsOptional()
    'contact_details.preference_1.email_of_parent': EParentType

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'contact_details.preference_1.email': string

    @ApiProperty({ enum: EParentType })
    @IsEnum(EParentType, { message: 'Parent value is incorrect' })
    @IsOptional()
    'contact_details.preference_2.mobile_of_parent': EParentType

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'contact_details.preference_2.mobile': string

    @ApiProperty({ enum: EParentType })
    @IsEnum(EParentType, { message: 'Parent value is incorrect' })
    @IsOptional()
    'contact_details.preference_2.email_of_parent': EParentType

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'contact_details.preference_2.email': string

    @ApiProperty({ enum: EParentType })
    @IsEnum(EParentType, { message: 'Parent value is incorrect' })
    @IsOptional()
    'contact_details.preference_3.mobile_of_parent': EParentType

    @ApiProperty({ type: String })
    @IsOptional()
    @IsString()
    'contact_details.preference_3.mobile': string

    @ApiProperty({ enum: EParentType })
    @IsEnum(EParentType, { message: 'Parent value is incorrect' })
    @IsOptional()
    'contact_details.preference_3.email_of_parent': EParentType

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'contact_details.preference_3.email': string

    @ApiProperty({ enum: EParentType })
    @IsEnum(EParentType, { message: 'Parent value is incorrect' })
    @IsOptional()
    'contact_details.emergency_contact.type': EParentType

    @ApiProperty({ type: String })
    @IsString()
    'residential_details.current_address.house': string

    @ApiProperty({ type: String })
    @IsString()
    'residential_details.current_address.street': string

    @ApiProperty({ type: String })
    @IsString()
    'residential_details.current_address.landmark': string

    @ApiProperty({ type: Number })
    @IsNumber()
    'residential_details.current_address.country.id': number

    @ApiProperty({ type: String })
    @IsString()
    'residential_details.current_address.country.value': string

    @ApiProperty({ type: String })
    @IsString()
    'residential_details.current_address.pin_code': string

    @ApiProperty({ type: Number })
    @IsNumber()
    'residential_details.current_address.state.id': number

    @ApiProperty({ type: String })
    @IsString()
    'residential_details.current_address.state.value': string

    @ApiProperty({ type: Number })
    @IsNumber()
    'residential_details.current_address.city.id': number

    @ApiProperty({ type: String })
    @IsString()
    'residential_details.current_address.city.value': string

    @ApiProperty({ type: String })
    @IsString()
    'residential_details.current_address.is_permanent_address': string

    @ApiProperty({ type: String })
    @ValidateIf((o) => ['yes', true].includes(o['residential_details.current_address.is_permanent_address']))
    @IsString()
    @IsOptional()
    'residential_details.permanent_address.house': string

    @ApiProperty({ type: String })
    @ValidateIf((o) => ['yes', true].includes(o['residential_details.current_address.is_permanent_address']))
    @IsString()
    @IsOptional()
    'residential_details.permanent_address.street': string

    @ApiProperty({ type: String })
    @ValidateIf((o) => ['yes', true].includes(o['residential_details.current_address.is_permanent_address']))
    @IsString()
    @IsOptional()
    'residential_details.permanent_address.landmark': string

    @ApiProperty({ type: Number })
    @ValidateIf((o) => ['yes', true].includes(o['residential_details.current_address.is_permanent_address']))
    @IsNumber()
    @IsOptional()
    'residential_details.permanent_address.country.id': number

    @ApiProperty({ type: String })
    @ValidateIf((o) => ['yes', true].includes(o['residential_details.current_address.is_permanent_address']))
    @IsString()
    @IsOptional()
    'residential_details.permanent_address.country.value': string

    @ApiProperty({ type: String })
    @ValidateIf((o) => ['yes', true].includes(o['residential_details.current_address.is_permanent_address']))
    @IsString()
    @IsOptional()
    'residential_details.permanent_address.pin_code': string

    @ApiProperty({ type: Number })
    @ValidateIf((o) => ['yes', true].includes(o['residential_details.current_address.is_permanent_address']))
    @IsNumber()
    @IsOptional()
    'residential_details.permanent_address.state.id': number

    @ApiProperty({ type: String })
    @ValidateIf((o) => ['yes', true].includes(o['residential_details.current_address.is_permanent_address']))
    @IsString()
    @IsOptional()
    'residential_details.permanent_address.state.value': string

    @ApiProperty({ type: Number })
    @ValidateIf((o) => ['yes', true].includes(o['residential_details.current_address.is_permanent_address']))
    @IsNumber()
    @IsOptional()
    'residential_details.permanent_address.city.id': number

    @ApiProperty({ type: String })
    @ValidateIf((o) => ['yes', true].includes(o['residential_details.current_address.is_permanent_address']))
    @IsString()
    @IsOptional()
    'residential_details.permanent_address.city.value': string
}
export class UpdateContactDetailsRequestDto {
    @ApiProperty({ type: MetadataDto })
    @ValidateNested({ each: true })
    @Type(() => MetadataDto)
    metadata: MetadataDto;

    @ApiProperty({ type: ContactDetailsDto })
    @ValidateNested({ each: true })
    @Type(() => ContactDetailsDto)
    data: ContactDetailsDto;
}