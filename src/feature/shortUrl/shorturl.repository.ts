import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ShortUrlDocument, ShortUrlModel } from './shorturl.schema';

@Injectable()
export class ShortUrlRepository {
  constructor(
    @InjectModel('shortUrl') private ShortUrlModel: ShortUrlModel,
  ) {}

  getSchemaPaths() {
    const schema = this.ShortUrlModel.schema.obj;
    return Object.keys(schema);
  }

  create(data: any): Promise<ShortUrlDocument> {
    return this.ShortUrlModel.create({
      ...data,
      expireAt: new Date(Date.now() + 2 * 60 * 1000),
    });
  }

  findByHash(hash: string): Promise<ShortUrlDocument | null> {
    return this.ShortUrlModel.findOne({ hash }).exec();
  }

  findById(id: string): Promise<ShortUrlDocument | null> {
    return this.ShortUrlModel.findById(id).exec();
  }
}
