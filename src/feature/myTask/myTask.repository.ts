import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { TMyTaskDocument, TMyTaskModel } from './myTask.schema';

@Injectable()
export class MyTaskRepository {
  constructor(@InjectModel('myTask') private myTaskModel: TMyTaskModel) {}

  create(data: any): Promise<TMyTaskDocument> {
    return this.myTaskModel.create(data);
  }

  getById(id: Types.ObjectId): Promise<Record<string, any> | null> {
    return this.myTaskModel.findById(id).lean();
  }

  getOne(
    filter: Record<string, any>,
    project: Record<string, number> = {},
  ): Promise<Record<string, any> | null> {
    if (project) {
      return this.myTaskModel.findOne(filter, project).lean();
    }
    return this.myTaskModel.findOne(filter).lean();
  }

  getMany(
    filter: Record<string, any>,
    project: Record<string, number> = {},
  ): Promise<Record<string, any>[]> {
    if (project) {
      return this.myTaskModel.find(filter, project).lean();
    }
    return this.myTaskModel.find(filter).lean();
  }

  aggregate(pipeline: any[]) {
    return this.myTaskModel.aggregate(pipeline);
  }

  updateOne(
    filter: Record<string, any>,
    updatedData: any,
    options: Record<string, any> = {},
  ) {
    return this.myTaskModel.updateOne(filter, updatedData, options);
  }

  updateById(id: Types.ObjectId, data: any): Promise<any> {
    return this.myTaskModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  updateMany(filter: Record<string, any>, updatedData: any) {
    return this.myTaskModel.updateMany(filter, updatedData).lean();
  }

  hardDeleteById(id: Types.ObjectId): Promise<any> {
    return this.myTaskModel.findByIdAndDelete(id);
  }

  softDeleteById(id: Types.ObjectId): Promise<any> {
    return this.myTaskModel.findByIdAndUpdate(id, { is_deleted: true });
  }
}
