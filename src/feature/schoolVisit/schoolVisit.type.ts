import { Types } from 'mongoose';

export type TFollowUp = {
  follow_up_type: string[];
  enquiry_id: Types.ObjectId;
  status: string;
  follow_up_date: string;
  follow_up_time: string;
  comment: string;
  created_at?: Date;
  created_by: string;
};

export enum ERecurringType {
  Daily = 'daily',
  Weekly = 'weekly',
  BiWeekly = 'bi-weekly',
  Monthly = 'monthly',
  Yearly = 'yearly',
}

export enum ESchoolVisitStatus {
  SCHEDULED = 'Scheduled',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed',
}
