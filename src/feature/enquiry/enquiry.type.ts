import { Types } from 'mongoose';

export type TEnquiry = {
  _id?: Types.ObjectId;
  enquiry_id?: string;
  enquiry_date: string;
  enquiry_type: string;
  school_location: string;
  parent_type: string; //ENUM
  parent_first_name: string;
  parent_last_name: string;
  parent_mobile_number: string;
  parent_email_id: string;
  existing_school_name: string;
  existing_school_board: string;
  existing_school_grade: string;
  student_first_name: string;
  student_last_name: string;
  grade: string;
  gender: string; //ENUM
  dob: string;
  eligible_grade: string;
  enquiry_mode: string;
  enquiry_source_type: string;
  enquiry_source: string;
  enquiry_sub_source: string;
  enquiry_status: string; //ENUM
  is_deleted?: boolean;
  [key: string]: any;
};

export type TEnquirerDetails = {
  first_name: string;
  last_name: string;
  full_name: string;
  mobile: string;
  email: string;
  gloabl_id: string;
  _id?: string;
};

export enum EEnquiryType {
  NEW_ADMISSION = 'NewAdmission',
  PSA = 'PSA',
  IVT = 'IVT',
  KIDS_CLUB = 'KidsClub',
  READMISSION = 'Readmission',
  ADMISSION_10_11 = 'readmission_10_11'
}

export enum EEnquiryStatus {
  OPEN = 'Open',
  CLOSED = 'Closed',
  ON_HOLD = 'On Hold',
  ADMITTED = 'Admitted',
}

export enum EEnquiryPriority {
  HOT = 'Hot',
  WARM = 'Warm',
  COLD = 'Cold',
}

export enum EParentType {
  FATHER = 'Father',
  MOTHER = 'Mother',
  GUARDIAN = 'Guardian',
}

export enum ERegistrationForms {
  STUDENT_DETAILS = 'StudentDetails',
  PARENT_GUARDIAN_DETAILS = 'ParentGuardianDetails',
  CONTACT_DETAILS = 'ContactDetails',
  MEDICAL_DETAILS = 'MedicalDetails',
  BANK_DETAILS = 'BankDetails',
}

export enum EEnquiryStageStatus {
  OPEN = 'Open',
  COMPLETED = 'Completed',
  INPROGRESS = 'In Progress',
  PASSED = 'Passed',
  FAILED = 'Failed',
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  ADMITTED = 'Admitted',
  PROVISIONAL_ADMISSION = 'Provisional Admission',
}

export enum EPaymentType {
  ADMISSION = 'admission',
  REGISTRATION = 'registration',
  PSA = 'psa',
  KIDS_CLUB = 'kids_club',
  CONSOLIDATED = 'consolidated',
  TRANSPORT = 'Transport'
}

export enum EFeeType {
  REGISTRATION = 'registration',
}

export enum EEnquiryAdmissionType {
  ADMISSION = 'Admission',
  PROVISIONAL_ADMISSION = 'Provisional Admission',
}

export enum EWorklflowTriggerEnquiryStages {
  REGISTRATION = 'Registration',
  COMPETENCY_TEST = 'Competency test',
}

export enum RoundRobinAssignedStatus {
  NO = 'N',
  YES = 'Y',
}
