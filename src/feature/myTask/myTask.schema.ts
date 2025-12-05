import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { ETaskEntityType } from './myTask.type';

@Schema({
  collection: 'myTask',
  strict: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class MyTaskSchema {
  @Prop({ required: true })
  enquiry_id: Types.ObjectId;

  @Prop({ required: true , enum: ETaskEntityType })
  created_for_stage: ETaskEntityType;

  @Prop({ default: 1 })
  task_creation_count: number;

  @Prop({ default: true })
  valid_from: Date;

  @Prop({ default: true })
  valid_till: Date;

  @Prop({ default: false })
  is_closed: boolean;

  @Prop({ default: null })
  assigned_to_id: number;
}

export type TMyTaskDocument = HydratedDocument<MyTaskSchema>;
export const myTaskSchema = SchemaFactory.createForClass(MyTaskSchema);
export type TMyTaskModel = Model<MyTaskSchema>;
