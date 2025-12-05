import { Module } from '@nestjs/common';
import { EnquiryLogModule } from 'src/feature/enquiryLog/enquiryLog.module';

import { EnquiryModule } from '../../enquiry/enquiry.module';
import { AppRegistrationController } from './appRegistration.controller';
import { AppRegistrationService } from './appRegistration.service';

@Module({
  imports: [EnquiryModule, EnquiryLogModule],
  controllers: [AppRegistrationController],
  providers: [AppRegistrationService],
  exports: [AppRegistrationService],
})
export class AppRegistrationModule {}
