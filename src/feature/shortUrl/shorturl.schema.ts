import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({
  collection: 'shortUrl',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})
export class ShortUrlSchema {

  @Prop({ required: true, index: true })  // Add index here
  url: string;

  @Prop({ required: true, unique: true, index: true })  // Already has unique index
  hash: string;

  @Prop({
    type: Date,
    required: true,
    index: true  
  })
  expireAt: Date;
}

export type ShortUrlDocument = HydratedDocument<ShortUrlSchema>;
export const shortUrlSchema = SchemaFactory.createForClass(ShortUrlSchema);

// ✅ Compound index for url + expireAt queries (most efficient)
shortUrlSchema.index({ url: 1, expireAt: 1 });

// ✅ TTL: delete exactly at expireAt
shortUrlSchema.index(
  { expireAt: 1 },
  {
    expireAfterSeconds: 0
  }
);

export type ShortUrlModel = Model<ShortUrlSchema>;
