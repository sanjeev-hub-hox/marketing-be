import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { LoggerService } from '../../utils';
import { NotificationService } from '../../global/notification.service';
// import { KafkaProducerService } from '../../kafka/kafka-producer.service';
import { VerificationTrackerService } from './verificationTracker.service';
import { referralReminderConfig } from '../../config/referral-reminder.config';
import { 
  ReminderMessage, 
  VerificationMessage, 
  RecipientInfo,
  VerificationStatus 
} from './referralReminder.types';
import { ReminderRepository } from './referralReminder.repository';
import { ReminderStatus } from './referralReminder.schema';
import { ReminderRecipientType } from './referralReminder.schema';

@Injectable()
export class ReferralReminderService {
  constructor(
    // private readonly kafkaProducer: KafkaProducerService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
    private readonly verificationTracker: VerificationTrackerService,
    private readonly reminderRepository: ReminderRepository,
  ) {}

  private calculateNextSchedule(startDate: Date, hoursToAdd: number): Date {
    const nextDate = new Date(startDate);
    nextDate.setHours(nextDate.getHours() + hoursToAdd);
    return nextDate;
  }

  async sendInitialNotificationAndScheduleReminders(
    enquiryData: any,
    token: string,
    platform: string,
  ): Promise<void> {
    try {
      const baseUrl = this.configService.get<string>('MARKETING_BASE_URL');
      const recipients = this.getAllRecipients(enquiryData, baseUrl);
      const config = referralReminderConfig;

      // this.loggerService.log(`[REFERRAL] 📧 Sending initial notifications to ${recipients.length} recipients`);

      // Send initial notifications
      for (const recipient of recipients) {
        await this.sendNotification(recipient, enquiryData, token, platform);
      }

      // this.loggerService.log(`[REFERRAL] ✅ Initial notifications sent`);

      // Calculate reminder schedule
      const maxReminders = config.frequency * config.duration;
      const hoursInterval = 24 / config.frequency;
      const startDate = new Date();

      // 🔥 CREATE REMINDER RECORDS IN DATABASE
      for (const recipient of recipients) {
        // this.loggerService.log(
        //   `[REFERRAL] 💾 Creating reminder record for ${recipient.type}: ${recipient.email}`
        // );

        // Calculate first reminder schedule (after initial notification)
        const firstReminderDate = this.calculateNextSchedule(startDate, hoursInterval);

        try {
          // ✅ THIS IS WHERE WE STORE IN DATABASE
          await this.reminderRepository.create({
            enquiry_id: new Types.ObjectId(enquiryData._id),
            enquiry_number: enquiryData.enquiry_number,
            recipient_type: recipient.type,
            recipient_email: recipient.email,
            recipient_phone: recipient.phone,
            recipient_name: recipient.name,
            referral_details: {
              verification_url: recipient.verificationUrl,
              referrer_name: recipient.referrerName || recipient.name,
              referred_name: recipient.referredName || '',
            },
            max_reminders: maxReminders,
            reminder_count: 0, // Initial count is 0
            status: ReminderStatus.PENDING,
            is_verified: false,
            next_scheduled_at: firstReminderDate,
            sent_timestamps: [],
            error_logs: [],
          });

          // this.loggerService.log(
          //   `[REFERRAL] ✅ Reminder record created for ${recipient.type}: ${recipient.email}`
          // );
        } catch (error) {
          this.loggerService.error(
            `[REFERRAL] ❌ Failed to create reminder record for ${recipient.email}: ${error.message}`,
            error.stack
          );
        }
      }

      this.loggerService.log(
        `[REFERRAL] ✅ All reminder records created for enquiry: ${enquiryData.enquiry_number}`,
      );
    } catch (error) {
      this.loggerService.error(
        `[REFERRAL] ❌ Error scheduling reminders: ${error.message}`,
        error.stack,
      );
    }
  }

  async handleVerification(
    enquiryId: string,
    recipientType,
  ): Promise<void> {
    try {
      this.verificationTracker.markAsVerified(enquiryId, recipientType);

      const verificationMessage: VerificationMessage = {
        enquiryId,
        verifiedBy: recipientType,
        verifiedAt: new Date().toISOString(),
      };

      // await this.kafkaProducer.sendMessage(
      //   referralReminderConfig.verificationTopic,
      //   verificationMessage
      // );

      this.loggerService.log(
        `[REFERRAL] ✅ Verification recorded for enquiry ${enquiryId} by ${recipientType}`,
      );
    } catch (error) {
      this.loggerService.error(
        `[REFERRAL] ❌ Error handling verification: ${error.message}`,
        error.stack,
      );
    }
  }

