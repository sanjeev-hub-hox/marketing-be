import { Module } from '@nestjs/common';

import { EnquiryStageModule } from '../../enquiryStage/enquiryStage.module';
import { EnquiryTypeModule } from '../../enquiryType/enquiryType.module';
import { ExternalEnquiryTypeService } from './externalEnquiryType.service.';

@Module({
  imports: [EnquiryTypeModule, EnquiryStageModule],
  controllers: [],
  providers: [ExternalEnquiryTypeService],
  exports: [ExternalEnquiryTypeService],
})
export class ExternalEnquiryTypeModule {}
