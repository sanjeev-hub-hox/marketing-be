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
  })
  expireAt: Date;
}

export type ShortUrlDocument = HydratedDocument<ShortUrlSchema>;
export const shortUrlSchema = SchemaFactory.createForClass(ShortUrlSchema);

// ✅ Add TTL index AFTER schema creation - this is the correct way
shortUrlSchema.index(
  { expireAt: 1 }, 
  { 
    expireAfterSeconds: 60 * 30, // 30 minutes in seconds (1800 seconds)
    background: true // Create index in background to avoid blocking
  }
);

export type ShortUrlModel = Model<ShortUrlSchema>;
