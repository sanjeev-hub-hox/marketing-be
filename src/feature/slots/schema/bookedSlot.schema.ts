import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

import { camelise } from '../../../utils/utility-functions';
import { ESlotType } from '../slot.type';

@Schema({
  collection: camelise(BookedSlot.name),
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class BookedSlot {
  @Prop({ required: true })
  slot_id: Types.ObjectId;

  @Prop({ required: true, enum: ESlotType })
  slot_for: ESlotType;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  enquiry_id: Types.ObjectId;
}

export type TBookedSlotDocument = HydratedDocument<BookedSlot>;
export const bookedSlotSchema = SchemaFactory.createForClass(BookedSlot);
export type TBookedSlotModel = Model<BookedSlot>;
