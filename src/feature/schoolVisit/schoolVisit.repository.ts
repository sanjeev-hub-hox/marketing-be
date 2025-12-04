import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { SchoolVisitDocument, schoolVisitModel } from './schoolVisit.schema';

@Injectable()
export class SchoolVisitRepository {
  constructor(
    @InjectModel('schoolVisits')
    private SchoolVisitModel: schoolVisitModel,
  ) {}

  create(data: any): Promise<SchoolVisitDocument> {
    return this.SchoolVisitModel.create(data);
  }

  getOne(filter: Record<string, any>, project?: Record<string, number>) {
    if (project) {
      return this.SchoolVisitModel.findOne(filter, project)
        .sort({ created_at: -1 })
        .lean();
    }
    return this.SchoolVisitModel.findOne(filter)
      .sort({ created_at: -1 })
      .lean();
  }

  getById(id: Types.ObjectId): Promise<SchoolVisitDocument> {
    return this.SchoolVisitModel.findById(id);
  }

  getMany(filter: Record<string, any>): Promise<SchoolVisitDocument[]> {
    return this.SchoolVisitModel.find(filter);
  }

  aggregate(pipeline: any[]) {
    return this.SchoolVisitModel.aggregate(pipeline);
  }

  updateById(
    id: Types.ObjectId,
    data: Partial<any>,
  ): Promise<SchoolVisitDocument> {
    return this.SchoolVisitModel.findByIdAndUpdate(id, data, { new: true });
  }

  hardDeleteById(id: Types.ObjectId): Promise<any> {
    return this.SchoolVisitModel.findByIdAndDelete(id);
  }

  softDeleteById(id: Types.ObjectId): Promise<any> {
    return this.SchoolVisitModel.findByIdAndUpdate(id, { is_deleted: true });
  }
}
