import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { StudentDetailsDto } from 'src/feature/enquiry/app/dto';
import { SiblingDetailsDto } from 'src/feature/enquiry/dto/apiResponse.dto';

export class StudentsDetailDto extends PartialType(StudentDetailsDto) {
  @ApiProperty({ required: false })
  @IsString()
  enquiry_id?: string;

  @ApiProperty({ required: false })
  @IsString()
  enquiry_number?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  grade_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  gender_id?: number;

  @ApiProperty({ required: true })
  @IsOptional()
  @Type(() => MedicalDetailsDto)
  medical_info?: MedicalDetailsDto;

  @IsOptional()
  @IsString()
  birth_place?: string;

  @IsOptional()
  @IsNumber()
  natinality_id?: number;

  @IsOptional()
  @IsNumber()
  religion_id?: number;

  @IsOptional()
  @IsNumber()
  caste_id?: number;

  @IsOptional()
  @IsNumber()
  sub_caste_id?: number;

  @IsOptional()
  @IsNumber()
  mother_tongue_id?: number;

  @IsOptional()
  @IsNumber()
  emergency_contact_no?: number;

  @IsOptional()
  @IsNumber()
  is_parents_seperated?: number;

  @IsOptional()
  @IsString()
  profile_image?: number;

  @IsOptional()
  @IsNumber()
  crt_board_id?: number;

  @IsOptional()
  @IsNumber()
  crt_grade_id?: number;

  @IsOptional()
  @IsNumber()
  crt_div_id?: number;

  @IsOptional()
  @IsNumber()
  crt_shift_id?: number;

  @IsOptional()
  @IsNumber()
  crt_school_id?: number;

  @IsOptional()
  @IsNumber()
  crt_house_id?: number;

  @IsOptional()
  @IsNumber()
  crt_brand_id?: number;

  @IsOptional()
  @IsNumber()
  crt_course_id?: number;

  @IsOptional()
  @IsNumber()
  crt_stream_id?: number;

  @IsOptional()
  @IsNumber()
  school_parent_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  crt_lob_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  academic_year_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  host_school_id?: number;
}

export class MedicalDetailsDto {
  @IsBoolean()
  @IsOptional()
  has_physical_disability?: boolean;

  @IsBoolean()
  @IsOptional()
  has_allergy?: boolean;

  @IsBoolean()
  @IsOptional()
  past_hospitalization?: boolean;

  @IsString()
  @IsOptional()
  reason_for_hospitalization?: string;

  @IsBoolean()
  @IsOptional()
  is_phsically_disabled?: boolean;

  @IsString()
  @IsOptional()
  disablility_details?: string;

  @IsBoolean()
  @IsOptional()
  has_medical_history?: boolean;

  @IsString()
  @IsOptional()
  medical_history_details?: string;

  @IsBoolean()
  @IsOptional()
  has_personalized_learning_needs?: boolean;

  @IsNumber()
  @IsOptional()
  last_hospitalization_year?: number;

  @IsNumber()
  @IsOptional()
  personalized_learning_needs_details?: string;

  @IsNumber()
  @IsOptional()
  blood_group_id?: number;
}

export class SiblingDetailDto extends PartialType(SiblingDetailsDto) {
  @IsNumber()
  @IsOptional()
  sibling_global_user_id?: number;

  @IsString()
  @IsOptional()
  school_name?: string;

  @IsBoolean()
  @IsOptional()
  is_vibgyor_student?: boolean;

  @IsNumber()
  @IsOptional()
  gender_id?: number;

  @IsNumber()
  @IsOptional()
  user_type?: number;

  @IsNumber()
  @IsOptional()
  application_id?: number;

  @IsNumber()
  @IsOptional()
  service_id?: number;
}

export class ResidentialInfo {
  @IsString()
  @IsOptional()
  address_tag?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  user_id?: number;

  @IsString()
  @IsOptional()
  house_building_no?: string;

  @IsString()
  @IsOptional()
  street_name?: string;

  @IsString()
  @IsOptional()
  landmark?: string;

  @IsNumber()
  @IsOptional()
  city_id?: number;

  @IsNumber()
  @IsOptional()
  state_id?: number;

  @IsNumber()
  @IsOptional()
  country_id?: number;

  @IsNumber()
  @IsOptional()
  pincode?: number;
}

export class ContactInfo {
  @IsNumber()
  @IsOptional()
  guardian_id?: number;

  @IsNumber()
  @IsOptional()
  guardian_relationship_id?: number;

  @IsString()
  @IsOptional()
  preferred_mobile_no?: string;

  @IsString()
  @IsOptional()
  preferred_email_no?: string;
}

export class ParentDetailsDto {
  @IsNumber()
  @IsOptional()
  guardian_id?: number;

  @IsNumber()
  @IsOptional()
  city_id?: number;

  @IsNumber()
  @IsOptional()
  state_id?: number;

  @IsNumber()
  @IsOptional()
  country_id?: number;

  @IsString()
  @IsOptional()
  address_tag?: string;

  @IsString()
  @IsOptional()
  address_type?: string;

  @IsString()
  @IsOptional()
  global_no?: string;

  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  middle_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsString()
  @IsOptional()
  dob?: string;

  @IsString()
  @IsOptional()
  adhar_no?: string;

  @IsString()
  @IsOptional()
  pan_no?: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  area: string;

  @IsString()
  @IsOptional()
  pincode: string;

  @IsString()
  @IsOptional()
  mobile_no: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsNumber()
  @IsOptional()
  qualification_id?: number;

  @IsNumber()
  @IsOptional()
  occupation_id?: number;

  @IsNumber()
  @IsOptional()
  organization_id?: number;

  @IsNumber()
  @IsOptional()
  designation_id?: number;

  @IsNumber()
  @IsOptional()
  is_preferred_email?: number;

  @IsNumber()
  @IsOptional()
  is_preferred_mobile_no?: number;

  @IsNumber()
  @IsOptional()
  set_as_emergency_contact?: number;

  @IsNumber()
  @IsOptional()
  user_type?: number;

  @IsNumber()
  @IsOptional()
  application_id?: number;

  @IsNumber()
  @IsOptional()
  service_id?: number;

  @IsNumber()
  @IsOptional()
  guardian_relationship_id?: number;
}

export class StudentDetailDto {
  @IsOptional()
  @Type(() => StudentsDetailDto)
  student_profile?: StudentsDetailDto;

  @IsOptional()
  @Type(() => ParentDetailsDto)
  father_details?: ParentDetailsDto;

  @IsOptional()
  @Type(() => ParentDetailsDto)
  mother_details?: ParentDetailsDto;

  @IsOptional()
  @Type(() => ParentDetailsDto)
  guardian_details: ParentDetailsDto;

  @ApiProperty({ required: false, type: [Object] })
  @IsOptional()
  @IsArray()
  subject_selection: any[];

  @IsOptional()
  @IsArray()
  @Type(() => SiblingDetailDto)
  sibling_info: SiblingDetailDto[];

  @IsOptional()
  @IsArray()
  @Type(() => ResidentialInfo)
  residential_info: ResidentialInfo[];

  @IsOptional()
  @IsArray()
  @Type(() => ContactInfo)
  contact_detail: ContactInfo[];
}
