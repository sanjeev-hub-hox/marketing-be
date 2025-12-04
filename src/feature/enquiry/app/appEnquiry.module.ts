import { Module } from '@nestjs/common';
import { AdmissionModule } from 'src/feature/admission/admission.module';
import { EnquiryLogModule } from 'src/feature/enquiryLog/enquiryLog.module';

import { EnquiryModule } from '../enquiry.module';
import { AppEnquiryController } from './appEnquiry.controller';
import { AppEnquiryService } from './appEnquiry.service';

@Module({
  imports: [EnquiryModule, EnquiryLogModule, AdmissionModule],
  controllers: [AppEnquiryController],
  providers: [AppEnquiryService],
  exports: [AppEnquiryService],
})
export class AppEnquiryModule {}
