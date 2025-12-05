import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type DynamidFormDocument = HydratedDocument<DynamidForm>;

@Schema({
  collection: 'dynamicFormMetadata',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class DynamidForm {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  created_at: string;

  @Prop({ required: true })
  is_active: boolean;
}

export const dynamicFormSchema = SchemaFactory.createForClass(DynamidForm);
export type DynamicFormModel = Model<DynamidForm>;
