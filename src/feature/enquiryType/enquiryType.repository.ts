import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { EnquiryTypeDocument, EnquiryTypeModel } from './enquiryType.schema';
import { TEnquiryType } from './enquiryType.type';

@Injectable()
export class EnquiryTypeRepository {
  constructor(
    @InjectModel('enquiryType') private enquiryTypeModel: EnquiryTypeModel,
  ) {}

  create(data: any): Promise<EnquiryTypeDocument> {
    return this.enquiryTypeModel.create(data);
  }

  getById(id: Types.ObjectId) {
    return this.enquiryTypeModel.findById(id).lean();
  }

  updateById(
    id: Types.ObjectId,
    data: Partial<TEnquiryType>,
  ): Promise<EnquiryTypeDocument> {
    return this.enquiryTypeModel.findByIdAndUpdate(id, data, { new: true });
  }

  getOne(filter: Record<string, any>, project?: Record<string, any>) {
    if (project) {
      return this.enquiryTypeModel.findOne(filter, project).lean();
    }
    return this.enquiryTypeModel.findOne(filter).lean();
  }

  getMany(filter: Record<string, any>, project?: Record<string, any>) {
    if (project) {
      return this.enquiryTypeModel.find(filter, project).lean();
    }
    return this.enquiryTypeModel.find(filter).lean();
  }

  aggregate(pipeline: any[]): Promise<any[]> {
    return this.enquiryTypeModel.aggregate(pipeline);
  }

  softDeleteById(id: Types.ObjectId) {
    return this.enquiryTypeModel.findByIdAndUpdate(
      id,
      { is_deleted: true },
      { new: true },
    );
  }
}
