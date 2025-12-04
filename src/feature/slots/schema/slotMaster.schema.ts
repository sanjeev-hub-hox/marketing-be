import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import { camelise } from '../../../utils/utility-functions';
import { ESlotType, EWeekDays } from '../slot.type';

@Schema({
  collection: camelise(SlotMaster.name),
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class SlotMaster {
  @Prop({ enum: ESlotType })
  slot_for: ESlotType;

  @Prop({ required: true })
  slot: string;

  @Prop({ required: true, enum: EWeekDays })
  day: EWeekDays;

  @Prop({ required: true })
  school_id: number;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: true })
  is_deleted: boolean;
}

export type TSlotMasterDocument = HydratedDocument<SlotMaster>;
export const SlotMasterSchema = SchemaFactory.createForClass(SlotMaster);
export type TSlotMasterModel = Model<SlotMaster>;
