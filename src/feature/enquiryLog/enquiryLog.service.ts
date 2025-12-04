import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { LoggerService } from '../../utils';
import { EnquiryLogRepository } from './enquiryLog.repository';
import { EnquiryLogDocument } from './enquiryLog.schema';
import { TEnquiryLog } from './enquiryLog.type';

@Injectable()
export class EnquiryLogService {
  constructor(
    private enquiryLogRepository: EnquiryLogRepository,
    private loggerService: LoggerService,
  ) {}

  async createLog(logData: TEnquiryLog): Promise<EnquiryLogDocument> {
    const log = await this.enquiryLogRepository.create(logData);
    this.loggerService.log(`Log created: ${log}`);
    return log;
  }

  async getEnquiryLogsByEnquiryId(
    enquiryId: string,
    sortOrder?: 'asc' | 'desc',
    filters?: { eventType?: string; eventSubType?: string },
  ): Promise<EnquiryLogDocument[]> {
    const pipeline: any = [
      {
        $match: {
          enquiry_id: new Types.ObjectId(enquiryId),
        },
      },
      {
        $project: {
          enquiry_id: 1,
          event_type: 1,
          event_sub_type: 1,
          event: 1,
          created_at: 1,
          log_data: 1,
          created_by: 1,
        },
      },
    ];

    if (filters && filters?.eventType) {
      pipeline[0]['$match'].event_type = filters.eventType;
    }
    if (filters && filters?.eventSubType) {
      pipeline[0]['$match'].event = filters.eventSubType;
    }
    if (sortOrder) {
      pipeline.push({
        $sort: {
          created_at: sortOrder === 'desc' ? -1 : 1,
        },
      });
    }
    const timeline = await this.enquiryLogRepository.aggregate(pipeline);
    return timeline;
  }

  async updateLog(
    logId: string,
    logData: TEnquiryLog,
  ): Promise<EnquiryLogDocument> {
    const log = await this.enquiryLogRepository.updateById(
      new Types.ObjectId(logId),
      logData,
    );
    this.loggerService.log(`Log updated: ${log}`);
    return log;
  }

  async deleteLog(logId: string): Promise<EnquiryLogDocument> {
    const log = await this.enquiryLogRepository.hardDeleteById(
      new Types.ObjectId(logId),
    );
    this.loggerService.log(`Log deleted: ${log}`);
    return log;
  }
}
