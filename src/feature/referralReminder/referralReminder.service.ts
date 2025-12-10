import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { referralReminderConfig } from '../../config/referral-reminder.config';
import { LoggerService } from '../../utils';
import { NotificationService } from '../../global/notification.service';
import { KafkaProducerService } from '../../kafka/kafka-producer.service';
import { EnquiryRepository } from '../enquiry/enquiry.repository';
import { ReminderRepository } from './referralReminder.repository';
import { ReminderStatus, ReminderRecipientType } from './referralReminder.schema';

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
    private readonly reminderRepository: ReminderRepository,
  ) {}

  /**
   * Calculate next scheduled date based on frequency
   */
  private calculateNextSchedule(startDate: Date, frequency: number): Date {
    const nextDate = new Date(startDate);
    const hoursInterval = 24 / frequency; // frequency = reminders per day
    nextDate.setHours(nextDate.getHours() + hoursInterval);
    return nextDate;
  }

  /**
   * Get all recipients (parent + referrer)
   */
  private getAllRecipients(enquiryData: any, baseUrl: string): ReminderRecipient[] {
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

    return recipients;
  }

  /**
   * Create reminder records in database
   */
  async createReminderRecords(enquiryData: any): Promise<void> {
    try {
      const config = referralReminderConfig;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + config.duration);
      
      const baseUrl = this.configService.get<string>('MARKETING_BASE_URL');
      const recipients = this.getAllRecipients(enquiryData, baseUrl);

      // Create database records for tracking
      for (const recipient of recipients) {
        await this.reminderRepository.create({
          enquiry_id: enquiryData._id,
          enquiry_number: enquiryData.enquiry_number,
          recipient_type: recipient.type as any,
          recipient_email: recipient.email,
          recipient_phone: recipient.phone,
          recipient_name: recipient.name,
          reminder_count: 0,
          max_reminders: config.frequency * config.duration,
          total_days: config.duration,
          status: ReminderStatus.PENDING,
          start_date: startDate,
          end_date: endDate,
          next_scheduled_at: this.calculateNextSchedule(startDate, config.frequency),
          referral_details: {
            referrer_name: recipient.referrerName,
            referred_name: recipient.referredName,
            verification_url: recipient.verificationUrl,
          },
        });
      }

      this.loggerService.log(
        `Created reminder records for enquiry: ${enquiryData.enquiry_number}`,
      );
    } catch (error) {
      this.loggerService.error(
        `Error creating reminder records: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Send INITIAL notification when admission happens
   * This is separate from recurring reminders
  */
  async sendInitialNotification(
    enquiryData: any,
    token: string,
    platform: string,
  ): Promise<void> {
    try {
      const baseUrl = this.configService.get<string>('MARKETING_BASE_URL') || 
                'https://preprod-marketing-hubbleorion.hubblehox.com';
      const recipients = this.getAllRecipients(enquiryData, baseUrl);

      this.loggerService.log(`Sending initial notifications to ${recipients.length} recipients`);

      // Send initial notification to all recipients
      for (const recipient of recipients) {
        await this.sendNotification(recipient, enquiryData, token, platform);
      }

      this.loggerService.log(
        `Initial referral notifications sent for enquiry: ${enquiryData.enquiry_number}`,
      );
    } catch (error) {
      this.loggerService.error(
        `Error sending initial notifications: ${error.message}`,
        error.stack,
      );
    }
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
        `Notification sent to ${recipient.type}: ${recipient.email}`,
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