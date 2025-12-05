import { Types } from 'mongoose';

export type TEnquiryLog = {
  _id?: Types.ObjectId;
  enquiry_id: Types.ObjectId;
  event_type: EEnquiryEventType;
  event_sub_type?: EEnquiryEventSubType;
  event?: EEnquiryEvent | string;
  log_data?: any;
  created_by: any;
  created_by_id: number;
  is_admission_fee_received_log?: boolean;
};

/**
 * NOTE: Below is the temporary set of events
 * Get the correct values for enquiry event, type and sub type
 */
export enum EEnquiryEvent {
  ENQUIRY_RECEIVED = 'Enquiry received',
  ENQUIRY_CREATED = 'Enquiry created', // Can use in place of ENQUIRY_RECEIVED
  ENQUIRY_PUT_ON_HOLD = 'Enquiry put on hold',
  ENQUIRY_REOPENED = 'Enquiry reopened',
  ENQUIRY_CLOSED = 'Enquiry closed',
  FOLLOW_UP_CALL = 'Follow up (Call)',
  FOLLOW_UP_VIRTUAL_MEETING = 'Follow up (Virtual Meeting)',
  FOLLOW_UP_EMAIL = 'Follow up (Email)',
  FOLLOW_UP_PHYSICAL_MEETING = 'Follow up (Physical Meeting)',
  SCHOOL_TOUR_SCHEDULED = 'School tour scheduled',
  SCHOOL_TOUR_RESCHEDULE = 'School tour rescheduled',
  SCHOOL_TOUR_CANCELLED = 'School tour cancelled',
  SCHOOL_TOUR_COMPLETED = 'School tour completed',
  COMPETENCY_TEST_SCHEDULED = 'Competency test scheduled',
  COMPETENCY_TEST_RESCHEDULED = 'Competency test rescheduled',
  COMPETENCY_TEST_CANCELLED = 'Competency test cancelled',
  COMPETENCY_TEST_PASSED = 'Competency test passed',
  COMPETENCY_TEST_FAILED = 'Competency test failed',
  ENQUIRY_TRANSFERRED = 'Enquiry transferred',
  ENQUIRY_REASSIGNED = 'Enquiry reassigned to', // TODO need to use this event in reassigning enquiry
  ENQUIRY_MERGED = 'Enquiry merged with',
  PAYMENT_RECEIVED = 'Payment received',
  REGISTRATION_FEE_REQUEST_SENT = 'Registration fee Initiated',
  REGISTRATION_FEE_RECEIVED = 'Registration fee received',
  ADMISSION_FEE_REQUEST_SENT = 'Admission fee request sent',
  ADMISSION_FEE_RECEIVED = 'Admission fee received',
  ADMISSION_APPROVAL_PENDING = 'Waiting for principal approval',
  ADMISSION_APPROVED = 'Admission approved',
  ADMISSION_REJECTED = 'Admission rejected',
  REGISTRATION_DETAILS_RECIEVED = 'Registration details received',
  ADMISSION_COMPLETED = 'Admission completed',
  VAS_ADDED = 'VAS added',
  SUBJECTS_SELECTED = 'Subjects selected',
  FEES_ATTACHED = 'Fees attached',
}

export enum EEnquiryEventType {
  ENQUIRY = 'Enquiry',
  SCHOOL_TOUR = 'School Tour',
  REGISTRATION = 'Registration',
  COMPETENCY_TEST = 'Competency Test',
  ADMISSION = 'Admission',
  FOLLOW_UP = 'Follow up', // Additional event
  REASSIGN = 'Reassign',
  TRANSFER = 'Transfer',
  REOPEN = 'Reopen', // Nikhil
}

export enum EEnquiryEventSubType {
  ENQUIRY_ACTION = 'Enquiry Action',
  SCHOOL_TOUR_ACTION = 'School Tour Action',
  EXCEPTION_ACTION = 'Exception Action',
  REGISTRATION_ACTION = 'Registration Action',
  COMPETENCY_TEST_ACTION = 'Competency Test Action',
  ADMISSION_ACTION = 'Admission Action',
  FOLLOW_UP_ACTION = 'Follow up Action', // Additional event
}
