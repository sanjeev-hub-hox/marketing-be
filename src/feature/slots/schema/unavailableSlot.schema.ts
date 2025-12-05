import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

import { camelise } from '../../../utils/utility-functions';
import { ESlotType, EUnavailabilityOf } from '../slot.type';

@Schema({
  collection: camelise(UnavailableSlot.name),
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class UnavailableSlot {
  @Prop({ required: true })
  slot_id: Types.ObjectId;

  @Prop({ required: true, enum: ESlotType })
  slot_for: ESlotType;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, enum: EUnavailabilityOf })
  unavailability_of: EUnavailabilityOf;
}

export type TUnavailableSlotsDocument = HydratedDocument<UnavailableSlot>;
export const unavailableSlotsSchema =
  SchemaFactory.createForClass(UnavailableSlot);
export type TUnavailableSlotsModel = Model<UnavailableSlot>;
