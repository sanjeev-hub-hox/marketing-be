import { Module, forwardRef  } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ReferralReminderService } from './referralReminder.service';
import { ReminderRepository } from './referralReminder.repository';
import { SendReminderSchema } from './referralReminder.schema';
// import { KafkaProducerService } from '../../kafka/kafka-producer.service';
import { EnquiryModule } from '../enquiry/enquiry.module';
import { GlobalModule } from '../../global/global.module';
import { VerificationTrackerService } from './verificationTracker.service';
import { ReferralReminderScheduler } from './referralReminder.scheduler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'referralReminder', schema: SendReminderSchema }
    ]),
    ScheduleModule.forRoot(),
    forwardRef(() => EnquiryModule),
    GlobalModule,
  ],
  providers: [
    ReferralReminderService,
    ReminderRepository,
    // KafkaProducerService,
    VerificationTrackerService,
    ReferralReminderScheduler,
  ],
  exports: [ReferralReminderService, ReminderRepository, VerificationTrackerService],
})
export class ReferralReminderModule {}