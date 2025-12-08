export interface ReminderMessage {
  messageId: string;
  enquiryId: string;
  enquiryNumber: string;
  recipientType: 'parent' | 'referrer';
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
  verifiedBy: 'parent' | 'referrer';
  verifiedAt: string;
  ipAddress?: string;
}

export interface RecipientInfo {
  type: 'parent' | 'referrer';
  email: string;
  phone: string | number;
  name: string;
  verificationUrl: string;
  referrerName?: string;
  referredName?: string;
}

export interface VerificationStatus {
  parent: boolean;
  referrer: boolean;
}