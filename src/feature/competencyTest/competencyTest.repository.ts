import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import {
  TCompetencyTestDocument,
  TCompetencyTestModel,
} from './competencyTest.schema';

@Injectable()
export class CompetencyTestRepository {
  constructor(
    @InjectModel('competencyTest')
    private competencyTestModel: TCompetencyTestModel,
  ) {}

  create(data: any): Promise<TCompetencyTestDocument> {
    return this.competencyTestModel.create(data);
  }

  getOne(filter: Record<string, any>, project?: Record<string, number>) {
    if (project) {
      return this.competencyTestModel
        .findOne(filter, project)
        .sort({ created_at: -1 })
        .lean();
    }
    return this.competencyTestModel
      .findOne(filter)
      .sort({ created_at: -1 })
      .lean();
  }

  getById(id: Types.ObjectId) {
    return this.competencyTestModel.findById(id).lean();
  }

  getMany(filter: Record<string, any>) {
    return this.competencyTestModel.find(filter).lean();
  }

  aggregate(pipeline: any[]) {
    return this.competencyTestModel.aggregate(pipeline);
  }

  updateById(
    id: Types.ObjectId,
    data: Partial<any>,
  ): Promise<TCompetencyTestDocument> {
    return this.competencyTestModel.findByIdAndUpdate(id, data, { new: true });
  }

  hardDeleteById(id: Types.ObjectId): Promise<any> {
    return this.competencyTestModel.findByIdAndDelete(id);
  }

  softDeleteById(id: Types.ObjectId): Promise<any> {
    return this.competencyTestModel.findByIdAndUpdate(id, { is_deleted: true });
  }
}
