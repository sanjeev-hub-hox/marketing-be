import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { ParentLoginEvent } from './parentLoginLogs.type';

@Schema({ collection: 'parentLoginLogs', timestamps: { createdAt: 'created_at' } })
export class ParentLoginLogSchema {
  @Prop({ required: false })
  enrolmentNumber: string;

  @Prop({ required: false })
  studentId: string;

  @Prop({ required: true })
  event: ParentLoginEvent;
  
  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  log_data: mongoose.Schema.Types.Mixed;

  @Prop({ required: false })
  ip: string;
}

export type ParentLoginLogDocument = HydratedDocument<ParentLoginLogSchema>;
export const parentLoginLogsSchema = SchemaFactory.createForClass(ParentLoginLogSchema);
export type ParentLoginLogModel = Model<ParentLoginLogSchema>;
