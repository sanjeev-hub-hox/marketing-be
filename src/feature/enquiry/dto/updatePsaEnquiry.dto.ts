import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";
import { MetadataDto } from "./metadata.dto";
import { EParentType } from "../enquiry.type";

class UpdateEnquiryDataDto {

    //TODO: Enquiry number field
    
    @ApiProperty({ type: String })
    @IsString()
    enquiry_date: string

    @ApiProperty({ type: Number })
    @IsNumber()
    'academic_year.id': number

    @ApiProperty({ type: String })
    @IsString()
    'academic_year.value': string
    
    @ApiProperty({ type: Number })
    @IsNumber()
    'school_location.id': number

    @ApiProperty({ type: String })
    @IsString()
    'school_location.value': string

    @ApiProperty({ enum: EParentType })
    @IsEnum(EParentType, { message: 'Parent value is incorrect'})
    parent_type: EParentType

    @ApiProperty({ type: String })
    @ValidateIf((o) => o.parent_type === EParentType.FATHER)
    @IsString()
    'parent_details.father_details.first_name': String

    @ApiProperty({ type: String })
    @ValidateIf((o) => o.parent_type === EParentType.FATHER)
    @IsString()
    'parent_details.father_details.last_name': String

    @ApiProperty({ type: String })
    @ValidateIf((o) => o.parent_type === EParentType.FATHER)
    @IsString()
    'parent_details.father_details.mobile': String

    @ApiProperty({ type: String })
    @ValidateIf((o) => o.parent_type === EParentType.FATHER)
    @IsString()
    'parent_details.father_details.email': String

    @ApiProperty({ type: String })
    @ValidateIf((o) => o.parent_type === EParentType.MOTHER)
    @IsString()
    'parent_details.mother_details.first_name': String

    @ApiProperty({ type: String })
    @ValidateIf((o) => o.parent_type === EParentType.MOTHER)
    @IsString()
    'parent_details.mother_details.last_name': String

    @ApiProperty({ type: String })
    @ValidateIf((o) => o.parent_type === EParentType.MOTHER)
    @IsString()
    'parent_details.mother_details.mobile': String

    @ApiProperty({ type: String })
    @ValidateIf((o) => o.parent_type === EParentType.MOTHER)
    @IsString()
    'parent_details.mother_details.email': String

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsOptional()
    'existing_school_details.name.id': number

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'existing_school_details.name.value': string

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsOptional()
    'existing_school_details.board.id': number

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'existing_school_details.board.value': string

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsOptional()
    'existing_school_details.grade.id': number

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'existing_school_details.grade.value': string

    @ApiProperty({ type: String })
    @IsString()
    'student_details.first_name': string

    @ApiProperty({ type: String })
    @IsString()
    'student_details.last_name': string

    @ApiProperty({ type: Number })
    @IsNumber()
    'student_details.grade.id': number

    @ApiProperty({ type: String })
    @IsString()
    'student_details.grade.value': string

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'student_details.gender': string

    @ApiProperty({ type: String })
    @IsString()
    'student_details.dob': string

    @ApiProperty({ type: Number })
    @IsNumber()
    'student_details.eligible_grade.id': number

    @ApiProperty({ type: String })
    @IsString()
    'student_details.eligible_grade.value': string

    @ApiProperty({ type: Number })
    @IsNumber()
    'psa_sub_type.id': number

    @ApiProperty({ type: String })
    @IsString()
    'psa_sub_type.value': string

    @ApiProperty({ type: Number })
    @IsNumber()
    'psa_category.id': number

    @ApiProperty({ type: String })
    @IsString()
    'psa_category.value': string

    @ApiProperty({ type: Number })
    @IsNumber()
    'psa_sub_category.id': number

    @ApiProperty({ type: String })
    @IsString()
    'psa_sub_category.value': string
 
    @ApiProperty({ type: Number })
    @IsNumber()
    'psa_period_of_service.id': number

    @ApiProperty({ type: String })
    @IsString()
    'psa_period_of_service.value': string

    @ApiProperty({ type: Number })
    @IsNumber()
    'enquiry_mode.id': number

    @ApiProperty({ type: String })
    @IsString()
    'enquiry_mode.value': string

    @ApiProperty({ type: Number })
    @IsNumber()
    'enquiry_source_type.id': number

    @ApiProperty({ type: String })
    @IsString()
    'enquiry_source_type.value': string

    @ApiProperty({ type: Number })
    @IsNumber()
    'enquiry_source.id': number

    @ApiProperty({ type: String })
    @IsString()
    'enquiry_source.value': string

    @ApiProperty({ type: Number })
    @IsNumber()
    'enquiry_sub_source.id': number

    @ApiProperty({ type: String })
    @IsString()
    'enquiry_sub_source.value': string

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    'another_child_enquiry': boolean

    @ApiProperty({ type: String })
    @ValidateIf((o) => o.another_child_enquiry === true)
    @IsString()
    'another_student_details.first_name': string

    @ApiProperty({ type: String })
    @ValidateIf((o) => o.another_child_enquiry === true)
    @IsString()
    'another_student_details.last_name': string

    @ApiProperty({ type: Number })
    @ValidateIf((o) => o.another_child_enquiry === true)
    @IsNumber()
    'another_student_details.grade.id': number

    @ApiProperty({ type: String })
    @ValidateIf((o) => o.another_child_enquiry === true)
    @IsString()
    'another_student_details.grade.value': string

    @ApiProperty({ type: String })
    @ValidateIf((o) => o.another_child_enquiry === true)
    @IsString()
    'another_student_details.gender': string

    @ApiProperty({ type: String })
    @ValidateIf((o) => o.another_child_enquiry === true)
    @IsString()
    'another_student_details.dob': string

    @ApiProperty({ type: Number })
    @ValidateIf((o) => o.another_child_enquiry === true)
    @IsNumber()
    'another_student_details.eligible_grade.id': number

    @ApiProperty({ type: String })
    @ValidateIf((o) => o.another_child_enquiry === true)
    @IsString()
    'another_student_details.eligible_grade.value': string

    [key: string]: any
}

export class UpdatePsaEnquiryRequestDto {
    @ApiProperty({ type: MetadataDto })
    @ValidateNested({ each: true })
    @Type(() => MetadataDto)
    metadata: MetadataDto;

    @ApiProperty({ type: UpdateEnquiryDataDto })
    @ValidateNested({ each: true })
    @Type(() => UpdateEnquiryDataDto)
    data: UpdateEnquiryDataDto;
}