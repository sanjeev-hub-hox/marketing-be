import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';

import {
  EEnquiryEvent,
  EEnquiryEventSubType,
  EEnquiryEventType,
} from './enquiryLog.type';

@Schema({ collection: 'enquiryLogs', timestamps: { createdAt: 'created_at' } })
export class EnquiryLogSchema {
  @Prop({ required: true })
  enquiry_id: Types.ObjectId;

  @Prop({ required: true })
  event_type: EEnquiryEventType;

  @Prop({ default: null })
  event_sub_type: EEnquiryEventSubType;

  @Prop({ required: true })
  event: EEnquiryEvent;

  @Prop({ default: null })
  log_data: mongoose.Schema.Types.Mixed;

  @Prop({ required: true })
  created_by: string;

  @Prop({ required: true })
  created_by_id: number;

  @Prop({ required: false })
  is_admission_fee_received_log: boolean;
}

export type EnquiryLogDocument = HydratedDocument<EnquiryLogSchema>;
export const enquiryLogSchema = SchemaFactory.createForClass(EnquiryLogSchema);
export type EnquiryLogModel = Model<EnquiryLogSchema>;
