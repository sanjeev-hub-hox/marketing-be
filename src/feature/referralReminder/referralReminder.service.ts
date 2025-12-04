import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { referralReminderConfig } from '../../config/referral-reminder.config';
import { LoggerService } from '../../utils';
import { NotificationService } from '../../global/notification.service';
import { KafkaProducerService } from '../../kafka/kafka-producer.service';
import { EnquiryRepository } from '../enquiry/enquiry.repository';

interface ReminderRecipient {
  type: 'parent' | 'referrer';
  email: string;
  phone: string;
  name: string;
  verificationUrl: string;
  referrerName?: string;
  referredName?: string;
}

@Injectable()
export class ReferralReminderService {
  constructor(
    private readonly kafkaProducer: KafkaProducerService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
    private readonly enquiryRepository: EnquiryRepository,
  ) {}

  /**
   * Send immediate reminders for both parent and referrer
   * No database storage - direct notification sending
   */
  async sendReferralReminders(
    enquiryData: any,
    token: string,
    platform: string,
  ): Promise<void> {
    try {
      const baseUrl = this.configService.get<string>('MARKETING_BASE_URL');
      const recipients: ReminderRecipient[] = [];

      // Get parent details
      const parentType = enquiryData?.other_details?.parent_type || 'Father';
      const parentDetails = this.getParentDetails(enquiryData, parentType);
      const studentName = `${enquiryData.student_details.first_name} ${enquiryData.student_details.last_name}`;

      // Add parent recipient
      if (parentDetails?.email && parentDetails?.mobile) {
        const parentUrl = `${baseUrl}/referral-view/?id=${enquiryData._id}&type=parent&action=referral`;
        
        recipients.push({
          type: 'parent',
          email: parentDetails.email,
          phone: parentDetails.mobile,
          name: `${parentDetails.first_name} ${parentDetails.last_name}`,
          verificationUrl: parentUrl,
          referredName: studentName,
        });
      }

      // Add referrer recipient
      const referrerRecipient = this.getReferrerRecipient(enquiryData, baseUrl);
      if (referrerRecipient) {
        recipients.push(referrerRecipient);
      }

      // Send notifications to all recipients
      for (const recipient of recipients) {
        await this.sendNotification(
          recipient,
          enquiryData,
          token,
          platform,
        );
      }

      this.loggerService.log(
        `Referral reminders sent for enquiry: ${enquiryData.enquiry_number}`,
      );
    } catch (error) {
      this.loggerService.error(
        `Error sending referral reminders: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Process pending reminders based on enquiries with referrals
   * Called by cron job
   */
  async processPendingReminders(): Promise<number> {
    if (!referralReminderConfig.enabled) {
      this.loggerService.log(
        'Referral reminder system is disabled',
      );
      return 0;
    }

    try {
      // Get enquiries that need reminders
      const enquiriesToRemind = await this.getEnquiriesNeedingReminders();
      
      this.loggerService.log(
        `Processing ${enquiriesToRemind.length} enquiries for referral reminders`,
      );

      let processedCount = 0;
      const token = ''; // Get token from appropriate source if needed
      const platform = 'web';

      for (const enquiry of enquiriesToRemind) {
        try {
          await this.sendReferralReminders(enquiry, token, platform);
          processedCount++;
        } catch (error) {
          this.loggerService.error(
            `Error processing enquiry ${enquiry.enquiry_number}: ${error.message}`,
            error.stack,
          );
        }
      }

      this.loggerService.log(
        `Processed ${processedCount} referral reminders`,
      );

      return processedCount;
    } catch (error) {
      this.loggerService.error(
        `Error in processPendingReminders: ${error.message}`,
        error.stack,
      );
      return 0;
    }
  }

  /**
   * Get enquiries that need reminders
   * Logic: Enquiries with admission stage completed but referral not verified
   */
  private async getEnquiriesNeedingReminders(): Promise<any[]> {
    const config = referralReminderConfig;
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.duration);

    // Find enquiries with:
    // 1. Admission stage completed
    // 2. Has referral source
    // 3. Referral not verified
    // 4. Within duration period
    const enquiries = await this.enquiryRepository.getMany({
      $and: [
        {
          'enquiry_stages': {
            $elemMatch: {
              stage_name: 'Admitted or Provisional Approval',
              status: { $in: ['Admitted', 'Provisional Admission'] }
            }
          }
        },
        {
          $or: [
            { 'other_details.enquiry_employee_source_id': { $exists: true, $ne: null } },
            { 'other_details.enquiry_parent_source_id': { $exists: true, $ne: null } },
            { 'enquiry_school_source.id': { $exists: true, $ne: null } },
            { 'other_details.enquiry_corporate_source_id': { $exists: true, $ne: null } },
          ]
        },
        {
          $or: [
            { 'other_details.referrer.verified': { $ne: true } },
            { 'other_details.referral.verified': { $ne: true } },
            { 'other_details.referrer': { $exists: false } },
            { 'other_details.referral': { $exists: false } },
          ]
        },
        {
          created_at: { $gte: cutoffDate }
        }
      ]
    });

    return enquiries || [];
  }

  /**
   * Send notification to a recipient
   */
  private async sendNotification(
    recipient: ReminderRecipient,
    enquiryData: any,
    token: string,
    platform: string,
  ): Promise<void> {
    try {
      // Send to Kafka (if enabled)
      if (referralReminderConfig.kafkaTopic) {
        await this.kafkaProducer.sendMessage(
          referralReminderConfig.kafkaTopic,
          {
            enquiry_id: enquiryData._id.toString(),
            enquiry_number: enquiryData.enquiry_number,
            recipient_type: recipient.type,
            recipient_email: recipient.email,
            recipient_phone: recipient.phone,
            recipient_name: recipient.name,
            verification_url: recipient.verificationUrl,
            timestamp: new Date().toISOString(),
          },
        );
      }

      // Send direct notification
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
          },
        },
        token,
        platform,
      );

      this.loggerService.log(
        `Reminder sent to ${recipient.type}: ${recipient.email}`,
      );
    } catch (error) {
      this.loggerService.error(
        `Error sending notification to ${recipient.email}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Get referrer recipient based on referral source type
   */
  private getReferrerRecipient(enquiryData: any, baseUrl: string): ReminderRecipient | null {
    const studentName = `${enquiryData.student_details.first_name} ${enquiryData.student_details.last_name}`;

    // Employee Referral
    if (enquiryData.other_details?.enquiry_employee_source_id) {
      const email = enquiryData.other_details.enquiry_employee_source_value;
      const phone = enquiryData.other_details.enquiry_employee_source_number;
      const name = enquiryData.other_details.enquiry_employee_source_name || 'Employee';
      
      if (email && phone) {
        return {
          type: 'referrer',
          email,
          phone,
          name,
          verificationUrl: `${baseUrl}/referral-view/?id=${enquiryData._id}&type=employee&action=referrer`,
          referredName: studentName,
        };
      }
    }

    // Parent Referral
    if (enquiryData.other_details?.enquiry_parent_source_id) {
      const phone = enquiryData.other_details.enquiry_parent_source_value;
      // Note: You'll need to fetch parent details from another enquiry
      // This is simplified - implement based on your needs
      return null;
    }

    // Preschool Referral
    if (enquiryData.enquiry_school_source?.id) {
      const email = enquiryData.enquiry_school_source.spoc_email;
      const phone = enquiryData.enquiry_school_source.spoc_mobile_no;
      const name = enquiryData.enquiry_school_source.value || 'Preschool';
      
      if (email && phone) {
        return {
          type: 'referrer',
          email,
          phone,
          name,
          verificationUrl: `${baseUrl}/referral-view/?id=${enquiryData._id}&type=referringschool&action=referrer`,
          referredName: studentName,
        };
      }
    }

    // Corporate Referral
    if (enquiryData.other_details?.enquiry_corporate_source_id) {
      const email = enquiryData.other_details.enquiry_corporate_source_email;
      const phone = enquiryData.other_details.enquiry_corporate_source_number;
      const name = enquiryData.other_details.enquiry_corporate_source_name || 'Corporate';
      
      if (email && phone) {
        return {
          type: 'referrer',
          email,
          phone,
          name,
          verificationUrl: `${baseUrl}/referral-view/?id=${enquiryData._id}&type=referringcorporate&action=referrer`,
          referredName: studentName,
        };
      }
    }

    return null;
  }

  /**
   * Get parent details helper
   */
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
}