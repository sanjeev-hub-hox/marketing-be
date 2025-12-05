import { Module } from '@nestjs/common';

import { EnquiryModule } from '../enquiry/enquiry.module';
import { EnquiryStageModule } from '../enquiryStage/enquiryStage.module';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';

@Module({
  imports: [EnquiryModule, EnquiryStageModule],
  controllers: [RegistrationController],
  providers: [RegistrationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
