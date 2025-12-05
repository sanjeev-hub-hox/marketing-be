import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';
import { EEnquiryTypeMode, TEnquiryTypeActions, TEnquiryTypeSources, TEnquiryTypeStage } from './enquiryType.type';

export type EnquiryTypeDocument = HydratedDocument<EnquiryType>;

@Schema({ collection: 'enquiryType', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at'}})
export class EnquiryType {
  @Prop({ default: null })
  name: string;

  @Prop({ default: null })
  slug: string;
    
  @Prop()
  mode: EEnquiryTypeMode;
    
  @Prop()
  order: number;

  @Prop()
  enquiry_forms: Types.ObjectId[];

  @Prop()
  description: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: false })
  saved_as_draft: boolean;

  @Prop({ default: [] })
  stages: TEnquiryTypeStage[];

  @Prop({ default: false })
  is_deleted: boolean;
}
export const EnquiryTypeSchema = SchemaFactory.createForClass(EnquiryType);
export type EnquiryTypeModel = Model<EnquiryType>;
