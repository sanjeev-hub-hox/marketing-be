import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../../global/notification.service';
import { LoggerService } from '../../utils';
import { ShortUrlService } from '../shortUrl/shorturl.service';
import { buildSmsMessage, SmsTemplateType } from '../../config/sms-templates.config';
import { EnquiryRepository } from '../enquiry/enquiry.repository';
import { Types } from 'mongoose';

export interface SmsRecipient {
  name: string;
  phone: string;
  type: 'parent' | 'referrer';
}

@Injectable()
export class SmsReminderService {
  private readonly logger = new Logger(SmsReminderService.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly urlService: ShortUrlService,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
    private readonly enquiryRepository: EnquiryRepository,
  ) {}

  /**
   * Get all SMS recipients (parent and referrer) from enquiry data
   */
  getAllSmsRecipients(enquiryData: any, baseUrl: string): SmsRecipient[] {
    const recipients: SmsRecipient[] = [];

    // Get parent details
    const parentType = enquiryData?.other_details?.parent_type || 'Father';
    const parentDetails = this.getParentDetails(enquiryData, parentType);

    if (parentDetails?.mobile) {
      recipients.push({
        name: `${parentDetails.first_name || ''} ${parentDetails.last_name || ''}`.trim() || parentType,
        phone: parentDetails.mobile.toString(),
        type: 'parent',
      });
    }

    // Get referrer details
    const referrerDetails = this.getReferrerDetails(enquiryData);
    if (referrerDetails?.phone) {
      recipients.push({
        name: referrerDetails.name,
        phone: referrerDetails.phone.toString(),
        type: 'referrer',
      });
    }

    return recipients;
  }

  /**
   * Get parent details based on parent type
   */
  private getParentDetails(enquiryData: any, parentType: string) {
    switch (parentType) {
      case 'Father':
        return enquiryData?.parent_details?.father_details;
      case 'Mother':
        return enquiryData?.parent_details?.mother_details;
      case 'Guardian':
        return enquiryData?.parent_details?.guardian_details;
      default:
        return (
          enquiryData?.parent_details?.father_details ||
          enquiryData?.parent_details?.mother_details ||
          enquiryData?.parent_details?.guardian_details
        );
    }
  }

  /**
   * Get referrer details from enquiry data
   */
  private getReferrerDetails(enquiryData: any): { name: string; phone: string } | null {
    const od = enquiryData?.other_details || {};

    // Employee referral
    if (od.enquiry_employee_source_name && od.enquiry_employee_source_number) {
      return {
        name: od.enquiry_employee_source_name,
        phone: od.enquiry_employee_source_number,
      };
    }

    // Parent referral
    if (od.enquiry_parent_source_value) {
      return {
        name: od.enquiry_parent_source_value,
        phone: od.enquiry_parent_source_value, // Assuming this contains phone
      };
    }

    // Corporate referral
    if (od.enquiry_corporate_source_value && od.enquiry_corporate_source_number) {
      return {
        name: od.enquiry_corporate_source_value,
        phone: od.enquiry_corporate_source_number,
      };
    }

    // School referral
    if (od.enquiry_school_source_value && od.enquiry_school_source_number) {
      return {
        name: od.enquiry_school_source_value,
        phone: od.enquiry_school_source_number,
      };
    }

    return null;
  }

  /**
   * Send initial SMS to all recipients
   */
  async sendInitialSms(enquiryData: any): Promise<void> {
    try {
      const baseUrl = process.env.MARKETING_BASE_URL || 
        'https://preprod-marketing-hubbleorion.hubblehox.com';

      const recipients = this.getAllSmsRecipients(enquiryData, baseUrl);

      this.loggerService.log(`📱 Sending initial SMS to ${recipients.length} recipients`);

      for (const recipient of recipients) {
        await this.sendVerificationSms(enquiryData, recipient);
      }

      this.loggerService.log(`✅ Initial SMS sent to all recipients`);
    } catch (error) {
      this.loggerService.error(`❌ Error sending initial SMS: ${error.message}`, error.stack);
    }
  }

