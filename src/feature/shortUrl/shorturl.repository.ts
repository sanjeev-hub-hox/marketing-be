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
      expireAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    });
  }

  findByHash(hash: string): Promise<ShortUrlDocument | null> {
    return this.ShortUrlModel.findOne({ hash }).exec();
  }

  // ✅ NEW: Find by URL
  findByUrl(url: string): Promise<ShortUrlDocument | null> {
    return this.ShortUrlModel.findOne({ url }).exec();
  }

  findByUrlAndNotExpired(url: string): Promise<ShortUrlDocument | null> {
    return this.ShortUrlModel.findOne({
      url,
      $or: [
        { expireAt: { $gt: new Date() } },  
        { expireAt: { $exists: false } }     
      ]
    }).exec();
  }

  // ✅ NEW: Check if URL exists and is not expired
  async isUrlValid(url: string): Promise<boolean> {
    console.log('controller_url___', url)
    const record = await this.ShortUrlModel.findOne({ url }).exec();
    
    if (!record) {
      return false; // URL doesn't exist in shortUrl collection
    }

    // Check if expired
    const now = new Date();
    if (record.expireAt && now > record.expireAt) {
      return false; // URL exists but has expired
    }

    return true; // URL exists and is still valid
  }

  findById(id: string): Promise<ShortUrlDocument | null> {
    return this.ShortUrlModel.findById(id).exec();
  }
}
