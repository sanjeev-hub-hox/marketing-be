import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReferralReminderService } from './referralReminder.service';
import { ReferralReminderController } from './referralReminder.controller';
import { ReminderRepository } from './referralReminder.repository';
import { ReferralReminderSchema } from './referralReminder.schema';
import { KafkaProducerService } from '../../kafka/kafka-producer.service';
import { EnquiryModule } from '../enquiry/enquiry.module';
import { GlobalModule } from '../../global/global.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'referralReminder', schema: ReferralReminderSchema }
    ]),
    forwardRef(() => EnquiryModule),
    GlobalModule,
  ],
  controllers: [ReferralReminderController],
  providers: [
    ReferralReminderService,
    ReminderRepository,
    KafkaProducerService,
  ],
  exports: [ReferralReminderService, ReminderRepository],
})
export class ReferralReminderModule {}