  /**
   * Send verification SMS to a single recipient
   */
  async sendVerificationSms(enquiryData: any, recipient: SmsRecipient): Promise<void> {
    try {
      const baseUrl = process.env.MARKETING_BASE_URL || 
        'https://preprod-marketing-hubbleorion.hubblehox.com';

      // Create custom URL for this recipient
      const customUrl = `${baseUrl}/referral-view/?id=${enquiryData._id}&type=${recipient.type}&action=${recipient.type}`;

      // Create short URL
      const createUrl = await this.urlService.createUrl({ url: customUrl });
      const shortUrl = `${process.env.SHORT_URL_BASE || 'https://pre.vgos.org/?id='}${createUrl.hash}`;

      // Get student name
      const studentName = `${enquiryData.student_details.first_name} ${enquiryData.student_details.last_name}`;

      // Build SMS message
      const smsMessage = buildSmsMessage(SmsTemplateType.REFERRAL_VERIFICATION, {
        recipientName: recipient.name.split(' ')[0] || recipient.name,
        studentName: studentName,
        schoolName: enquiryData.school_location?.value || 'VIBGYOR',
        academicYear: enquiryData.academic_year?.value || '',
        verificationUrl: shortUrl,
      });

      // Send SMS
      await this.notificationService.sendDirectSMS(
        recipient.phone.toString().slice(-10),
        smsMessage
      );

      this.loggerService.log(`✅ SMS sent to ${recipient.name} (${recipient.type})`);
    } catch (error) {
      this.loggerService.error(`❌ Error sending SMS to ${recipient.name}: ${error.message}`, error.stack);
    }
  }

  /**
   * Send reminder SMS to a single recipient
   */
  async sendReminderSms(enquiryData: any, recipient: SmsRecipient): Promise<void> {
    try {
      const baseUrl = process.env.MARKETING_BASE_URL || 
        'https://preprod-marketing-hubbleorion.hubblehox.com';

      // Create custom URL for this recipient
      const customUrl = `${baseUrl}/referral-view/?id=${enquiryData._id}&type=${recipient.type}&action=${recipient.type === 'parent' ? 'referral' : 'refferer'}`;

      // Create short URL
      const createUrl = await this.urlService.createUrl({ url: customUrl });
      const shortUrl = `${process.env.SHORT_URL_BASE || 'https://pre.vgos.org/?id='}${createUrl.hash}`;

      // Build reminder SMS message
      const smsMessage = buildSmsMessage(SmsTemplateType.REFERRAL_REMINDER, {
        recipientName: recipient.name.split(' ')[0] || recipient.name,
        verificationUrl: shortUrl,
      });

      // Send SMS
      await this.notificationService.sendDirectSMS(
        recipient.phone.toString().slice(-10),
        smsMessage
      );

      this.loggerService.log(`✅ Reminder SMS sent to ${recipient.name} (${recipient.type})`);
    } catch (error) {
      this.loggerService.error(`❌ Error sending reminder SMS to ${recipient.name}: ${error.message}`, error.stack);
    }
  }

  /**
   * Schedule SMS reminders (called from cron job or scheduler)
   */
  async scheduleReminders(enquiryData: any): Promise<void> {
    try {
      const baseUrl = process.env.MARKETING_BASE_URL || 
        'https://preprod-marketing-hubbleorion.hubblehox.com';

      const recipients = this.getAllSmsRecipients(enquiryData, baseUrl);

      this.loggerService.log(`📱 Scheduling SMS reminders for ${recipients.length} recipients`);

      for (const recipient of recipients) {
        // Check if already verified
        const isVerified = this.isRecipientVerified(enquiryData, recipient.type);
        
        if (!isVerified) {
          await this.sendReminderSms(enquiryData, recipient);
        } else {
          this.loggerService.log(`⏭️ Skipping ${recipient.name} - already verified`);
        }
      }

      this.loggerService.log(`✅ SMS reminders processed`);
    } catch (error) {
      this.loggerService.error(`❌ Error scheduling SMS reminders: ${error.message}`, error.stack);
    }
  }

  /**
   * Check if recipient is already verified
   */
  private isRecipientVerified(enquiryData: any, recipientType: 'parent' | 'referrer'): boolean {
    const od = enquiryData?.other_details || {};

    if (recipientType === 'parent') {
      return od.referral?.verified === true;
    } else {
      return od.referrer?.verified === true;
    }
  }

  /**
   * Mark recipient as verified and stop reminders
   */
  async markAsVerified(enquiryId: string, recipientType: 'parent' | 'referrer' | 'both'): Promise<void> {
    try {
      const enquiryData = await this.enquiryRepository.getById(new Types.ObjectId(enquiryId));
      
      if (!enquiryData) {
        throw new Error('Enquiry not found');
      }

      const od = enquiryData.other_details || {};
      const updateData: any = { ...od };

      if (recipientType === 'referrer' || recipientType === 'both') {
        updateData.referrer = {
          ...od.referrer,
          verified: true,
          verifiedAt: new Date(),
          smsRemindersStopped: true,
        };
      }

      if (recipientType === 'parent' || recipientType === 'both') {
        updateData.referral = {
          ...od.referral,
          verified: true,
          verifiedAt: new Date(),
          smsRemindersStopped: true,
        };
      }

      await this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
        other_details: updateData,
      });

      this.loggerService.log(`✅ Marked ${recipientType} as verified for enquiry ${enquiryId}`);
    } catch (error) {
      this.loggerService.error(`❌ Error marking as verified: ${error.message}`, error.stack);
    }
  }
}