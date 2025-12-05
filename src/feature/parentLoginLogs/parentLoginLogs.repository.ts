import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ParentLoginLogDocument, ParentLoginLogModel } from './parentLoginLogs.schema';

@Injectable()
export class ParentLoginLogRepository {
  constructor(
    @InjectModel('parentLoginLogs') private ParentLoginModel: ParentLoginLogModel,
  ) {}

  getSchemaPaths() {
    const schema = this.ParentLoginModel.schema.obj;
    return Object.keys(schema);
  }

  create(data: any): Promise<ParentLoginLogDocument> {
    return this.ParentLoginModel.create(data);
  }
}