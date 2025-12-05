import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';

export type demoExcelsDocument = HydratedDocument<demoExcels>;

@Schema({ collection:"demo-excel",timestamps:{createdAt:"created_at",updatedAt:"updated_at"} })
export class demoExcels {
  @Prop()
  Name: string;

  @Prop()
  Age: number;

  @Prop()
  Email: string;

  @Prop()
  Address: string;
  
  @Prop()
  First_name: string;

  @Prop()
  password:string;
}

export const demoExcelsSchema = SchemaFactory.createForClass(demoExcels);
export type demoExcelsModel = Model<demoExcels>;
