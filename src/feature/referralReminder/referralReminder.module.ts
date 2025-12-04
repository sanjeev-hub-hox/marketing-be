import { Module, forwardRef  } from '@nestjs/common';
import { ReferralReminderService } from './referralReminder.service';
import { KafkaProducerService } from '../../kafka/kafka-producer.service';
import { EnquiryModule } from '../enquiry/enquiry.module';

@Module({
  imports: [forwardRef(() => EnquiryModule)],
  providers: [
    ReferralReminderService,
    KafkaProducerService,
  ],
  exports: [ReferralReminderService],
})
export class ReferralReminderModule {}