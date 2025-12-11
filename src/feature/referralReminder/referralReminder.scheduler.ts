import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Types } from 'mongoose'; // ✅ Add this import
import { ReminderRepository } from './referralReminder.repository';
import { NotificationService } from '../../global/notification.service';
import { ReminderStatus } from './referralReminder.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReferralReminderScheduler {
  private readonly logger = new Logger(ReferralReminderScheduler.name);

  constructor(
    private readonly reminderRepository: ReminderRepository,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

  // Run every minute to check for due reminders
  @Cron(CronExpression.EVERY_MINUTE)
  async processDueReminders() {
    try {
      const now = new Date();
      
      // Find all pending reminders that are due
      const dueReminders = await this.reminderRepository.find({
        status: ReminderStatus.PENDING,
        next_scheduled_at: { $lte: now },
        is_verified: false,
      });

      this.logger.log(`[REMINDER POLL] 🔍 Found ${dueReminders.length} due reminders`);

      for (const reminder of dueReminders) {
        try {
          // Check if max reminders reached
          if (reminder.reminder_count >= reminder.max_reminders) {
            await this.reminderRepository.updateById(
              new Types.ObjectId(reminder._id), // ✅ Cast to ObjectId
              {
                status: ReminderStatus.COMPLETED,
              }
            );
            this.logger.log(
              `[REMINDER] ✅ Completed reminder ${reminder._id} - max count reached`
            );
            continue;
          }

          // Send the reminder
          await this.sendReminder(reminder);

          // Calculate next schedule (3 minutes for testing, adjust based on config)
          const nextSchedule = new Date(now.getTime() + 3 * 60 * 1000); // 3 minutes

          // Update reminder record
          await this.reminderRepository.updateById(
            new Types.ObjectId(reminder._id), // ✅ Cast to ObjectId
            {
              reminder_count: reminder.reminder_count + 1,
              last_sent_at: now,
              next_scheduled_at: nextSchedule,
              $push: { sent_timestamps: now },
            }
          );

          this.logger.log(
            `[REMINDER] ✅ Sent reminder ${reminder.reminder_count + 1}/${reminder.max_reminders} for enquiry ${reminder.enquiry_number}`
          );
        } catch (error) {
          this.logger.error(
            `[REMINDER] ❌ Error processing reminder ${reminder._id}: ${error.message}`,
            error.stack
          );

          // Log error but continue processing other reminders
          await this.reminderRepository.updateById(
            new Types.ObjectId(reminder._id), // ✅ Cast to ObjectId
            {
              $push: { error_logs: `${new Date().toISOString()}: ${error.message}` },
            }
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `[REMINDER POLL] ❌ Error in scheduler: ${error.message}`,
        error.stack
      );
    }
  }

  private async sendReminder(reminder: any) {
    try {
      const baseUrl = this.configService.get<string>('MARKETING_BASE_URL');
      
      // Get token (you might need to adjust this based on your auth flow)
      const token = ''; // If needed for notification service
      const platform = 'web';

      await this.notificationService.sendNotification(
        {
          slug: 'Marketing related-Others-Email-Wed Dec 03 2025 14:36:19 GMT+0000 (Coordinated Universal Time)',
          employee_ids: [],
          global_ids: [],
          mail_to: [reminder.recipient_email],
          sms_to: [reminder.recipient_phone.toString().slice(-10)],
          param: {
            recipientType: reminder.recipient_type === 'parent' ? 'Parent' : 'Referrer',
            recipientName: reminder.recipient_name,
            referrerName: reminder.referral_details?.referrer_name || reminder.recipient_name,
            verificationUrl: reminder.referral_details?.verification_url,
            studentName: reminder.referral_details?.referred_name || '',
            enquiryId: reminder.enquiry_number,
            reminderCount: String(reminder.reminder_count + 1),
          },
        },
        token,
        platform
      );

      this.logger.log(
        `[REMINDER] 📧 Reminder sent to ${reminder.recipient_type}: ${reminder.recipient_email}`
      );
    } catch (error) {
      this.logger.error(
        `[REMINDER] ❌ Failed to send reminder: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}