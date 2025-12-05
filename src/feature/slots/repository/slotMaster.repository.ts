import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { SlotMaster, TSlotMasterDocument, TSlotMasterModel } from '../schema';

@Injectable()
export class SlotMasterRepository {
  constructor(
    @InjectModel(SlotMaster.name) private slotMasterModel: TSlotMasterModel,
  ) {}

  create(data: any): Promise<TSlotMasterDocument> {
    return this.slotMasterModel.create(data);
  }

  createMany(data: any[]) {
    return this.slotMasterModel.insertMany(data);
  }

  getById(id: Types.ObjectId) {
    return this.slotMasterModel.findById(id).lean();
  }

  getOne(filter: Record<string, any>, project?: Record<string, number>) {
    if (project) {
      return this.slotMasterModel.findOne(filter, project);
    }
    return this.slotMasterModel.findOne(filter);
  }

  getMany(filter: Record<string, any>): Promise<TSlotMasterDocument[]> {
    return this.slotMasterModel.find(filter);
  }

  aggregate(pipeline: any[]) {
    return this.slotMasterModel.aggregate(pipeline);
  }

  updateById(id: Types.ObjectId, data: any): Promise<any> {
    return this.slotMasterModel.findByIdAndUpdate(id, data, { new: true });
  }

  hardDeleteById(id: Types.ObjectId): Promise<any> {
    return this.slotMasterModel.findByIdAndDelete(id);
  }

  softDeleteById(id: Types.ObjectId): Promise<any> {
    return this.slotMasterModel.findByIdAndUpdate(id, { is_deleted: true });
  }
}
