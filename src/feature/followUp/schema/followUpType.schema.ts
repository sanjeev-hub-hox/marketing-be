import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';

export type followUpTypeDocument = HydratedDocument<followUpTypes>;

@Schema({ collection:"follow-up-types",timestamps:{createdAt:"created_at",updatedAt:"updated_at"} })
export class followUpTypes {
  @Prop({ required: true })
  name: string;
}

export const followUpTypesSchema = SchemaFactory.createForClass(followUpTypes);
export type followUpTypesModel = Model<followUpTypes>;
