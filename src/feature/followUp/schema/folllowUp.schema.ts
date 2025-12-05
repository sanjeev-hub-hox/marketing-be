import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

export type FollowUpDocument = HydratedDocument<FollowUp>;

class ReminderSchema {
  @Prop()
  mode: string;

  @Prop()
  text: string;

  @Prop({ default: null })
  additional_details: string;

  @Prop()
  date: string;

  @Prop()
  time: string;
}

export class CloseEnquiryDetails {
  @Prop()
  status: string;

  @Prop()
  reason: string;
}

@Schema({
  collection: 'followUps',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class FollowUp {
  @Prop({ required: true })
  enquiry_id: Types.ObjectId;

  @Prop({ required: true })
  mode: string[];

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  time: string;

  @Prop({ default: null })
  remarks: string;

  @Prop({ default: null, required: false })
  reminder_details: ReminderSchema;

  @Prop({ default: null, required: false })
  close_enquiry_details: CloseEnquiryDetails;

  @Prop({
    type: {
      user_id: { type: Number, required: false },
      user_name: { type: String, required: false },
      email: { type: String, required: false },
    },
    _id: false,
    default: null,
  })
  created_by: {
    user_id: number;
    user_name: string;
    email: string;
  };

  @Prop({ default: false })
  is_deleted: boolean;
}

export const FollowUpSchema = SchemaFactory.createForClass(FollowUp);
export type followUpModel = Model<FollowUp>;
