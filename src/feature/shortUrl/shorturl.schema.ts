import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({
  collection: 'shortUrl',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})
export class ShortUrlSchema {

  @Prop({ required: true })
  url: string;

  @Prop({ required: true, unique: true })
  hash: string;

  // ✅ Store ACTUAL expiry time (not now)
  @Prop({
    type: Date,
    required: true
  })
  expireAt: Date;
}

export type ShortUrlDocument = HydratedDocument<ShortUrlSchema>;
export const shortUrlSchema = SchemaFactory.createForClass(ShortUrlSchema);

// ✅ TTL: delete exactly at expireAt
shortUrlSchema.index(
  { expireAt: 1 },
  {
    expireAfterSeconds: 0
  }
);

export type ShortUrlModel = Model<ShortUrlSchema>;