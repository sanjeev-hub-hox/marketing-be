import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';

import {
  defaultAddressDetails,
  defaultBankDetails,
  defaultContactDetails,
  defaultExistingSchoolDetails,
  defaultGuardianInfo,
  defaultMedicalDetails,
  defaultParentInfo,
  defaultPreferenceDetails,
  defaultResidentialDetails,
} from './defaultValues';
import { EEnquiryStatus, RoundRobinAssignedStatus } from './enquiry.type';
@Schema({ strict: true, _id: false })
class MasterFieldSchema {
  @Prop({ default: null })
  id: number;

  @Prop({ default: null })
  value: string;
}

@Schema({ strict: false, _id: false })
class guestHostSchool {
  @Prop({ default: null })
  location: MasterFieldSchema;
}
@Schema({ strict: false, _id: false })
class ParentInfo {
  @Prop({ is_required: false, default: null })
  global_id: string;

  @Prop({ is_required: false })
  first_name: string;

  @Prop({ is_required: false })
  last_name: string;

  @Prop({ is_required: false })
  mobile: string;

  @Prop({ is_required: false })
  email: string;

  @Prop({ default: null })
  pan: string;

  @Prop({ default: null })
  aadhar: string;

  @Prop({ default: null })
  qualification: MasterFieldSchema;

  @Prop({ default: null })
  occupation: MasterFieldSchema;

  @Prop({ default: null })
  organization_name: string;

  @Prop({ default: null })
  designation: MasterFieldSchema;

  @Prop({ default: null })
  office_address: string;

  @Prop({ default: null })
  area: string;

  @Prop({ default: null })
  country: MasterFieldSchema;

  @Prop({ default: null })
  pin_code: string;

  @Prop({ default: null })
  state: MasterFieldSchema;

  @Prop({ default: null })
  city: MasterFieldSchema;

  @Prop({ default: null })
  sso_username: string;

  @Prop({ default: null })
  sso_password: string;
}

@Schema({ strict: false, _id: false })
class GuardianInfo {
  @Prop({ is_required: false })
  global_id: string;

  @Prop({ is_required: false })
  first_name: string;

  @Prop({ is_required: false })
  last_name: string;

  @Prop({ is_required: false })
  mobile: string;

  @Prop({ is_required: false })
  email: string;

  @Prop({ default: null })
  relationship_with_child: MasterFieldSchema;

  @Prop({ default: null })
  address: string;

  @Prop({ default: null })
  house: string;

  @Prop({ default: null })
  street: string;

  @Prop({ default: null })
  landmark: string;

  @Prop({ default: null })
  country: MasterFieldSchema;

  @Prop({ default: null })
  pin_code: string;

  @Prop({ default: null })
  state: MasterFieldSchema;

  @Prop({ default: null })
  city: MasterFieldSchema;

  @Prop({ default: null })
  aadhar: string;

  @Prop({ default: null })
  pan: string;

  @Prop({ default: null })
  guardian_type: string; //ENUM

  @Prop({ default: null })
  sso_username: string;

  @Prop({ default: null })
  sso_password: string;
}

@Schema({ strict: true, _id: false })
export class ParentDetails {
  @Prop({ default: defaultParentInfo })
  father_details: ParentInfo;

  @Prop({ default: defaultParentInfo })
  mother_details: ParentInfo;

  @Prop({ default: defaultGuardianInfo })
  guardian_details: GuardianInfo;
}

@Schema({ strict: true, _id: false })
class ExistingSchoolDetails {
  @Prop({ default: null })
  name: string;

  @Prop({ default: null })
  board: MasterFieldSchema;

  @Prop({ default: null })
  grade: MasterFieldSchema;

  @Prop({ default: null })
  academic_year: MasterFieldSchema;
}

@Schema({ strict: false, _id: false })
class StudentDetails {
  @Prop({ is_required: false, default: null })
  enrolment_number: string;

  @Prop({ is_required: false })
  first_name: string;

  @Prop({ is_required: false })
  last_name: string;

  @Prop({ is_required: false })
  grade: MasterFieldSchema;

  @Prop({ is_required: false })
  gender: MasterFieldSchema;

