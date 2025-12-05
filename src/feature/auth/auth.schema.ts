import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuthDocument = HydratedDocument<Auth>;

@Schema()
export class Auth {
  @Prop()
  id: string;

  @Prop({})
  userinfo: object[];

  @Prop()
  username: string;

  @Prop()
  created_by_id: number;

  @Prop()
  updated_by_id: number;

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
// export type AuthModel = Model<Auth>;
