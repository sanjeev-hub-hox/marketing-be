import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { LoggerService } from '../../utils';
import { NotificationService } from '../../global/notification.service';
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
      const baseUrl = this.configService.get<string>('MARKETING_BASE_URL') || 
        'https://preprod-marketing-hubbleorion.hubblehox.com';
      
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
                verificationUrl: parentRecipient.verificationUrl
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
            verificationUrl: recipient.verificationUrl,
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

      for (const recipient of recipients) {
        const firstReminderDate = this.calculateNextSchedule(startDate, hoursInterval);

        try {
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
            reminder_count: 0,
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

    // 🔍 DEBUG: Log all referral-related fields
    this.loggerService.log(`[REFERRAL DEBUG] Checking referral sources for enquiry ${enquiryData._id}:`);
    this.loggerService.log(`  - enquiry_parent_source: ${!!enquiryData.enquiry_parent_source}`);
    this.loggerService.log(`  - enquiry_employee_source: ${!!enquiryData.enquiry_employee_source}`);
    this.loggerService.log(`  - enquiry_school_source: ${!!enquiryData.enquiry_school_source}`);
    this.loggerService.log(`  - enquiry_corporate_source: ${!!enquiryData.enquiry_corporate_source}`);
    this.loggerService.log(`  - other_details.enquiry_employee_source_id: ${enquiryData.other_details?.enquiry_employee_source_id}`);
    this.loggerService.log(`  - other_details.enquiry_school_source_id: ${enquiryData.other_details?.enquiry_school_source_id}`);
    this.loggerService.log(`  - other_details.enquiry_corporate_source_id: ${enquiryData.other_details?.enquiry_corporate_source_id}`);

    // ✅ 1. Check for Parent Referral
    if (enquiryData?.enquiry_parent_source) {
      const email = enquiryData.enquiry_parent_source.parent_email;
      const name = enquiryData.enquiry_parent_source.name;
      const phone = enquiryData.enquiry_parent_source.value;

      if (email && phone) {
        this.loggerService.log(`[REFERRAL] ✅ Found parent referrer: ${email}`);

        const parentUrl = `${baseUrl}/referral-view/?id=${enquiryData._id}&type=parent&action=referrer`;
        let createUrl = await this.urlService.createUrl({url: parentUrl});
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

    // ✅ 2. Check for Employee Referral (PRIORITY: Root level enquiry_employee_source)
    if (enquiryData?.enquiry_employee_source) {
      this.loggerService.log(`[REFERRAL DEBUG] enquiry_employee_source data: ${JSON.stringify(enquiryData.enquiry_employee_source)}`);
      
      const email = enquiryData.enquiry_employee_source.value;
      const phone = enquiryData.enquiry_employee_source.number;
      const name = enquiryData.enquiry_employee_source.name || 'Employee';
      
      if (email && phone) {
        this.loggerService.log(`[REFERRAL] ✅ Found employee referrer at ROOT level: ${email}`);
        
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
      } else {
        this.loggerService.warn(`[REFERRAL] ⚠️ enquiry_employee_source exists but missing email/phone. Email: ${email}, Phone: ${phone}`);
      }
    }

    // ✅ 3. Check for Employee Referral (FALLBACK: other_details)
    if (enquiryData?.other_details?.enquiry_employee_source_id) {
      this.loggerService.log(`[REFERRAL DEBUG] Checking other_details for employee source...`);
      
      const email = enquiryData.other_details.enquiry_employee_source_value;
      const phone = enquiryData.other_details.enquiry_employee_source_number;
      const name = enquiryData.other_details.enquiry_employee_source_name || 'Employee';
      
      if (email && phone) {
        this.loggerService.log(`[REFERRAL] ✅ Found employee referrer in other_details: ${email}`);
        
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
      } else {
        this.loggerService.warn(`[REFERRAL] ⚠️ other_details.enquiry_employee_source_id exists but missing email/phone. Email: ${email}, Phone: ${phone}`);
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
          type: ReminderRecipientType.REFERRER,
          email,
          phone: String(phone),
          name,
          verificationUrl: shortUrl, 
          referredName: studentName,
        };
      }
    }

    // ✅ 4. Check for Pre-School Referral (from other_details - fallback)
    if (enquiryData.other_details?.enquiry_school_source_id) {
      const email = enquiryData.other_details.enquiry_school_source_email;
      const phone = enquiryData.other_details.enquiry_school_source_number;
      const name = enquiryData.other_details.enquiry_school_source_value || 'Preschool';
      
      if (email && phone) {
        this.loggerService.log(`[REFERRAL] ✅ Found preschool referrer in other_details: ${email}`);
        
        const schoolUrl = `${baseUrl}/referral-view/?id=${enquiryData._id}&type=referringschool&action=referrer`;
        let createUrl = await this.urlService.createUrl({url: schoolUrl});
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

    // ✅ 5. Check for Corporate Referral (from enquiry_corporate_source)
    if (enquiryData.enquiry_corporate_source?.id) {
      const email = enquiryData.enquiry_corporate_source.spoc_email;
      const phone = enquiryData.enquiry_corporate_source.spoc_mobile_no;
      const name = enquiryData.enquiry_corporate_source.value || 'Corporate';
      
      if (email && phone) {
        this.loggerService.log(`[REFERRAL] ✅ Found corporate referrer: ${email}`);
        
        const corporateUrl = `${baseUrl}/referral-view/?id=${enquiryData._id}&type=referringcorporate&action=referrer`;
        let createUrl = await this.urlService.createUrl({url: corporateUrl});
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

    // ✅ 6. Check for Corporate Referral (from other_details - fallback)
    if (enquiryData.other_details?.enquiry_corporate_source_id) {
      const email = enquiryData.other_details.enquiry_corporate_source_email;
      const phone = enquiryData.other_details.enquiry_corporate_source_number;
      const name = enquiryData.other_details.enquiry_corporate_source_value || 'Corporate';
      
      if (email && phone) {
        this.loggerService.log(`[REFERRAL] ✅ Found corporate referrer in other_details: ${email}`);
        
        const corporateUrl = `${baseUrl}/referral-view/?id=${enquiryData._id}&type=referringcorporate&action=referrer`;
        let createUrl = await this.urlService.createUrl({url: corporateUrl});
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

    this.loggerService.log(`[REFERRAL] ⚠️ No referrer found for enquiry ${enquiryData._id}`);
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
      const reminders = await this.reminderRepository.find({
        enquiry_id: new Types.ObjectId(enquiryId),
        recipient_type: verifiedBy,
        status: ReminderStatus.PENDING,
      });

      for (const reminder of reminders) {
        await this.reminderRepository.updateById(reminder._id as Types.ObjectId, {
          is_verified: true,
          verified_at: new Date(),
          status: ReminderStatus.COMPLETED,
        });
      }

      this.loggerService.log(`[REMINDER] ✅ Marked ${reminders.length} reminders as verified for enquiry ${enquiryId}`);
    } catch (error) {
      this.loggerService.error(`[REMINDER] ❌ Error marking reminders as verified:`, error);
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

      this.loggerService.log(`[REMINDER] ✅ Stopped ${reminders.length} reminders for enquiry ${enquiryId}`);
    } catch (error) {
      this.loggerService.error(`[REMINDER] ❌ Error stopping reminders:`, error);
      throw error;
    }
  }
}