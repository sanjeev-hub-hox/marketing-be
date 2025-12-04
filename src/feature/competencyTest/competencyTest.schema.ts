import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

import {
  ECompetencyTestMode,
  ECompetencyTestStatus,
} from './competencyTest.type';

@Schema({
  collection: 'competencyTests',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class CompetencyTest {
  @Prop()
  enquiry_id: Types.ObjectId;

  @Prop()
  booked_slot_id: Types.ObjectId;

  @Prop({ enum: ECompetencyTestMode })
  mode: ECompetencyTestMode;

  @Prop({ enum: ECompetencyTestStatus })
  status: ECompetencyTestStatus;

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

  @Prop({ default: null, enum: ECompetencyTestStatus })
  test_result: ECompetencyTestStatus;
}

export type TCompetencyTestDocument = HydratedDocument<CompetencyTest>;
export const CompetencyTestSchema =
  SchemaFactory.createForClass(CompetencyTest);
export type TCompetencyTestModel = Model<CompetencyTest>;
