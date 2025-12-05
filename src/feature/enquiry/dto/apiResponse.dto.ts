import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsInt, IsMongoId, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

import { EParentType, EPaymentType } from '../enquiry.type';

class MetadataDto {
    @ApiProperty({ type: String })
    @IsString()
    form_id: string

    @ApiProperty({ type: String })
    @IsString()
    enquiry_type_id: string
}

class MasterFieldDto {
    @ApiProperty({ type: Number })
    @IsNumber()
    id: number

    @ApiProperty({ type: String })
    @IsString()
    value: string
}
class DataDto {
    @ApiProperty({ type: MasterFieldDto })
    enquiry_type: MasterFieldDto

    @ApiProperty({ type: String })
    @IsString()
    enquiry_date: string

    @ApiProperty({ type: MasterFieldDto })
    school_location: MasterFieldDto

    @ApiProperty({ enum: EParentType })
    @IsString()
    @IsOptional()
    parent_type: EParentType

    @ApiProperty({ type: MasterFieldDto })
    enquiry_mode: MasterFieldDto

    @ApiProperty({ type: MasterFieldDto })
    enquiry_source_type: MasterFieldDto

    @ApiProperty({ type: MasterFieldDto })
    enquiry_source: MasterFieldDto

    @ApiProperty({ type: MasterFieldDto })
    enquiry_sub_source: MasterFieldDto

    [key: string]: any
}

class UpdateEnquiryDataDto {
    [key: string]: any
}
export class CreateEnquiryRequestDto {
    @ApiProperty({ type: MetadataDto })
    @ValidateNested({ each: true })
    @Type(() => MetadataDto)
    metadata: MetadataDto;

    @ApiProperty({ type: DataDto })
    @ValidateNested({ each: true })
    @Type(() => DataDto)
    data: DataDto;
}
export class UpdateEnquiryRequestDto {
    @ApiProperty({ type: MetadataDto })
    @ValidateNested({ each: true })
    @Type(() => MetadataDto)
    metadata: MetadataDto;

    @ApiProperty({ type: UpdateEnquiryDataDto })
    @Type(() => UpdateEnquiryDataDto)
    data: UpdateEnquiryDataDto;
}
export class SiblingDetailsDto {
    @ApiProperty({ type: String })
    @IsString()
    type: string

    @ApiProperty({ type: String })
    @IsString()
    first_name: string

    @ApiProperty({ type: String })
    @IsString()
    last_name: string

    @ApiProperty({ type: String })
    @IsString()
    dob: string

    @ApiProperty({ type: String })
    @IsString()
    gender: string

    @ApiProperty({ type: String })
    @IsString()
    school: string

