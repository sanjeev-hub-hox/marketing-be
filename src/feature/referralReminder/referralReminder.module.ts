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
import { SmsReminderService } from './smsReminder.service';
import { ReferralReminderCronService } from '../cron/referralReminderCron.service'; 
import { ShortUrlModule } from '../shortUrl/shorturl.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'referralReminder', schema: SendReminderSchema }
    ]),
    ScheduleModule.forRoot(),
    forwardRef(() => EnquiryModule),
    GlobalModule,
    ShortUrlModule
  ],
  providers: [
    ReferralReminderService,
    ReminderRepository,
    // KafkaProducerService,
    VerificationTrackerService,
    ReferralReminderScheduler,
    SmsReminderService,
    ReferralReminderCronService 
  ],
  exports: [ReferralReminderService, ReminderRepository, SmsReminderService, VerificationTrackerService],
})
export class ReferralReminderModule {}