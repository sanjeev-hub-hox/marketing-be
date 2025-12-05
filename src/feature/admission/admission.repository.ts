import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import {
  Admission,
  AdmissionDocument,
  AdmissionModel,
} from './admission.schema';

@Injectable()
export class AdmissionRepository {
  constructor(
    @InjectModel(Admission.name.toLowerCase())
    private admissionModel: AdmissionModel,
  ) {}

  create(data: any): Promise<AdmissionDocument> {
    return this.admissionModel.create(data);
  }

  getById(id: Types.ObjectId): Promise<Record<string, any> | null> {
    return this.admissionModel.findById(id).lean();
  }

  getOne(
    filter: Record<string, any>,
    project: Record<string, number> = {},
  ): Promise<Record<string, any> | null> {
    if (project) {
      return this.admissionModel.findOne(filter, project).lean();
    }
    return this.admissionModel.findOne(filter).lean();
  }

  getMany(filter: Record<string, any>): Promise<AdmissionDocument[]> {
    return this.admissionModel.find(filter);
  }

  aggregate(pipeline: any[]) {
    return this.admissionModel.aggregate(pipeline);
  }

  updateById(id: Types.ObjectId, data: any): Promise<any> {
    return this.admissionModel.findByIdAndUpdate(id, data, { new: true });
  }

  updateByEnquiryId(enquiryId: Types.ObjectId, data: any): Promise<any> {
    return this.admissionModel.findOneAndUpdate(
      { enquiry_id: enquiryId },
      data,
      { new: true },
    );
  }

  getByEnquiryId(enquiryId: Types.ObjectId): Promise<AdmissionDocument> {
    return this.admissionModel.findOne({ enquiry_id: enquiryId });
  }

  hardDeleteById(id: Types.ObjectId): Promise<any> {
    return this.admissionModel.findByIdAndDelete(id);
  }

  softDeleteById(id: Types.ObjectId): Promise<any> {
    return this.admissionModel.findByIdAndUpdate(id, { is_deleted: true });
  }
}
