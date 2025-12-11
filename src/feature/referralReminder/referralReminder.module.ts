import { Module, forwardRef  } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReferralReminderService } from './referralReminder.service';
import { ReminderRepository } from './referralReminder.repository';
import { SendReminderSchema } from './referralReminder.schema';
// import { KafkaProducerService } from '../../kafka/kafka-producer.service';
import { EnquiryModule } from '../enquiry/enquiry.module';
import { GlobalModule } from '../../global/global.module';
import { VerificationTrackerService } from './verificationTracker.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'referralReminder', schema: SendReminderSchema }
    ]),
    forwardRef(() => EnquiryModule),
    GlobalModule,
  ],
  providers: [
    ReferralReminderService,
    ReminderRepository,
    // KafkaProducerService,
    VerificationTrackerService
  ],
  exports: [ReferralReminderService, ReminderRepository, VerificationTrackerService],
})
export class ReferralReminderModule {}