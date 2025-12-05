import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { BookedSlot, TBookedSlotDocument, TBookedSlotModel } from '../schema';

@Injectable()
export class BookedSlotRepository {
  constructor(
    @InjectModel(BookedSlot.name) private bookedSlotModel: TBookedSlotModel,
  ) {}

  create(data: any): Promise<TBookedSlotDocument> {
    return this.bookedSlotModel.create(data);
  }

  getById(id: Types.ObjectId) {
    return this.bookedSlotModel.findById(id).lean();
  }

  getOne(filter: Record<string, any>, project?: Record<string, number>) {
    if (project) {
      return this.bookedSlotModel.findOne(filter, project);
    }
    return this.bookedSlotModel.findOne(filter);
  }

  getMany(filter: Record<string, any>): Promise<TBookedSlotDocument[]> {
    return this.bookedSlotModel.find(filter);
  }

  aggregate(pipeline: any[]) {
    return this.bookedSlotModel.aggregate(pipeline);
  }

  updateById(id: Types.ObjectId, data: any): Promise<any> {
    return this.bookedSlotModel.findByIdAndUpdate(id, data, { new: true });
  }

  hardDeleteById(id: Types.ObjectId): Promise<any> {
    return this.bookedSlotModel.findByIdAndDelete(id);
  }

  softDeleteById(id: Types.ObjectId): Promise<any> {
    return this.bookedSlotModel.findByIdAndUpdate(id, { is_deleted: true });
  }
}
