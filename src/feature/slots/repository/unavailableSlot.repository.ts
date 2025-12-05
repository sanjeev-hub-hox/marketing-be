import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import {
  TUnavailableSlotsDocument,
  TUnavailableSlotsModel,
  UnavailableSlot,
} from '../schema';

@Injectable()
export class UnavailableSlotsRepository {
  constructor(
    @InjectModel(UnavailableSlot.name)
    private unavailableSlotsModel: TUnavailableSlotsModel,
  ) {}

  create(data: any): Promise<TUnavailableSlotsDocument> {
    return this.unavailableSlotsModel.create(data);
  }

  getById(id: Types.ObjectId) {
    return this.unavailableSlotsModel.findById(id).lean();
  }

  getOne(filter: Record<string, any>, project?: Record<string, number>) {
    if (project) {
      return this.unavailableSlotsModel.findOne(filter, project);
    }
    return this.unavailableSlotsModel.findOne(filter);
  }

  getMany(filter: Record<string, any>): Promise<TUnavailableSlotsDocument[]> {
    return this.unavailableSlotsModel.find(filter);
  }

  aggregate(pipeline: any[]) {
    return this.unavailableSlotsModel.aggregate(pipeline);
  }

  updateById(id: Types.ObjectId, data: any): Promise<any> {
    return this.unavailableSlotsModel.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  hardDeleteById(id: Types.ObjectId): Promise<any> {
    return this.unavailableSlotsModel.findByIdAndDelete(id);
  }

  softDeleteById(id: Types.ObjectId): Promise<any> {
    return this.unavailableSlotsModel.findByIdAndUpdate(id, {
      is_deleted: true,
    });
  }
}
