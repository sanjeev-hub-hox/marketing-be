import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

import { ESchoolVisitStatus } from './schoolVisit.type';

export type SchoolVisitDocument = HydratedDocument<SchoolVisit>;

@Schema({
  collection: 'schoolVisits',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class SchoolVisit {
  @Prop()
  enquiry_id: Types.ObjectId;

  @Prop()
  booked_slot_id: Types.ObjectId;

  @Prop({ default: null })
  comment: string;

  @Prop({ enum: ESchoolVisitStatus })
  status: ESchoolVisitStatus;

  @Prop({
    type: {
      user_id: { type: Number, required: false },
      user_name: { type: String, required: false },
      email: { type: String, required: false },
    },
    _id: false,
    default: {},
  })
  created_by: {
    user_id: number;
    user_name: string;
    email: string;
  };

  @Prop({ default: null })
  cancel_reason: string;

  @Prop({ default: null })
  cancel_comment: string;

  @Prop({ default: [] })
  activities: string[];

  @Prop({ default: null })
  activity_comment: string;
}

export const SchoolVisitSchema = SchemaFactory.createForClass(SchoolVisit);
export type schoolVisitModel = Model<SchoolVisit>;
