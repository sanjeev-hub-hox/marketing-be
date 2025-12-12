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

  async smsGatewayOptions() {
    return {
      url: process.env.SMS_URL,
      key: process.env.SMS_API_KEY,
    };
  }

  /**
   * Send SMS using direct SMS gateway
   * Fallback method for when notification service is unavailable
   */
  async sendDirectSMS(phone: string, message: string): Promise<boolean> {
    try {
      const smsUrl = process.env.SMS_URL;
      const smsApiKey = process.env.SMS_API_KEY;

      if (!smsUrl || !smsApiKey) {
        this.logger.error('❌ SMS gateway credentials not configured');
        this.logger.error('Please set SMS_URL and SMS_API_KEY in your .env file');
        return false;
      }

      // Ensure phone number is in correct format (last 10 digits)
      const formattedPhone = phone.toString().slice(-10);

      console.log('message_data_____', message);
      const options: any = await this.smsGatewayOptions();
      const encodedMsg = encodeURIComponent(message);

      console.log('encodedMsg_____', encodedMsg);
      console.log('url and key_____',`${options.url}?APIKey=${options.key}&senderid=VIBSMS&channel=2&DCS=0&flashsms=0&number=${phone}&text=${encodedMsg}&route=49`, options.key);
      const smsRequest = await fetch(
        `${options.url}?APIKey=${options.key}&senderid=VIBSMS&channel=2&DCS=0&flashsms=0&number=${phone}&text=${message}&route=49`
      );
      const res = await smsRequest.json();
      console.log('sendSMS_res-',res);

      console.log(`[SMS] 📱 Attempting to send to ${formattedPhone}`);
      console.log(`[SMS] Message: ${message.substring(0, 100)}...`);



      // console.log(`[SMS] Response Status: ${response.status}`);
      // console.log(`[SMS] Response Data: ${JSON.stringify(response.data)}`);

      // Check for common error codes
      // if (data?.ErrorCode) {
      //   const errorCode = data.ErrorCode;
      //   const errorMessage = data.ErrorMessage;
        
      //   console.log(`[SMS] ❌ SMS Gateway Error Code: ${errorCode}`);
      //   console.log(`[SMS] ❌ SMS Gateway Error Message: ${errorMessage}`);
        
      //   // Provide specific error guidance
      //   switch (errorCode) {
      //     case '11':
      //       this.logger.error('[SMS] 🔒 IP ADDRESS RESTRICTION');
      //       this.logger.error('[SMS] Solution: Contact your SMS gateway provider to whitelist your server IP');
      //       this.logger.error(`[SMS] Your server IP might be visible in the gateway logs or run: curl ifconfig.me`);
      //       break;
      //     case '12':
      //       this.logger.error('[SMS] Invalid API Key');
      //       break;
      //     case '13':
      //       this.logger.error('[SMS] Invalid Phone Number');
      //       break;
      //     default:
      //       this.logger.error(`[SMS] Unknown error code: ${errorCode}`);
      //   }
        
      //   return false;
      // }

      // // Success case
      // if (data?.JobId) {
      //   this.logger.log(`[SMS] ✅ SMS sent successfully. JobId: ${data?.JobId || 'N/A'}`);
      //   return true;
      // }

      // this.logger.warn(`[SMS] ⚠️ Unexpected response format: ${JSON.stringify(data)}`);
      // return false;

    } catch (error) {
      this.logger.error(`[SMS] ❌ Exception while sending SMS: ${error.message}`);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          this.logger.error('[SMS] Cannot connect to SMS gateway - Check SMS_URL');
        } else if (error.code === 'ETIMEDOUT') {
          this.logger.error('[SMS] SMS gateway request timeout');
        } else if (error.response) {
          this.logger.error(`[SMS] Gateway returned: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        }
      }
      
      return false;
    }
  }
}