  @Prop({ is_required: false })
  dob: string;

  @Prop({ is_required: false })
  eligible_grade: string;

  @Prop({ default: null })
  place_of_birth: string;

  @Prop({ default: null })
  religion: MasterFieldSchema;

  @Prop({ default: null })
  caste: MasterFieldSchema;

  @Prop({ default: null })
  sub_caste: MasterFieldSchema;

  @Prop({ default: null })
  nationality: MasterFieldSchema;

  @Prop({ default: null })
  mother_tongue: MasterFieldSchema;

  @Prop({ default: null })
  aadhar: string;

  @Prop({ default: null })
  global_id: string;
}

@Schema({ strict: true, _id: false })
export class AddressDetails {
  @Prop({ default: null })
  house: string;

  @Prop({ default: null })
  street: string;

  @Prop({ default: null })
  landmark: string;

  @Prop({ default: null })
  country: MasterFieldSchema;

  @Prop({ default: null })
  pin_code: string;

  @Prop({ default: null })
  state: MasterFieldSchema;

  @Prop({ default: null })
  city: MasterFieldSchema;
}

export class ResidentialAddress {
  @Prop({ default: defaultAddressDetails })
  current_address: AddressDetails;

  @Prop({ default: defaultAddressDetails })
  permanent_address: AddressDetails;

  @Prop({ type: [String, Boolean], default: true })
  is_permanent_address: boolean | string;
}

@Schema({ strict: true, _id: false })
export class SiblingDetails {
  @Prop({ default: null })
  id: number;

  @Prop({ default: null })
  type: string; //ENUM

  @Prop({ default: null })
  enrollment_number: string;

  @Prop({ default: null })
  first_name: string;

  @Prop({ default: null })
  last_name: string;

  @Prop({ default: null })
  dob: string;

  @Prop({ default: null })
  gender: MasterFieldSchema;

  @Prop({ default: null })
  school: string;

  @Prop({ default: null })
  grade: MasterFieldSchema;
}

@Schema({ strict: true, _id: false })
export class PreferenceSchema {
  @Prop({ default: null })
  mobile_of_parent: string;

  @Prop({ default: null })
  mobile: string;

  @Prop({ default: null })
  email_of_parent: string;

  @Prop({ default: null })
  email: string;
}

@Schema({ strict: true, _id: false })
export class ContactDetails {
  @Prop({ default: defaultPreferenceDetails })
  first_preference: PreferenceSchema;

  @Prop({ default: defaultPreferenceDetails })
  second_preference: PreferenceSchema;

  @Prop({ default: defaultPreferenceDetails })
  third_preference: PreferenceSchema;

  @Prop({ default: null })
  emergency_contact: string;
}

@Schema({ strict: true, _id: false })
export class MedicalDetails {
  @Prop({ default: null })
  was_hopitalised: string;

  @Prop({ default: null })
  year_of_hospitalisation: string;

  @Prop({ default: null })
  reason_of_hospitalisation: string;

  @Prop({ default: null })
  has_physical_disability: string;

  @Prop({ default: null })
  physical_disability_description: string;

  @Prop({ default: null })
  has_medical_history: string;

  @Prop({ default: null })
  medical_history_description: string;

  @Prop({ default: null })
  has_allergy: string;

  @Prop({ default: null })
  allergy_description: string;

  @Prop({ default: null })
  blood_group: MasterFieldSchema;

  @Prop({ default: null })
  has_learning_needs: string;

  @Prop({ default: null })
  personalised_learning_needs: MasterFieldSchema;
}

@Schema({ strict: false, _id: false }) // Note: All the field values must be encrypted as it is PII
export class BankDetails {
  @Prop({ default: null })
  ifsc: string;

  @Prop({ default: null })
  bank_name: string;

  @Prop({ default: null })
  branch_name: string;

  @Prop({ default: null })
  account_holder_name: string;

  @Prop({ default: null })
  account_type: string;

  @Prop({ default: null })
  account_number: string;

  @Prop({ default: null })
  upi: string;
}

@Schema({ strict: false, _id: false })
class EnquiryDocuments {
  @Prop({ default: null })
  document_id: number;

