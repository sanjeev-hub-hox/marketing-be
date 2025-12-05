import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { EnquiryLogDocument, EnquiryLogModel } from './enquiryLog.schema';

@Injectable()
export class EnquiryLogRepository {
  constructor(
    @InjectModel('enquiryLogs') private enquiryModel: EnquiryLogModel,
  ) {}

  getSchemaPaths() {
    const schema = this.enquiryModel.schema.obj;
    return Object.keys(schema);
  }

  create(data: any): Promise<EnquiryLogDocument> {
    return this.enquiryModel.create(data);
  }

  getById(id: Types.ObjectId): Promise<Record<string, any> | null> {
    return this.enquiryModel.findById(id).lean();
  }

  getOne(filter: Record<string, any>, project: Record<string, number> = {}) {
    if (project) {
      return this.enquiryModel.findOne(filter, project);
    }
    return this.enquiryModel.findOne(filter);
  }

  getMany(
    filter: Record<string, any>,
    sortOrder: 'asc' | 'desc',
  ): Promise<Record<string, any>[]> {
    if (sortOrder === 'desc') {
      return this.enquiryModel.find(filter).sort({ _id: -1 }).lean();
    }
    return this.enquiryModel.find(filter).sort({ _id: 1 }).lean();
  }

  aggregate(pipeline: any[]) {
    return this.enquiryModel.aggregate(pipeline);
  }

  updateById(id: Types.ObjectId, data: any): Promise<any> {
    return this.enquiryModel.findByIdAndUpdate(id, data, { new: true });
  }

  hardDeleteById(id: Types.ObjectId): Promise<any> {
    return this.enquiryModel.findByIdAndDelete(id);
  }

  softDeleteById(id: Types.ObjectId): Promise<any> {
    return this.enquiryModel.findByIdAndUpdate(id, { is_deleted: true });
  }
}
