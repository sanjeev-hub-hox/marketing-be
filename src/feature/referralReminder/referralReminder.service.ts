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
import { ShortUrlService } from '../shortUrl/shorturl.service';

@Injectable()
export class ReferralReminderService {
  constructor(
    // private readonly kafkaProducer: KafkaProducerService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
    private readonly verificationTracker: VerificationTrackerService,
    private readonly reminderRepository: ReminderRepository,
    private urlService: ShortUrlService,
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
      const baseUrl = this.configService.get<string>('MARKETING_BASE_URL') || 'https://preprod-marketing-hubbleorion.hubblehox.com';
      
      // ✅ Get all recipients with pre-generated short URLs (generated ONCE)
      const recipients = await this.getAllRecipients(enquiryData, baseUrl);
      const config = referralReminderConfig;

      this.loggerService.log(`[REFERRAL] 📧 Processing ${recipients.length} recipients`);

      // ================================================================
      // STEP 1: Send INITIAL EMAIL notification (admission notification for parent only)
      // ================================================================
      const parentRecipient = recipients.find(r => r.type === ReminderRecipientType.PARENT);
      
      if (parentRecipient) {
        const parentType = enquiryData?.other_details?.parent_type || 'Father';
        const parentDetails = this.getParentDetails(enquiryData, parentType);
        const parentName = `${parentDetails?.first_name || ''} ${parentDetails?.last_name || ''}`.trim() || parentType;
        const studentName = `${enquiryData.student_details.first_name} ${enquiryData.student_details.last_name}`;
        
        try {
          // Send admission email with referral verification link
          await this.notificationService.sendNotification(
            {
              slug: 'Marketing related-Others-Email-Thu Dec 04 2025 01:25:58 GMT+0000 (Coordinated Universal Time)',
              employee_ids: [],
              global_ids: [],
              mail_to: [parentRecipient.email],
              sms_to: [],
              param: {
                parentName: parentName,
                studentName: studentName,
                schoolName: enquiryData.school_location?.value,
                academicYear: enquiryData.academic_year?.value,
                verificationUrl: parentRecipient.verificationUrl  // ✅ Use pre-generated short URL
              }
            },
            token,
            platform
          );

          this.loggerService.log(`✅ Admission email sent to parent with short URL: ${parentRecipient.verificationUrl}`);
        } catch (error) {
          this.loggerService.error(`❌ Failed to send admission email: ${error.message}`, error.stack);
        }
      }

      // ================================================================
      // STEP 2: Send INITIAL SMS to ALL recipients (parent + referrer)
      // ================================================================
      const { buildSmsMessage, SmsTemplateType } = await import('../../config/sms-templates.config');
      const studentName = `${enquiryData.student_details.first_name} ${enquiryData.student_details.last_name}`;
      
      for (const recipient of recipients) {
        try {
          const smsMessage = buildSmsMessage(SmsTemplateType.REFERRAL_VERIFICATION, {
            parentName: studentName,
            studentName: studentName,
            schoolName: enquiryData.school_location?.value || 'VIBGYOR',
            academicYear: enquiryData.academic_year?.value || '',
            verificationUrl: recipient.verificationUrl,  // ✅ Use pre-generated short URL
            recipientName: recipient.name.split(' ')[0] || '',
          });

          await this.notificationService.sendDirectSMS(
            recipient.phone.toString().slice(-10),
            smsMessage
          );

          this.loggerService.log(`✅ Initial SMS sent to ${recipient.type}: ${recipient.name}`);
        } catch (error) {
          this.loggerService.error(`❌ Failed to send SMS to ${recipient.name}: ${error.message}`, error.stack);
        }
      }

      // ================================================================
      // STEP 3: Create reminder records in database for automated reminders
      // ================================================================
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

          this.loggerService.log(`✅ Reminder record created for ${recipient.type}: ${recipient.email}`);
        } catch (error) {
          this.loggerService.error(`❌ Failed to create reminder record for ${recipient.email}: ${error.message}`, error.stack);
        }
      }

      this.loggerService.log(`✅ All reminder records created for enquiry: ${enquiryData.enquiry_number}`);
    } catch (error) {
      this.loggerService.error(`❌ Error scheduling reminders: ${error.message}`, error.stack);
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

  async getAllRecipients(enquiryData: any, baseUrl: string): Promise<RecipientInfo[]> {
    const recipients: RecipientInfo[] = [];
    const studentName = `${enquiryData.student_details.first_name} ${enquiryData.student_details.last_name}`;

    const parentType = enquiryData?.other_details?.parent_type || 'Father';
    const parentDetails = this.getParentDetails(enquiryData, parentType);

    if (parentDetails?.email && parentDetails?.mobile) {
      const parentUrl = `${baseUrl}/referral-view/?id=${enquiryData._id}&type=parent&action=referral`;

      // Create short URL for parent
      let createUrl = await this.urlService.createUrl({url: parentUrl});
      let shortUrl = `${process.env.SHORT_URL_BASE || 'https://pre.vgos.org/?id='}${createUrl.hash}`;
      
      recipients.push({
        type: ReminderRecipientType.PARENT,
        email: parentDetails.email,
        phone: String(parentDetails.mobile),
        name: `${parentDetails.first_name} ${parentDetails.last_name}`,
        verificationUrl: shortUrl,
        referredName: studentName,
      });
    }

    const referrerRecipient = await this.getReferrerRecipient(enquiryData, baseUrl); 
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

  private async getReferrerRecipient(enquiryData: any, baseUrl: string): Promise<RecipientInfo | null> {
    const studentName = `${enquiryData.student_details.first_name} ${enquiryData.student_details.last_name}`;

    // Check for Employee Referral
    if (enquiryData.other_details?.enquiry_employee_source_id) {
      const email = enquiryData.other_details.enquiry_employee_source_value;
      const phone = enquiryData.other_details.enquiry_employee_source_number;
      const name = enquiryData.other_details.enquiry_employee_source_name || 'Employee';
      
      if (email && phone) {
        this.loggerService.log(`[REFERRAL] Found employee referrer: ${email}`);
        
        // ✅ Create short URL for employee referrer
        const employeeUrl = `${baseUrl}/referral-view/?id=${enquiryData._id}&type=employee&action=referrer`;
        let createUrl = await this.urlService.createUrl({url: employeeUrl});
        let shortUrl = `${process.env.SHORT_URL_BASE || 'https://pre.vgos.org/?id='}${createUrl.hash}`;
        
        return {
          type: ReminderRecipientType.REFERRER,
          email,
          phone: String(phone),
          name,
          verificationUrl: shortUrl, 
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
        const schoolUrl = `${baseUrl}/referral-view/?id=${enquiryData._id}&type=referringschool&action=referrer`;
        let createUrl = await this.urlService.createUrl({url: schoolUrl});
        let shortUrl = `${process.env.SHORT_URL_BASE || 'https://pre.vgos.org/?id='}${createUrl.hash}`;
        
        return {
          type: ReminderRecipientType.REFERRER, // ✅ Use enum
          email,
          phone: String(phone), // ✅ Convert to string
          name,
          verificationUrl: shortUrl, 
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
        
        // ✅ Create short URL
        const schoolUrl = `${baseUrl}/referral-view/?id=${enquiryData._id}&type=referringschool&action=referrer`;
        let createUrl = await this.urlService.createUrl({url: schoolUrl});
        let shortUrl = `${process.env.SHORT_URL_BASE || 'https://pre.vgos.org/?id='}${createUrl.hash}`;
        
        return {
          type: ReminderRecipientType.REFERRER, // ✅ Use enum
          email,
          phone: String(phone), // ✅ Convert to string
          name,
          verificationUrl: shortUrl, // ✅ Use short URL
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
        
        // ✅ Create short URL for corporate referrer
        const corporateUrl = `${baseUrl}/referral-view/?id=${enquiryData._id}&type=referringcorporate&action=referrer`;
        let createUrl = await this.urlService.createUrl({url: corporateUrl});
        let shortUrl = `${process.env.SHORT_URL_BASE || 'https://pre.vgos.org/?id='}${createUrl.hash}`;
        
        return {
          type: ReminderRecipientType.REFERRER, // ✅ Use enum
          email,
          phone: String(phone), // ✅ Convert to string
          name,
          verificationUrl: shortUrl, // ✅ Use short URL
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
        
        // ✅ Create short URL
        const corporateUrl = `${baseUrl}/referral-view/?id=${enquiryData._id}&type=referringcorporate&action=referrer`;
        let createUrl = await this.urlService.createUrl({url: corporateUrl});
        let shortUrl = `${process.env.SHORT_URL_BASE || 'https://pre.vgos.org/?id='}${createUrl.hash}`;
        
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