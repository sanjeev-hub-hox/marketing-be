import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { EEnquiryStageStatus, TEnquiryStageSubStage } from './enquiryStage.type';

export type EnquiryStageDocument = HydratedDocument<EnquiryStage>;

@Schema({ collection: "enquiryStage" , timestamps: { createdAt: "created_at", updatedAt: "updated_at" } })
export class EnquiryStage {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Boolean, default: true }) 
  is_active: boolean;

  @Prop({ required: true })
  start_date: Date;
    
  @Prop({ required: true })
  end_date: Date;

  @Prop({ default: false })
  saved_as_draft: boolean
    
  @Prop({ default: false })
  is_deleted: boolean
}

export const enquiryStageSchema = SchemaFactory.createForClass(EnquiryStage);
export type EnquiryStageModel = Model<EnquiryStage>;
