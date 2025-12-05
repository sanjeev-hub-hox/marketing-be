import axios from "axios";

type CommunicationTemplate = {
  slug: string;
  employee_ids?: number[];
  global_ids?: number[];
  mail_to?: string[];
  sms_to?: string[];
  param?: { [key: string]: any };
  attachment?: { [key: string]: string };
};

import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async getplatform(platform: string) {
    if (platform) {
      return `platform=${platform}`;
    }
    return `platform=web`;
  }

  async sendNotification(
    notificationPayload: CommunicationTemplate,
    token: any,
    platform: any
  ) {
    // Use the correct base URL from your cURL example
    const BaseUrl = process.env.NOTIFICATION_URL || 
      'https://notifications-backend-1032326496689.asia-south1.run.app';

    // Validate required fields
    if (!notificationPayload.slug) {
      this.logger.error('Notification slug is required');
      throw new Error('Notification slug is required');
    }

    // Build the payload exactly as shown in your cURL example
    const notifypayload: any = {
      slug: notificationPayload.slug,
      to_mail: notificationPayload.mail_to || [],
      to_mobile: notificationPayload.sms_to || [],
      param: notificationPayload.param || {}
    };

    // Only add employee_ids and global_ids if they have values
    if (notificationPayload.employee_ids && notificationPayload.employee_ids.length > 0) {
      notifypayload.employee_ids = notificationPayload.employee_ids;
    }
    
    if (notificationPayload.global_ids && notificationPayload.global_ids.length > 0) {
      notifypayload.global_ids = notificationPayload.global_ids;
    }

    // Add attachment if present
    if (notificationPayload.attachment) {
      notifypayload.attachment = notificationPayload.attachment;
    }

    // Remove empty arrays to match cURL format
    if (notifypayload.to_mail.length === 0) delete notifypayload.to_mail;
    if (notifypayload.to_mobile.length === 0) delete notifypayload.to_mobile;

    try {
      this.logger.log('=== Notification Request ===');
      this.logger.log(`URL: ${BaseUrl}/notification/send?${await this.getplatform(platform)}`);
      this.logger.log(`Payload: ${JSON.stringify(notifypayload, null, 2)}`);
      this.logger.log(`Token present: ${!!token}`);
      
      const response = await axios.post(
        `${BaseUrl}/notification/send`,
        notifypayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          params: {
            platform: platform || 'web'
          }
        }
      );

      this.logger.log(`Notification sent successfully. Status: ${response.status}`);
      this.logger.log(`Response: ${JSON.stringify(response.data)}`);
      
      if (response.status === 200) {
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('=== Notification Error ===');
      
      if (axios.isAxiosError(error)) {
        this.logger.error(`Error Message: ${error.message}`);
        
        if (error.response) {
          this.logger.error(`Status Code: ${error.response.status}`);
          this.logger.error(`Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
          
          // Log specific validation errors if present
          if (error.response.data?.message) {
            this.logger.error(`API Error Message: ${error.response.data.message}`);
          }
          if (error.response.data?.errors) {
            this.logger.error(`Validation Errors: ${JSON.stringify(error.response.data.errors, null, 2)}`);
          }
        } else if (error.request) {
          this.logger.error('No response received from notification service');
        }
        
        // Log the payload that caused the error
        this.logger.error(`Failed Payload: ${JSON.stringify(notifypayload, null, 2)}`);
      } else {
        this.logger.error(`Unexpected error: ${error}`);
      }
      
      // Don't throw, return false to allow the process to continue
      return false;
    }
  }
}