  getVerificationStatus(enquiryId: string): VerificationStatus {
    return this.verificationTracker.getVerificationStatus(enquiryId);
  }

  getAllRecipients(enquiryData: any, baseUrl: string): RecipientInfo[] {
    const recipients: RecipientInfo[] = [];
    const studentName = `${enquiryData.student_details.first_name} ${enquiryData.student_details.last_name}`;

    const parentType = enquiryData?.other_details?.parent_type || 'Father';
    const parentDetails = this.getParentDetails(enquiryData, parentType);

    if (parentDetails?.email && parentDetails?.mobile) {
      const parentUrl = `${baseUrl}/referral-view/?id=${enquiryData._id}&type=parent&action=referral`;
      recipients.push({
        type: ReminderRecipientType.PARENT, // ✅ Use enum
        email: parentDetails.email,
        phone: String(parentDetails.mobile), // ✅ Convert to string
        name: `${parentDetails.first_name} ${parentDetails.last_name}`,
        verificationUrl: parentUrl,
        referredName: studentName,
      });
    }

    const referrerRecipient = this.getReferrerRecipient(enquiryData, baseUrl);
    if (referrerRecipient) {
      recipients.push(referrerRecipient);
    }

    return recipients;
  }


  private async sendNotification(
    recipient: RecipientInfo,
    enquiryData: any,
    token: string,
    platform: string,
  ): Promise<void> {
    try {
      await this.notificationService.sendNotification(
        {
          slug: 'Marketing related-Others-Email-Wed Dec 03 2025 14:36:19 GMT+0000 (Coordinated Universal Time)',
          employee_ids: [],
          global_ids: [],
          mail_to: [recipient.email],
          sms_to: [recipient.phone.toString().slice(-10)],
          param: {
            recipientType: recipient.type === 'parent' ? 'Parent' : 'Referrer',
            recipientName: recipient.name,
            referrerName: recipient.referrerName || recipient.name,
            verificationUrl: recipient.verificationUrl,
            studentName: recipient.referredName || '',
            enquiryId: enquiryData.enquiry_number,
            reminderCount: '3',
          },
        },
        token,
        platform,
      );

      this.loggerService.log(
        `[REFERRAL] ✅ Notification sent to ${recipient.type}: ${recipient.email}`,
      );
    } catch (error) {
      this.loggerService.error(
        `[REFERRAL] ❌ Error sending notification to ${recipient.email}: ${error.message}`,
        error.stack,
      );
    }
  }

