import { Injectable } from '@nestjs/common';
import { JobShadulerDto } from './jobShaduler.type';
import { JobShadulerDocument } from './jobShaduler.schema';
import { JobShadulerRepository } from './jobShaduler.repository';

@Injectable()
export class JobShadulerService {
  constructor(
    private jobShadulerRepository: JobShadulerRepository,
  ) {}

  async createLog(logData: JobShadulerDto): Promise<JobShadulerDocument> {
    const log = await this.jobShadulerRepository.create(logData);
    return log;
  }

  async getByJobId(jobId: string): Promise<JobShadulerDocument[]> {
    return this.jobShadulerRepository.getByJobId(jobId);
  }

  async getOneByJobId(jobId: string): Promise<JobShadulerDocument | null> {
    return this.jobShadulerRepository.getOneByJobId(jobId);
  }

  async updateJob(jobId: string, logData: JobShadulerDto): Promise<JobShadulerDocument> {
    return this.jobShadulerRepository.updateByJobId(jobId, logData);
  }

  async deleteJob(jobId: string): Promise<JobShadulerDocument | null> {
    return this.jobShadulerRepository.deleteByJobId(jobId);
  }
}