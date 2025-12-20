// In your cron service or scheduler

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SmsReminderService } from '../referralReminder/smsReminder.service';
import { ReferralReminderService } from '../referralReminder/referralReminder.service';
import { EnquiryRepository } from '../enquiry/enquiry.repository';

@Injectable()
export class ReferralReminderCronService {
  private readonly logger = new Logger(ReferralReminderCronService.name);

  constructor(
    private readonly smsReminderService: SmsReminderService,
    private readonly emailReminderService: ReferralReminderService,
    private readonly enquiryRepository: EnquiryRepository,
  ) {}

  /**
   * Run every 3 hours to send reminders
   */
  @Cron('0 */3 * * *') // Every 3 hours
  async sendReferralReminders() {
    this.logger.log('🔄 Starting referral reminder cron job...');
    
    try {
      // Find all enquiries that need reminders
      const enquiries = await this.enquiryRepository.getMany({
        'other_details.referralStatus': { $ne: true },
        status: 'Open',
        'enquiry_stages': {
          $elemMatch: {
            stage_name: 'Admitted or Provisional Approval',
            status: { $in: ['Provisional Admission', 'Admitted'] }
          }
        }
      });

      this.logger.log(`Found ${enquiries.length} enquiries needing reminders`);

      for (const enquiry of enquiries) {
        // Send EMAIL reminders
        // await this.emailReminderService.sendInitialNotificationAndScheduleReminders(enquiry);
        
        // Send SMS reminders
        await this.smsReminderService.scheduleReminders(enquiry);
      }

      this.logger.log('✅ Referral reminder cron job completed');
    } catch (error) {
      this.logger.error(`❌ Error in referral reminder cron: ${error.message}`, error.stack);
    }
  }
}