import { Injectable } from '@nestjs/common';
import { ShortUrlRepository } from './shorturl.repository';
import { ShortUrlDTO } from './shorturl.type';
import { ShortUrlDocument } from './shorturl.schema';

@Injectable()
export class ShortUrlService {
  constructor(
    private shortUrlRepository: ShortUrlRepository,
  ) {}

  // Generate random 5-char hash
  private generateHash(length = 5) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Ensure hash is unique
  private async generateUniqueHash() {
    let hash: string;
    let exists: ShortUrlDocument | null;

    do {
      hash = this.generateHash();
      exists = await this.shortUrlRepository.findByHash(hash);
    } while (exists);

    return hash;
  }

  async createUrl(logData: ShortUrlDTO): Promise<ShortUrlDocument> {
    // Generate unique 5-char hash
    const hash = await this.generateUniqueHash();

    // Attach hash to payload
    const payload = {
      ...logData,
      hash,
    };

    // Save record
    const created = await this.shortUrlRepository.create(payload);
    return created;
  }

  async getByHashUrl(hash: string): Promise<ShortUrlDocument | null> {
    return await this.shortUrlRepository.findByHash(hash);
  }
}