  @Prop({ default: null })
  document_name: number;

  @Prop({ default: null })
  file: string;

  @Prop({ default: false })
  is_verified: boolean;

  @Prop({ type: Boolean, required: false })
  is_mandatory: boolean;

  @Prop({ type: String, required: false })
  stage: string;

  @Prop({ default: false })
  is_deleted: boolean;
}

@Schema({ strict: true, _id: false })
class RegistrationPaymentDetails {
  @Prop({ default: null })
  amount: number;

  @Prop({ default: null })
  mode_of_payment: string;

  @Prop({ default: null })
  payment_date_time: string;
}

@Schema({
  collection: 'enquiry',
  strict: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class EnquiryRegistrationSchema {
  @Prop({ default: null }) // Later make it required
  enquiry_number: string;

  @Prop({ default: null })
  academic_year: MasterFieldSchema;

  @Prop({ required: false })
  ivt_date: Date;

  @Prop({ required: false })
  ivt_reason: MasterFieldSchema;

  @Prop({ required: false })
  enquiry_form_id: Types.ObjectId;

  @Prop({ required: false, ref: 'enquiryType' })
  enquiry_type_id: Types.ObjectId;

  @Prop({ required: false })
  enquiry_date: Date;

  @Prop({ default: null })
  school_location: MasterFieldSchema;

  @Prop({ required: false })
  enquiry_mode: MasterFieldSchema;

  @Prop({ required: false })
  enquiry_source_type: MasterFieldSchema;

  @Prop({ required: false })
  enquiry_source: MasterFieldSchema;

  @Prop({ required: false })
  enquiry_sub_source: MasterFieldSchema;

  @Prop({ required: false })
  enquiry_stages: {
    stage_id: Types.ObjectId;
    stage_name: string;
    status: string;
  }[];

  @Prop({ required: false })
  student_details: StudentDetails;

  @Prop({ default: null })
  parent_enquiry_number: string;

  @Prop({ default: defaultExistingSchoolDetails })
  existing_school_details: ExistingSchoolDetails;

  @Prop({ required: false })
  parent_details: ParentDetails;

  @Prop({ default: defaultResidentialDetails })
  residential_details: ResidentialAddress;

  @Prop({ default: [] })
  sibling_details: SiblingDetails[];

  @Prop({ default: defaultContactDetails })
  contact_details: ContactDetails;

  @Prop({ default: defaultMedicalDetails })
  medical_details: MedicalDetails;

  @Prop({ default: defaultBankDetails })
  bank_details: BankDetails;

  @Prop({ default: {} })
  other_details: mongoose.Schema.Types.Mixed;

  @Prop({ required: false })
  guest_student_details: guestHostSchool;

  @Prop({ default: null })
  assigned_to: string;

  @Prop({ default: false })
  assigned_to_id: number;

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop()
  documents: EnquiryDocuments[];

  @Prop({ default: EEnquiryStatus.OPEN })
  status: string;

  @Prop({ default: false })
  is_registered: boolean;

  @Prop({ default: false })
  registration_fees_paid: boolean;

  @Prop({ default: null })
  registered_at: Date;

  @Prop({ default: null })
  registration_payment_details: RegistrationPaymentDetails;

  @Prop({ default: false })
  registration_fee_request_triggered: boolean;

  @Prop({ default: false })
  terms_and_condition_selected: boolean;

  @Prop({
    type: String,
    enum: RoundRobinAssignedStatus,
    default: RoundRobinAssignedStatus.NO,
  })
  round_robin_assigned: RoundRobinAssignedStatus;

  @Prop({
    type: {
      user_id: { type: Number, required: false },
      user_name: { type: String, required: false },
      email: { type: String, required: false },
    },
    _id: false,
    default: {},
  })
  created_by: {
    user_id: number;
    user_name: string;
    email: string;
  };
}

export type EnquiryDocument = HydratedDocument<EnquiryRegistrationSchema>;
export const enquirySchema = SchemaFactory.createForClass(
  EnquiryRegistrationSchema,
);
export type EnquiryModel = Model<EnquiryRegistrationSchema>;
