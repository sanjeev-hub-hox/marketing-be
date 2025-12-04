import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JobShadulerSchema, JobShadulerModel, JobShadulerDocument } from './jobShaduler.schema';
import { JobShadulerDto } from './jobShaduler.type';

@Injectable()
export class JobShadulerRepository {
  constructor(
    @InjectModel(JobShadulerSchema.name)
    private jobShadulerModel: JobShadulerModel,
  ) {}

  async create(logData: JobShadulerDto): Promise<JobShadulerDocument> {
    return this.jobShadulerModel.create(logData);
  }

  async getByJobId(jobId: string): Promise<JobShadulerDocument[]> {
    return this.jobShadulerModel.find({ jobId }).exec();
  }

  // If you want to get a single document
  async getOneByJobId(jobId: string): Promise<JobShadulerDocument | null> {
    return this.jobShadulerModel.findOne({ jobId }).exec();
  }

  async updateByJobId(jobId: string, logData: JobShadulerDto): Promise<JobShadulerDocument> {
    return this.jobShadulerModel.findOneAndUpdate({ jobId }, logData, { new: true }).exec();
  }

  async deleteByJobId(jobId: string): Promise<JobShadulerDocument | null> {
    return this.jobShadulerModel.findOneAndDelete({ jobId }).exec();
  }
}