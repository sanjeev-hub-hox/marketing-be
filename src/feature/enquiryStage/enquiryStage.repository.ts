import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { EnquiryStageDocument, EnquiryStageModel } from './enquiryStage.schema';
import { TEnquiryStage } from './enquiryStage.type';

@Injectable()
export class EnquiryStageRepository {
  constructor(
    @InjectModel('enquiryStage') private enquiryStageModel: EnquiryStageModel,
  ) {}

  create(data: TEnquiryStage): Promise<EnquiryStageDocument> {
    return this.enquiryStageModel.create(data);
  }

  getOne(filter: Record<string, any>, project?: Record<string, any>) {
    if (project) {
      return this.enquiryStageModel.findOne(filter, project).lean();
    }
    return this.enquiryStageModel.findOne(filter).lean();
  }

  getById(id: Types.ObjectId): Promise<EnquiryStageDocument> {
    return this.enquiryStageModel.findById(id);
  }

  getMany(filter: Record<string, any>, project?: Record<string, any>) {
    if (project) {
      return this.enquiryStageModel.find(filter, project).lean();
    }
    return this.enquiryStageModel.find(filter).lean();
  }

  aggregate(pipeline: any[]) {
    return this.enquiryStageModel.aggregate(pipeline);
  }

  updateById(
    id: Types.ObjectId,
    data: Partial<TEnquiryStage>,
  ): Promise<EnquiryStageDocument> {
    return this.enquiryStageModel.findByIdAndUpdate(id, data, { new: true });
  }

  hardDeleteById(id: Types.ObjectId): Promise<any> {
    return this.enquiryStageModel.findByIdAndDelete(id);
  }

  softDeleteById(id: Types.ObjectId): Promise<any> {
    return this.enquiryStageModel.findByIdAndUpdate(id, { is_deleted: true });
  }
}
