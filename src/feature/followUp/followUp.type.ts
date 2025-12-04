import { Types } from 'mongoose';

export type TFollowUp = {
  follow_up_mode: string[];
  enquiry_id: Types.ObjectId;
  status: string;
  follow_up_date: string;
  follow_up_time: string;
  comment: string;
  created_at?: Date;
};

export enum ERecurringType {
  Daily = 'daily',
  Weekly = 'weekly',
  BiWeekly = 'bi-weekly',
  Monthly = 'monthly',
  Yearly = 'yearly',
}

export enum EFollowUpMode {
  cell = 'Cell',
  call = 'Call',
  email = 'Email',
  virtualMeeting = 'Virtual Meeting',
  physicalMeeting = 'Physical Meeting',
}