  private getReferrerRecipient(enquiryData: any, baseUrl: string): RecipientInfo | null {
    const studentName = `${enquiryData.student_details.first_name} ${enquiryData.student_details.last_name}`;

    // Check for Employee Referral
    if (enquiryData.other_details?.enquiry_employee_source_id) {
      const email = enquiryData.other_details.enquiry_employee_source_value;
      const phone = enquiryData.other_details.enquiry_employee_source_number;
      const name = enquiryData.other_details.enquiry_employee_source_name || 'Employee';
      
      if (email && phone) {
        this.loggerService.log(`[REFERRAL] Found employee referrer: ${email}`);
        return {
          type: ReminderRecipientType.REFERRER, // ✅ Use enum
          email,
          phone: String(phone), // ✅ Convert to string
          name,
          verificationUrl: `${baseUrl}/referral-view/?id=${enquiryData._id}&type=employee&action=referrer`,
          referredName: studentName,
        };
      }
    }

    // Check for Pre-School Referral
    if (enquiryData.enquiry_school_source?.id) {
      const email = enquiryData.enquiry_school_source.spoc_email;
      const phone = enquiryData.enquiry_school_source.spoc_mobile_no;
      const name = enquiryData.enquiry_school_source.value || 'Preschool';
      
      if (email && phone) {
        this.loggerService.log(`[REFERRAL] Found preschool referrer: ${email}`);
        return {
          type: ReminderRecipientType.REFERRER, // ✅ Use enum
          email,
          phone: String(phone), // ✅ Convert to string
          name,
          verificationUrl: `${baseUrl}/referral-view/?id=${enquiryData._id}&type=referringschool&action=referrer`,
          referredName: studentName,
        };
      }
    }

    // Also check in other_details for preschool (fallback)
    if (enquiryData.other_details?.enquiry_school_source_id) {
      const email = enquiryData.other_details.enquiry_school_source_email;
      const phone = enquiryData.other_details.enquiry_school_source_number;
      const name = enquiryData.other_details.enquiry_school_source_value || 'Preschool';
      
      if (email && phone) {
        this.loggerService.log(`[REFERRAL] Found preschool referrer in other_details: ${email}`);
        return {
          type: ReminderRecipientType.REFERRER, // ✅ Use enum
          email,
          phone: String(phone), // ✅ Convert to string
          name,
          verificationUrl: `${baseUrl}/referral-view/?id=${enquiryData._id}&type=referringschool&action=referrer`,
          referredName: studentName,
        };
      }
    }

    // Check for Corporate Referral
    if (enquiryData.enquiry_corporate_source?.id) {
      const email = enquiryData.enquiry_corporate_source.spoc_email;
      const phone = enquiryData.enquiry_corporate_source.spoc_mobile_no;
      const name = enquiryData.enquiry_corporate_source.value || 'Corporate';
      
      if (email && phone) {
        this.loggerService.log(`[REFERRAL] Found corporate referrer: ${email}`);
        return {
          type: ReminderRecipientType.REFERRER, // ✅ Use enum
          email,
          phone: String(phone), // ✅ Convert to string
          name,
          verificationUrl: `${baseUrl}/referral-view/?id=${enquiryData._id}&type=referringcorporate&action=referrer`,
          referredName: studentName,
        };
      }
    }

    // Also check in other_details for corporate (fallback)
    if (enquiryData.other_details?.enquiry_corporate_source_id) {
      const email = enquiryData.other_details.enquiry_corporate_source_email;
      const phone = enquiryData.other_details.enquiry_corporate_source_number;
      const name = enquiryData.other_details.enquiry_corporate_source_value || 'Corporate';
      
      if (email && phone) {
        this.loggerService.log(`[REFERRAL] Found corporate referrer in other_details: ${email}`);
        return {
          type: ReminderRecipientType.REFERRER, // ✅ Use enum
          email,
          phone: String(phone), // ✅ Convert to string
          name,
          verificationUrl: `${baseUrl}/referral-view/?id=${enquiryData._id}&type=referringcorporate&action=referrer`,
          referredName: studentName,
        };
      }
    }

    this.loggerService.log(`[REFERRAL] No referrer found for enquiry ${enquiryData._id}`);
    return null;
  }

  private getParentDetails(enquiryData: any, parentType: string): any {
    switch (parentType) {
      case 'Father':
        return enquiryData.parent_details?.father_details;
      case 'Mother':
        return enquiryData.parent_details?.mother_details;
      case 'Guardian':
        return enquiryData.parent_details?.guardian_details;
      default:
        return (
          enquiryData.parent_details?.father_details ||
          enquiryData.parent_details?.mother_details ||
          enquiryData.parent_details?.guardian_details
        );
    }
  }

  async markAsVerified(enquiryId: string, verifiedBy: 'parent' | 'referrer'): Promise<void> {
    try {
      // Find all pending reminders for this enquiry and type
      const reminders = await this.reminderRepository.find({
        enquiry_id: new Types.ObjectId(enquiryId),
        recipient_type: verifiedBy,
        status: ReminderStatus.PENDING,
      });

      // Mark all as verified and completed
      for (const reminder of reminders) {
        await this.reminderRepository.updateById(reminder._id as Types.ObjectId, {
          is_verified: true,
          verified_at: new Date(),
          status: ReminderStatus.COMPLETED,
        });
      }

      console.log(`[REMINDER] Marked ${reminders.length} reminders as verified for enquiry ${enquiryId}`);
    } catch (error) {
      console.error(`[REMINDER] Error marking reminders as verified:`, error);
      throw error;
    }
  }

  async stopReminders(enquiryId: string, reason: string): Promise<void> {
    try {
      const reminders = await this.reminderRepository.find({
        enquiry_id: new Types.ObjectId(enquiryId),
        status: ReminderStatus.PENDING,
      });

      for (const reminder of reminders) {
        await this.reminderRepository.updateById(reminder._id as Types.ObjectId, {
          status: ReminderStatus.CANCELLED,
          $push: { error_logs: `Stopped: ${reason}` },
        });
      }

      console.log(`[REMINDER] Stopped ${reminders.length} reminders for enquiry ${enquiryId}`);
    } catch (error) {
      console.error(`[REMINDER] Error stopping reminders:`, error);
      throw error;
    }
  }
}