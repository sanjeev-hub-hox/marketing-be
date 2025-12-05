import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { TFollowUp } from './followUp.type';
import {
  FollowUpDocument,
  followUpModel,
  followUpTypeDocument,
  followUpTypesModel,
} from './schema';

@Injectable()
export class FollowUpRepository {
  constructor(
    @InjectModel('followUpTypes')
    private FollowUpTypesModel: followUpTypesModel,
    @InjectModel('followUps')
    private FollowUpModel: followUpModel,
  ) {}

  create(data: Record<string, any>): Promise<FollowUpDocument> {
    return this.FollowUpModel.create(data);
  }

  getById(id: Types.ObjectId): Promise<FollowUpDocument> {
    return this.FollowUpModel.findById(id);
  }

  getMany(
    filter: Record<string, any>,
    sort?: Record<string, any>,
  ): Promise<any[]> {
    if (sort) {
      return this.FollowUpModel.find(filter).sort(sort).lean();
    }
    return this.FollowUpModel.find(filter).lean();
  }

  getManyTypes(filter: Record<string, any>): Promise<followUpTypeDocument[]> {
    return this.FollowUpTypesModel.find(filter);
  }

  aggregate(pipeline: any[]) {
    return this.FollowUpModel.aggregate(pipeline);
  }

  updateById(
    id: Types.ObjectId,
    data: Partial<TFollowUp>,
  ): Promise<FollowUpDocument> {
    return this.FollowUpModel.findByIdAndUpdate(id, data, { new: true });
  }

  hardDeleteById(id: Types.ObjectId): Promise<any> {
    return this.FollowUpModel.findByIdAndDelete(id);
  }

  softDeleteById(id: Types.ObjectId): Promise<any> {
    return this.FollowUpModel.findByIdAndUpdate(id, { is_deleted: true });
  }
}
