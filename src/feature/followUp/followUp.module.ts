import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EnquiryModule } from '../enquiry/enquiry.module';
import { EnquiryLogModule } from '../enquiryLog/enquiryLog.module';
import { MyTaskModule } from '../myTask/myTask.module';
import { FollowUpController } from './followUp.controller';
import { FollowUpRepository } from './followUp.repository';
import { FollowUpService } from './followUp.service';
import { FollowUpSchema } from './schema/folllowUp.schema';
import { followUpTypesSchema } from './schema/followUpType.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'followUpTypes', schema: followUpTypesSchema },
      { name: 'followUps', schema: FollowUpSchema },
    ]),
    EnquiryLogModule,
    EnquiryModule,
    MyTaskModule,
  ],
  providers: [FollowUpService, FollowUpRepository],
  controllers: [FollowUpController],
  exports: [FollowUpService, FollowUpRepository],
})
export class FollowUpModule {}
