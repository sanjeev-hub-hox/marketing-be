import { ReminderRecipientType } from './referralReminder.schema';

export interface ReminderMessage {
  messageId: string;
  enquiryId: string;
  enquiryNumber: string;
  recipientType: ReminderRecipientType;
  recipientEmail: string;
  recipientPhone: string;
  recipientName: string;
  verificationUrl: string;
  referrerName?: string;
  referredName?: string;
  reminderCount: number;
  maxReminders: number;
  scheduledFor: string;
  createdAt: string;
}

export interface VerificationMessage {
  enquiryId: string;
  verifiedBy: ReminderRecipientType;
  verifiedAt: string;
  ipAddress?: string;
}

export interface RecipientInfo {
  type: ReminderRecipientType;
  email: string;
  phone: string;
  name: string;
  verificationUrl: string;
  referrerName?: string;
  referredName?: string;
}

export interface VerificationStatus {
  parent: boolean;
  referrer: boolean;
}