    @ApiProperty({ type: MasterFieldDto })
    grade: MasterFieldDto
}
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

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.father_details.occupation': string

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

    @ApiProperty({ type: MasterFieldDto })
    @IsOptional()
    'parent_details.father_details.country': MasterFieldDto

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.father_details.pincode': string

    @ApiProperty({ type: MasterFieldDto })
    @IsOptional()
    'parent_details.father_details.state': MasterFieldDto

    @ApiProperty({ type: MasterFieldDto })
    @IsOptional()
    'parent_details.father_details.city': MasterFieldDto

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

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    'parent_details.mother_details.occupation': string

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

    @ApiProperty({ type: MasterFieldDto })
    @IsOptional()
    'parent_details.mother_details.country': MasterFieldDto

    @ApiProperty({ type: String })
    @IsOptional()
    'parent_details.mother_details.pincode': string

    @ApiProperty({ type: MasterFieldDto })
    @IsOptional()
    'parent_details.mother_details.state': MasterFieldDto

    @ApiProperty({ type: MasterFieldDto })
    @IsOptional()
    'parent_details.mother_details.city': MasterFieldDto

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.mother_details.email': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.mother_details.mobile': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.guardian_details.first_name': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.guardian_details.last_name': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.guardian_details.email': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.guardian_details.mobile': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.guardian_details.relationship_with_child': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.guardian_details.address': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.guardian_details.house': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.guardian_details.street': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.guardian_details.landmark': string

    @ApiProperty({ type: MasterFieldDto })
    'parent_details.guardian_details.country': MasterFieldDto

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.guardian_details.pincode': string

    @ApiProperty({ type: MasterFieldDto })
    'parent_details.guardian_details.state': MasterFieldDto

    @ApiProperty({ type: MasterFieldDto })
    'parent_details.guardian_details.city': MasterFieldDto

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.guardian_details.aadhar': string

    @ApiProperty({ type: String })
    @IsString()
    'parent_details.guardian_details.pan': string

    @ApiProperty({ type: [SiblingDetailsDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @IsOptional()
    @Type(() => SiblingDetailsDto)
    sibling_details: SiblingDetailsDto[]
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
class ContactDetails {
    @ApiProperty({ type: String })
    @IsString()
    preference: string

    @ApiProperty({ type: String })
    @IsString()
    contact_person: string

    @ApiProperty({ type: String })
    @IsString()
    mobile: string

    @ApiProperty({ type: String })
    @IsString()
    email: string

    @ApiProperty({ type: Boolean, default: false })
    @IsBoolean()
    is_emergency_contact: boolean
}
export class FilterItemDto {
    @ApiProperty()
    column: string;

    @ApiProperty()
    operation: string;

    @ApiProperty()
    search: string | string[];
}

export class FilterDto {
    @ApiProperty({ type: [FilterItemDto], required: false, description: 'Array of filters' })
    @IsOptional()
    @IsArray()
    @ArrayMinSize(0)
    @ValidateNested({ each: true })
    @Type(() => FilterItemDto)
    filters?: FilterItemDto[];
}

class ResidentialDetails {
    @ApiProperty({ type: String })
    @IsString()
    'residential_address.address': string

    @ApiProperty({ type: String })
    @IsString()
    'residential_address.house': string

    @ApiProperty({ type: String })
    @IsString()
    'residential_address.street': string

    @ApiProperty({ type: String })
    @IsString()
    'residential_address.landmark': string

    @ApiProperty({ type: MasterFieldDto })
    'residential_address.country': MasterFieldDto

    @ApiProperty({ type: String })
    'residential_address.pin_code': string

    @ApiProperty({ type: MasterFieldDto })
    'residential_address.state': MasterFieldDto

    @ApiProperty({ type: MasterFieldDto })
    'residential_address.city': MasterFieldDto

    @ApiProperty({ type: Boolean })
    'residential_address.is_permanent_address': boolean

    @ApiProperty({ type: [ContactDetails] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ContactDetails)
    contact_details: ContactDetails[]
}
export class UpdateContactDetailsRequestDto {
    @ApiProperty({ type: MetadataDto })
    @ValidateNested({ each: true })
    @Type(() => MetadataDto)
    metadata: MetadataDto;

    @ApiProperty({ type: ResidentialDetails })
    @ValidateNested({ each: true })
    @Type(() => ResidentialDetails)
    data: ResidentialDetails;
}

export class ReassignEnquiryRequestDto {
    @ApiProperty({ type: [String] })
    enquiryIds: string[]

    @ApiProperty({ type: String })
    @IsString()
    assigned_to: string;

    @ApiProperty({ type: Number })
    assigned_to_id: number;
}

export class ReassignRequestDto {
    @ApiProperty({ type: Number })
    @Transform(({ value }) => Number(value))
    school_code: number;

    @ApiProperty({ type: String })
    @IsString()
    hris_code: string;
}

export class TransferEnquiryRequestDto {
    @ApiProperty({ type: [String] })
    enquiryIds: string[]

    @ApiProperty({ type: MasterFieldDto })
    school_location: MasterFieldDto;
}

class MedicalDetails {
    @ApiProperty({ type: Boolean })
    @IsString()
    'medical_details.was_hopitalised': boolean

    @ApiProperty({ type: String })
    @IsString()
    'medical_details.year_of_hospitalisation': string

    @ApiProperty({ type: String })
    @IsString()
    'medical_details.reason_of_hospitalisation': string

    @ApiProperty({ type: Boolean })
    @IsString()
    'medical_details.has_physical_disability': boolean

    @ApiProperty({ type: String })
    @IsString()
    'medical_details.physical_disability_description': string

    @ApiProperty({ type: Boolean })
    @IsString()
    'medical_details.has_medical_history': boolean

    @ApiProperty({ type: String })
    @IsString()
    ' medical_details.medical_history_description': string

    @ApiProperty({ type: Boolean })
    @IsString()
    'medical_details.has_allergy': boolean

    @ApiProperty({ type: String })
    @IsString()
    'medical_details.allergy_description': string

    @ApiProperty({ type: Boolean })
    @IsString()
    'medical_details.has_learning_needs': boolean

    @ApiProperty({ type: String })
    @IsString()
    'medical_details.personalised_learning_needs': string
}
export class UpdateMedicalDetailsDto {
    @ApiProperty({ type: MetadataDto })
    @ValidateNested({ each: true })
    @Type(() => MetadataDto)
    metadata: MetadataDto;

    @ApiProperty({ type: MedicalDetails })
    @ValidateNested({ each: true })
    @Type(() => MedicalDetails)
    data: MedicalDetails;
}
class BankDetails {
    @ApiProperty({ type: String })
    @IsString()
    ifsc: string

    @ApiProperty({ type: String })
    @IsString()
    bank_name: string

    @ApiProperty({ type: String })
    @IsString()
    account_holder_name: string

    @ApiProperty({ type: String })
    @IsString()
    account_type: string

    @ApiProperty({ type: String })
    @IsString()
    account_number: string

    @ApiProperty({ type: String })
    @IsString()
    upi: string
}
export class UpdateBankDetailsDto {
    @ApiProperty({ type: MetadataDto })
    @ValidateNested({ each: true })
    @Type(() => MetadataDto)
    metadata: MetadataDto;

    @ApiProperty({ type: BankDetails })
    @ValidateNested({ each: true })
    @Type(() => BankDetails)
    data: BankDetails;
}

export class GetEnquiryTimelineDto {
    @ApiProperty({ type: String })
    @IsString()
    enquiry_id: string

    @ApiProperty({ type: String })
    @IsString()
    event_type: string

    @ApiProperty({ type: String })
    @IsString()
    event_sub_type: string

    @ApiProperty({ type: String })
    @IsString()
    event: string

    @ApiProperty({ type: String })
    @IsString()
    created_by: string

    @ApiProperty({ type: String })
    @IsString()
    created_by_id: string

    @ApiProperty({ type: Date })
    @IsString()
    created_at: Date
}

class EnquirerDetails {
    @ApiProperty({ type: String })
    @IsString()
    name: string

    @ApiProperty({ type: String })
    @IsString()
    email: string

    @ApiProperty({ type: String })
    @IsString()
    mobile: string
}

class SimilarEnquiry {
    @ApiProperty({ type: String })
    @IsString()
    enquiry_id: string

    @ApiProperty({ type: String })
    @IsString()
    enquiry_date: string

    @ApiProperty({ type: String })
    @IsString()
    school_name: string

    @ApiProperty({ type: String })
    @IsString()
    student_name: string

    @ApiProperty({ type: String })
    @IsString()
    stage_name: string

    @ApiProperty({ type: String })
    @IsString()
    stage_status: string
}

class MergeSimilarEnquiry {
    @ApiProperty({ type: String })
    @IsString()
    enquiry_id: string

    @ApiProperty({ type: String })
    @IsString()
    enquiry_date: string

    @ApiProperty({ type: String })
    @IsString()
    enquiry_number: string

    @ApiProperty({ type: String })
    @IsString()
    enquiry_for: string

    @ApiProperty({ type: String })
    @IsString()
    school_name: string

    @ApiProperty({ type: String })
    @IsString()
    student_name: string

    @ApiProperty({ type: String })
    @IsString()
    stage: string

    @ApiProperty({ type: String })
    @IsString()
    status: string
}
export class GetEnquirerDetailsResponseDto {
    @ApiProperty({ type: EnquirerDetails })
    enquirer_details: EnquirerDetails

    @ApiProperty({ type: SimilarEnquiry })
    similar_enquiries: SimilarEnquiry[]
}


export class EnquiryApiResponseDto<T> {
    @ApiProperty({ type: Number, description: 'API response status' })
    @IsInt()
    status: number;

    @ApiProperty({ description: 'API response data', type: Object })
    @ValidateNested()
    @Type(() => Object)
    data: T;

    @ApiProperty({ description: 'API response message' })
    @IsString()
    message: string;
}

export class GetUploadedDocumentUrlResponseDto {
    @ApiProperty({ description: 'url' })
    @IsString()
    url: string
}

export class GetMergeEnquiryDetailsApiResponse {
    @ApiProperty({ type: EnquirerDetails })
    enquirerDertails: EnquirerDetails

    @ApiProperty({ type: [MergeSimilarEnquiry] })
    similarEnquiries: MergeSimilarEnquiry[]
}

export class GetFinanceEnquiryDetailsResponseDto {

    @ApiProperty({ description: 'Enquiry Id' })
    enquiry_id: string;

    @ApiProperty({ description: 'Name of the student' })
    student_name: string;

    @ApiProperty({ description: 'Enquiry number' })
    enquiry_number: string;

    @ApiProperty({ description: 'Code of the school', type: Number })
    school: number;

    @ApiProperty({ description: 'Stream', type: Number, nullable: true })
    stream: number | null;

    @ApiProperty({ description: 'Brand', type: Number, nullable: true })
    brand: number | null;

    @ApiProperty({ description: 'Board', type: Number, nullable: true })
    board: number | null;

    @ApiProperty({ description: 'Grade of the student', type: Number, nullable: true })
    grade: number | null;

    @ApiProperty({ description: 'Shift', type: Number, nullable: true })
    shift: number | null;
}

export class GetFinanceEnquiryListResponseDto {
    @ApiProperty({ description: 'Enquiry Id' })
    id: string;

    @ApiProperty({ description: 'Enquiry number', nullable: true })
    display_name: string | null;

    @ApiProperty({ description: 'Student first name' })
    enr_no: string;
}

export class UpdatePaymentStatusRequestBodyDto {
    @ApiProperty({ enum: EPaymentType })
    @IsString()
    payment_type: EPaymentType

    @ApiProperty({ description: 'Enquiry Id' })
    @IsMongoId()
    enquiry_id: string;

    @ApiProperty({ description: 'Student enquiry number' })
    @IsString()
    enquiry_number: string;

    @ApiProperty({ description: 'Student enrollment number' })
    @IsString()
    @IsOptional()
    enrollment_number: string;

    @ApiProperty({ description: 'Student GR number' })
    @IsString()
    @IsOptional()
    gr_number: string;

    @ApiProperty({ description: 'Admission fee amount' })
    @IsNumber()
    amount: number;

    @ApiProperty({ description: 'Mode of payment' })
    @IsString()
    @IsOptional()
    mode_of_payment: string;

    @ApiProperty({ description: 'Payment date and time' })
    @IsString()
    @IsOptional()
    payment_date_time: string;
}

export class FinanceEnquiryDetailsSearchRequestDto {
    @ApiProperty({ description: 'Search value' })
    @IsString()
    search: string

    @ApiProperty({ description: 'School Ids' })
    @IsArray()
    @IsNumber({}, { each: true }) // Ensures each element in the array is a number
    school_id: number[];
}

export class UpdateEnquiryStatusRequestDto {
    @ApiProperty({ description: 'Close enquiry status', nullable: true })
    @IsString()
    @IsOptional()
    status: string | null

    @ApiProperty({ description: 'Close enquiry message', nullable: true })
    @IsString()
    @IsOptional()
    message: string | null
}

export class MoveToNextStageRequestDto {
    @ApiProperty({ description: 'Current status of enquiry' })
    @IsString()
    currentStage: string
}

export class AddKitNumberRequestDto {
    @ApiProperty({ description: 'Kit number' })
    @IsString()
    kitNumber: string;
}

export class GetFileRequestDto {
    @ApiProperty({ description: 'File path' })
    @IsString()
    path: string;

    @ApiProperty({ description: 'Flag to get the downloadable file' })
    @IsBoolean()
    isDownloadable: boolean;
}

export class GetFileResponseDto {
    @ApiProperty({ description: 'File path' })
    @IsString()
    url: string;
}
export class CreateEnquiryResponseDto extends EnquiryApiResponseDto<any> { }
export class UpdateEnquiryParentDetailsResponseDto extends EnquiryApiResponseDto<any> { }
export class UpdateContactDetailsResponseDto extends EnquiryApiResponseDto<any> { }
export class UpdateMedicalDetailsResponseDto extends EnquiryApiResponseDto<any> { }
export class UpdateBankDetailsResponseDto extends EnquiryApiResponseDto<any> { }
export class GetEnquiryTimelineResponseDto extends EnquiryApiResponseDto<GetEnquiryTimelineDto[]> { }
export class ChangeEnquiryStatusResponseDto extends EnquiryApiResponseDto<Object> { }