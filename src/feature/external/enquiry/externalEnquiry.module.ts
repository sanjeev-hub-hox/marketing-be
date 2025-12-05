import { Module } from '@nestjs/common';

import { EnquiryModule } from '../../enquiry/enquiry.module';
import { EnquiryTypeModule } from '../../enquiryType/enquiryType.module';
import { MyTaskModule } from '../../myTask/myTask.module';
import { ExternalEnquiryTypeModule } from '../enquiryType/externalEnquiryType.module';
import { ExternalEnquiryController } from './externalEnquiry.controller';
import { ExternalEnquiryService } from './externalEnquiry.service';

@Module({
  imports: [
    EnquiryModule,
    EnquiryTypeModule,
    ExternalEnquiryTypeModule,
    MyTaskModule,
  ],
  controllers: [ExternalEnquiryController],
  providers: [ExternalEnquiryService],
  exports: [ExternalEnquiryService],
})
export class ExternalEnquiryModule {}
