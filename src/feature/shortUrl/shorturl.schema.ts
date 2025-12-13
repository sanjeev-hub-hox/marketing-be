import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';

@Schema({
  collection: 'shortUrl',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})
export class ShortUrlSchema {

  @Prop({ required: true })
  url: string;

  @Prop({ required: true, unique: true })
  hash: string;

  @Prop({
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 30, // 30 days in seconds
  })
  expireAt: Date;
}

export type ShortUrlDocument = HydratedDocument<ShortUrlSchema>;
export const shortUrlSchema = SchemaFactory.createForClass(ShortUrlSchema);
export type ShortUrlModel = Model<ShortUrlSchema>;
