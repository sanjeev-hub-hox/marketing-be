import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../utils';
import { ParentLoginLogRepository } from './parentLoginLogs.repository';
import { ParentLoginLogDocument } from './parentLoginLogs.schema';
import { ParentActionLogs } from './parentLoginLogs.type';

@Injectable()
export class ParentLoginLogService {
  constructor(
    private parentLoginLogRepository: ParentLoginLogRepository,
  ) {}

  async createLog(logData: ParentActionLogs): Promise<ParentLoginLogDocument> {
    const log = await this.parentLoginLogRepository.create(logData);
    return log;
  }
}