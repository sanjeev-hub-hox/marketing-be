//! Kafka Implementation
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document, Types } from 'mongoose';

// export enum ReminderStatus {
//   PENDING = 'pending',
//   SENT = 'sent',
//   FAILED = 'failed',
//   COMPLETED = 'completed',
// }

// export enum ReminderRecipientType {
//   PARENT = 'parent',
//   REFERRER = 'referrer',
// }

// @Schema({ timestamps: true })
// export class ReferralReminder extends Document {
//   @Prop({ type: Types.ObjectId, ref: 'Enquiry', required: true })
//   enquiry_id: Types.ObjectId;

//   @Prop({ required: true })
//   enquiry_number: string;

//   @Prop({ required: true, enum: ReminderRecipientType })
//   recipient_type: ReminderRecipientType;

//   @Prop({ required: true })
//   recipient_email: string;

//   @Prop({ required: true })
//   recipient_phone: string;

//   @Prop({ required: true })
//   recipient_name: string;

//   @Prop({ required: true, default: 0 })
//   reminder_count: number;

//   @Prop({ required: true })
//   max_reminders: number; // frequency * duration

//   @Prop({ required: true })
//   total_days: number;

//   @Prop({ required: true, default: ReminderStatus.PENDING })
//   status: ReminderStatus;

//   @Prop({ type: Date, required: true })
//   start_date: Date;

//   @Prop({ type: Date, required: true })
//   end_date: Date;

//   @Prop({ type: Date })
//   last_sent_at: Date;

//   @Prop({ type: Date })
//   next_scheduled_at: Date;

//   @Prop({ type: [Date], default: [] })
//   sent_timestamps: Date[];

//   @Prop({ type: Object })
//   referral_details: {
//     referrer_name?: string;
//     referred_name?: string;
//     verification_url?: string;
//   };

//   @Prop({ type: [String], default: [] })
//   error_logs: string[];

//   @Prop({ default: false })
//   is_verified: boolean;

//   @Prop({ type: Date })
//   verified_at: Date;
// }

// export const ReferralReminderSchema = SchemaFactory.createForClass(ReferralReminder);

//! Polling Implementaion 
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ReminderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ReminderRecipientType {
  PARENT = 'parent',
  REFERRER = 'referrer',
}

@Schema({ timestamps: true, collection: 'referral' })
export class SendReminder extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Enquiry', required: true })
  enquiry_id: Types.ObjectId;

  @Prop({ required: true })
  enquiry_number: string;

  @Prop({ 
    required: true, 
    enum: ReminderRecipientType,
    type: String 
  })
  recipient_type: ReminderRecipientType;

  @Prop({ required: true })
  recipient_email: string;

  @Prop({ required: true, type: String }) // ✅ Explicitly set as string
  recipient_phone: string;

  @Prop({ required: true })
  recipient_name: string;

  @Prop({ required: true, default: 0 })
  reminder_count: number;

  @Prop({ required: true })
  max_reminders: number;

  @Prop({ 
    required: true, 
    default: ReminderStatus.PENDING,
    enum: ReminderStatus,
    type: String 
  })
  status: ReminderStatus;

  @Prop({ type: Date })
  last_sent_at: Date;

  @Prop({ type: Date, required: true })
  next_scheduled_at: Date;

  @Prop({ type: [Date], default: [] })
  sent_timestamps: Date[];

  @Prop({ type: Object })
  referral_details: {
    verification_url: string;
    referrer_name?: string;
    referred_name?: string;
  };

  @Prop({ type: [String], default: [] })
  error_logs: string[];

  @Prop({ default: false })
  is_verified: boolean;

  @Prop({ type: Date })
  verified_at: Date;
}

export const SendReminderSchema = SchemaFactory.createForClass(SendReminder);