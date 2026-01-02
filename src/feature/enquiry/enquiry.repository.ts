import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SortOrder, Types } from 'mongoose';

import { EnquiryDocument, EnquiryModel } from './enquiry.schema';

@Injectable()
export class EnquiryRepository {
  constructor(@InjectModel('enquiry') private enquiryModel: EnquiryModel) {}

  getSchemaPaths() {
    const schema = this.enquiryModel.schema.obj;
    return Object.keys(schema);
  }

  create(data: any): Promise<EnquiryDocument> {
    return this.enquiryModel.create(data);
  }

  getById(id: Types.ObjectId): Promise<Record<string, any> | null> {
    return this.enquiryModel.findById(id).lean();
  }

  getByEnquiryNumber(
    enquiryNumber: string,
  ): Promise<Record<string, any> | null> {
    return this.enquiryModel.findOne({ enquiry_number: enquiryNumber }).lean();
  }

  getOne(
    filter: Record<string, any>,
    project: Record<string, number> = {},
  ): Promise<Record<string, any> | null> {
    if (project) {
      return this.enquiryModel.findOne(filter, project).lean();
    }
    return this.enquiryModel.findOne(filter).lean();
  }

  getMany(
    filter: Record<string, any>,
    project: Record<string, number> = {},
  ): Promise<Record<string, any>[]> {
    if (project) {
      return this.enquiryModel.find(filter, project).lean();
    }
    return this.enquiryModel.find(filter).lean();
  }
  


getManyL(
  filter: Record<string, any>,
  project: Record<string, number> = {},
  options: { limit?: number; skip?: number; sort?: Record<string, SortOrder> } = {}
): Promise<Record<string, any>[]> {
  let query = this.enquiryModel.find(filter, project).lean();

  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  if (options.sort) {
    // coerce object type to Mongoose compatible type
    query = query.sort(options.sort as { [key: string]: SortOrder });
  }

  return query;
}

  getManyPaginated(
    filter: Record<string, any>,
    project: Record<string, number> = {},
    options: { limit?: number; skip?: number; sort?: Record<string, SortOrder> } = {}
  ): Promise<Record<string, any>[]> {
    let query = this.enquiryModel.find(filter, project).lean();

    if (options.skip) query = query.skip(options.skip);
    if (options.limit) query = query.limit(options.limit);
    if (options.sort) {
      query = query.sort(options.sort as { [key: string]: SortOrder });
    }

    return query.exec();
  }



  getManyWithId(
    filter: Record<string, any>,
    project: Record<string, number> = {},
  ): Promise<Record<string, any>[]> {
    if (project) {
      return this.enquiryModel.find(filter, project);
    }
    return this.enquiryModel.find(filter);
  }

  aggregate(pipeline: any[]) {
    return this.enquiryModel.aggregate(pipeline);
  }

  updateOne(
    filter: Record<string, any>,
    updatedData: any,
    options: Record<string, any> = {},
  ) {
    return this.enquiryModel.updateOne(filter, updatedData, options);
  }

  updateById(id: Types.ObjectId, data: any): Promise<any> {
    return this.enquiryModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  hardDeleteById(id: Types.ObjectId): Promise<any> {
    return this.enquiryModel.findByIdAndDelete(id);
  }

  softDeleteById(id: Types.ObjectId): Promise<any> {
    return this.enquiryModel.findByIdAndUpdate(id, { is_deleted: true });
  }

  getCount(filter: Record<string, any>): Promise<number> {
    return this.enquiryModel.countDocuments(filter);
  }
}
