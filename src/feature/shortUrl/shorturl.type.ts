import { Types } from 'mongoose';

export type ShortUrlDTO = {
  _id?: Types.ObjectId;
  url: string;
  hash?: string; // optional because service generates it
  created_at?: Date;
  updated_at?: Date;
};
