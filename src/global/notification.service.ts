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

    // ============================================
    // DETAILED SMS DEBUGGING
    // ============================================
    this.logger.log('=== SMS DEBUG INFO ===');
    this.logger.log(`Input sms_to: ${JSON.stringify(notificationPayload.sms_to)}`);
    this.logger.log(`sms_to type: ${typeof notificationPayload.sms_to}`);
    this.logger.log(`sms_to is array: ${Array.isArray(notificationPayload.sms_to)}`);
    this.logger.log(`sms_to length: ${notificationPayload.sms_to?.length || 0}`);
    
    if (notificationPayload.sms_to && notificationPayload.sms_to.length > 0) {
      notificationPayload.sms_to.forEach((phone, index) => {
        this.logger.log(`SMS Phone ${index}: ${phone} (type: ${typeof phone}, length: ${phone?.toString().length})`);
      });
    }

    // Validate and format SMS numbers
    const formattedSmsTo = this.validateAndFormatPhoneNumbers(notificationPayload.sms_to || []);
    this.logger.log(`Formatted sms_to: ${JSON.stringify(formattedSmsTo)}`);

    // Build the payload exactly as shown in your cURL example
    const notifypayload: any = {
      slug: notificationPayload.slug,
      to_mail: notificationPayload.mail_to || [],
      to_mobile: formattedSmsTo, // Use formatted numbers
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

    // DON'T remove empty arrays - keep them to see what the API expects
    // The API might need to know that SMS was attempted even if array is empty
    
    this.logger.log('=== FINAL PAYLOAD BEFORE SEND ===');
    this.logger.log(`to_mail: ${JSON.stringify(notifypayload.to_mail)}`);
    this.logger.log(`to_mobile: ${JSON.stringify(notifypayload.to_mobile)}`);
    this.logger.log(`Has SMS numbers: ${notifypayload.to_mobile && notifypayload.to_mobile.length > 0}`);

    try {
      this.logger.log('=== Notification Request ===');
      this.logger.log(`URL: ${BaseUrl}/notification/send?${await this.getplatform(platform)}`);
      this.logger.log(`Full Payload: ${JSON.stringify(notifypayload, null, 2)}`);
      this.logger.log(`Token present: ${!!token}`);
      this.logger.log(`Token length: ${token?.length || 0}`);
      
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
          },
          timeout: 30000 // 30 second timeout
        }
      );

      this.logger.log('=== Notification Response ===');
      this.logger.log(`Status: ${response.status}`);
      this.logger.log(`Response Data: ${JSON.stringify(response.data, null, 2)}`);
      
      // Check if response indicates SMS was sent
      if (response.data) {
        this.logger.log(`Response type: ${typeof response.data}`);
        this.logger.log(`Response keys: ${Object.keys(response.data).join(', ')}`);
        
        // Look for SMS-specific response data
        if (response.data.sms || response.data.mobile || response.data.to_mobile) {
          this.logger.log('=== SMS Response Details ===');
          this.logger.log(`SMS Data: ${JSON.stringify(response.data.sms || response.data.mobile || response.data.to_mobile)}`);
        }
        
        // Check for any error messages in response
        if (response.data.errors || response.data.failed) {
          this.logger.warn('=== Partial Failure Detected ===');
          this.logger.warn(`Errors: ${JSON.stringify(response.data.errors || response.data.failed)}`);
        }
      }
      
      if (response.status === 200) {
        this.logger.log('✅ Notification API returned 200 OK');
        return true;
      }
      
      this.logger.warn(`⚠️ Unexpected status code: ${response.status}`);
      return false;
    } catch (error) {
      this.logger.error('=== Notification Error ===');
      
      if (axios.isAxiosError(error)) {
        this.logger.error(`Error Message: ${error.message}`);
        this.logger.error(`Error Code: ${error.code}`);
        
        if (error.response) {
          this.logger.error(`Status Code: ${error.response.status}`);
          this.logger.error(`Status Text: ${error.response.statusText}`);
          this.logger.error(`Response Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
          this.logger.error(`Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
          
          // Log specific validation errors if present
          if (error.response.data?.message) {
            this.logger.error(`API Error Message: ${error.response.data.message}`);
          }
          if (error.response.data?.errors) {
            this.logger.error(`Validation Errors: ${JSON.stringify(error.response.data.errors, null, 2)}`);
          }
          
          // Check for SMS-specific errors
          if (error.response.data?.sms_errors || error.response.data?.mobile_errors) {
            this.logger.error(`SMS Errors: ${JSON.stringify(error.response.data.sms_errors || error.response.data.mobile_errors)}`);
          }
        } else if (error.request) {
          this.logger.error('No response received from notification service');
          this.logger.error(`Request: ${JSON.stringify(error.request, null, 2)}`);
        }
        
        // Log the payload that caused the error
        this.logger.error(`Failed Payload: ${JSON.stringify(notifypayload, null, 2)}`);
      } else {
        this.logger.error(`Unexpected error: ${error}`);
        this.logger.error(`Error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
      }
      
      // Don't throw, return false to allow the process to continue
      return false;
    }
  }

  /**
   * Validate and format phone numbers for SMS
   */
  private validateAndFormatPhoneNumbers(phoneNumbers: string[]): string[] {
    if (!phoneNumbers || !Array.isArray(phoneNumbers)) {
      this.logger.warn('SMS phone numbers is not an array or is undefined');
      return [];
    }

    const formatted: string[] = [];

    phoneNumbers.forEach((phone, index) => {
      try {
        if (!phone) {
          this.logger.warn(`Phone number at index ${index} is empty/null`);
          return;
        }

        // Convert to string and clean
        let cleanPhone = phone.toString().replace(/\D/g, ''); // Remove non-digits
        
        this.logger.log(`Processing phone ${index}: Original="${phone}", Cleaned="${cleanPhone}"`);

        // If phone is longer than 10 digits, take last 10
        if (cleanPhone.length > 10) {
          cleanPhone = cleanPhone.slice(-10);
          this.logger.log(`Trimmed to last 10 digits: ${cleanPhone}`);
        }

        // Validate it's exactly 10 digits
        if (cleanPhone.length === 10 && /^\d{10}$/.test(cleanPhone)) {
          formatted.push(cleanPhone);
          this.logger.log(`✅ Valid phone number: ${cleanPhone}`);
        } else {
          this.logger.warn(`❌ Invalid phone number: ${cleanPhone} (length: ${cleanPhone.length})`);
        }
      } catch (err) {
        this.logger.error(`Error processing phone number at index ${index}: ${err}`);
      }
    });

    this.logger.log(`Validated ${formatted.length} out of ${phoneNumbers.length} phone numbers`);
    return formatted;
  }

  /**
   * Test SMS functionality with a simple test message
   */
  async testSmsNotification(phoneNumber: string): Promise<boolean> {
    this.logger.log('=== Testing SMS Notification ===');
    this.logger.log(`Test phone number: ${phoneNumber}`);

    const testPayload: CommunicationTemplate = {
      slug: 'Marketing related-Others-Email-Wed Dec 03 2025 14:36:19 GMT+0000 (Coordinated Universal Time)',
      mail_to: [],
      sms_to: [phoneNumber],
      param: {
        recipientType: 'Test',
        recipientName: 'Test User',
        referrerName: 'Test Referrer',
        verificationUrl: 'https://test.com/verify',
        studentName: 'Test Student',
        enquiryId: 'TEST123',
        reminderCount: 1,
      },
    };

    return await this.sendNotification(testPayload, '', 'web');
  }
}