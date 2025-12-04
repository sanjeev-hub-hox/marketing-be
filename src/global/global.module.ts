import { Global, Module } from '@nestjs/common';
import { AxiosService } from 'src/global/service/axios.service';

import { LoggerService, MdmService, ResponseService } from '../utils';
import { EmailService } from './global.email.service';
import { NotificationService } from './notification.service';

@Global()
@Module({
  controllers: [],
  providers: [
    LoggerService,
    ResponseService,
    MdmService,
    AxiosService,
    EmailService,
    NotificationService
  ],
  exports: [
    LoggerService,
    ResponseService,
    MdmService,
    AxiosService,
    EmailService,
    NotificationService
  ],
})
export class GlobalModule {}
