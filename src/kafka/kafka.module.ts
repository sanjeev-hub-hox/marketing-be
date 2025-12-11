// import { Module, forwardRef } from '@nestjs/common';
// import { KafkaProducerService } from './kafka-producer.service';
// import { KafkaConsumerService } from './kafka-consumer.service';
// import { GlobalModule } from '../global/global.module';
// import { ReferralReminderModule } from '../feature/referralReminder/referralReminder.module';

// @Module({
//   imports: [GlobalModule, forwardRef(() => ReferralReminderModule)],
//   providers: [KafkaProducerService, KafkaConsumerService],
//   exports: [KafkaProducerService, KafkaConsumerService],
// })
// export class KafkaModule {}