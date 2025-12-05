import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { LoggerService, NOTIFICATION_API_URLS } from '../utils';
import { AxiosService, EHttpCallMethods } from './service';

@Injectable()
export class EmailService {
  public enquiryDetails: Record<string, any>;
  private enquirerGlobalId: string;
  private employeeId: number;
  private loggerService: LoggerService;
  private axiosService: AxiosService;

  constructor() {
    this.loggerService = new LoggerService();
    this.axiosService = new AxiosService();
  }

  setEnquiryDetails(enquiryDetails: Record<string, any>) {
    this.enquiryDetails = enquiryDetails;
    return this;
  }

  private getEnquirerGlobalId(): string {
    switch (this.enquiryDetails.other_details.parent_type.toLowerCase()) {
      case 'father':
        this.enquirerGlobalId =
          this.enquiryDetails?.parent_details?.father_details?.global_id;
        break;
      case 'mother':
        this.enquirerGlobalId =
          this.enquiryDetails?.parent_details?.mother_details?.global_id;
        break;
      case 'guardian':
        this.enquirerGlobalId =
          this.enquiryDetails?.parent_details?.guardian_details?.global_id;
        break;
    }
    return this.enquirerGlobalId;
  }

  private getEmployeeId(): number {
    this.employeeId = this.enquiryDetails?.assigned_to_id;
    return this.employeeId;
  }

  async sendNotification(
    templateSlug: string,
    templateParams: Record<string, any>,
    toMail: string[],
    toMobile?: string[], // Added SMS support
  ): Promise<void> {

    const payload = {
      slug: templateSlug,
      to_mail: [...toMail],
      to_mobile: toMobile || [], 
      param: templateParams,
      // employee_ids: [this.getEmployeeId()],
      // global_ids: [this.getEnquirerGlobalId()]
    };
    console.log('mail_service_data___', payload)

    this.loggerService.log(
      `Sending Notification with the params : ${JSON.stringify(payload)}`,
    );

    try {
      const response = await this.axiosService
        .setBaseUrl(process.env.NOTIFICATION_URL)
        .setUrl(NOTIFICATION_API_URLS.SEND_NOTIFICATION)
        .setMethod(EHttpCallMethods.POST)
        .setBody(payload)
        .sendRequest();

      this.loggerService.log(
        `Send Notification response : ${JSON.stringify(response.data)}`,
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.loggerService.error(
          `Sent notification error message: ${JSON.stringify(error.message)}`,
          null,
        );
        if (error.response) {
          this.loggerService.error(
            `Sent notification error message: ${JSON.stringify(error.response.data)}`,
            null,
          );
        }
      } else {
        this.loggerService.error(
          `Sent notification error message: ${error}`,
          null,
        );
      }
    }
    return;
  }

  // Nikhil
  async sendReferralConfirmation(params: {
    toEmployeeId: string;
    toMobile?: string; // Optional mobile number
    enquiry: any;
  }) {

    const templateParams = {
      employeeName: 'employee.first_name',
      enquiryName: `${params.enquiry.first_name} ${params.enquiry.last_name}`,
    };
    if (params.toMobile) {
      await this.sendEmailAndSMS(
        'TRIAL_EMAIL',
        templateParams,
        [params.toEmployeeId],
        [params.toMobile],
      );
    } else {
      await this.sendEmail(
        'TRIAL_EMAIL',
        templateParams,
        [params.toEmployeeId],
      );
    }
  }

  //! Sanjeev
  // Send Email only
  async sendEmail(
    templateSlug: string,
    templateParams: Record<string, any>,
    toMail: string[],
  ): Promise<void> {
    this.loggerService.log(
      `Sending Mail with the params : ${JSON.stringify(toMail)}`,
    );
    return this.sendNotification(templateSlug, templateParams, toMail);
  }

  // Send SMS only
  async sendSMS(
    templateSlug: string,
    templateParams: Record<string, any>,
    toMobile: string[],
  ): Promise<void> {
    this.loggerService.log(
      `Sending SMS with the params : ${JSON.stringify(toMobile)}`,
    );
    return this.sendNotification(templateSlug, templateParams, undefined, toMobile);
  }

  // Send both Email and SMS
  async sendEmailAndSMS(
    templateSlug: string,
    templateParams: Record<string, any>,
    toMail: string[],
    toMobile: string[],
  ): Promise<void> {
    this.loggerService.log(
      `Sending SMS/Mail with the params : ${JSON.stringify(toMail, toMobile)}`,
    );
    return this.sendNotification(templateSlug, templateParams, toMail, toMobile);
  }
}
