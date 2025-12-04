import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestHeaders } from 'axios';
import { Request } from 'express';
import * as moment from 'moment';
import { Types } from 'mongoose';

import { EnquiryRepository } from '../../feature/enquiry/enquiry.repository';
import { TRANSPORT_PANEL_URL } from '../../global/global.constant';
import { AxiosService, EHttpCallMethods } from '../../global/service';
import {
  ADMIN_API_URLS,
  LoggerService,
  MDM_API_URLS,
  MdmService,
} from '../../utils';
import { AdmissionRepository } from '../admission/admission.repository';
import { AdmissionService } from '../admission/admission.service';
import { MyTaskService } from '../myTask/myTask.service';
import { WorkflowService } from '../workflow/workflow.service';
import { NO_OF_DAYS } from './enquiry.constant';
import {
  EEnquiryAdmissionType,
  EEnquiryStageStatus,
  EEnquiryType,
} from './enquiry.type';
import { EnquiryHelper } from './enquiryHelper.service';
import { EAdmissionApprovalStatus, EChangeAdmissionRequest } from '../admission/admission.type';
import { transporter } from './enquiryMailService';
import { ParentLoginLogService } from '../parentLoginLogs/parentLoginLogs.service';
import { ParentLoginEvent } from '../parentLoginLogs/parentLoginLogs.type';
import { EmailService } from '../../global/global.email.service';
import { NotificationService } from '../../global/notification.service';
import { ReferralReminderService } from '../referralReminder/referralReminder.service';

@Injectable({ scope: Scope.TRANSIENT })
export class EnquiryStageUpdateService {
  private nextStage: string;
  private nextStageIndex: number;
  private currentStage: string;
  private currentStageIndex: number;
  private enquiryDetails: Record<string, any>;
  private enquiryStages: {
    stage_id: Types.ObjectId;
    stage_name: string;
    status: string;
  }[];
  request: Request;

  constructor(
    private enquiryRepository: EnquiryRepository,
    private enquiryHelperService: EnquiryHelper,
    @Inject(forwardRef(() => AdmissionService))
    private admissionService: AdmissionService,
    private axiosService: AxiosService,
    private workflowService: WorkflowService,
    private myTaskService: MyTaskService,
    private loggerService: LoggerService,
    private parentLoginLogService: ParentLoginLogService,
    private mdmService: MdmService,
    private admissionRepository: AdmissionRepository,
    private configService: ConfigService,
    private emailService: EmailService,
    private notificationService: NotificationService,
    private referralReminderService: ReferralReminderService,
  ) {}

  async getEnquiryStages(enquiryId: string) {
    this.enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );
    this.enquiryStages = this.enquiryDetails.enquiry_stages;
    return this;
  }

  getNextStage(currentStage: string) {
    this.enquiryStages.forEach((enquiryStage, index) => {
      if (new RegExp(`^${currentStage}$`).test(enquiryStage.stage_name)) {
        this.currentStageIndex = index;
        this.currentStage = enquiryStage.stage_name;
      }
    });

    this.nextStage = this.enquiryStages[this.currentStageIndex + 1]
      ? this.enquiryStages[this.currentStageIndex + 1].stage_name
      : null;
    this.nextStageIndex = this.nextStage ? this.currentStageIndex + 1 : null;

    return this;
  }

  markCurrentStageCompleted() {
    
    switch (this.currentStage) {
      case 'Enquiry':
      case 'School visit':
      case 'Registration':
      case 'Academic Kit Selling':
      case 'Payment':
      case 'Admitted or Provisional Approval':
        this.enquiryStages[this.currentStageIndex].status =
          EEnquiryStageStatus.COMPLETED;
        return this;
      case 'Competency test':
        this.enquiryStages[this.currentStageIndex].status =
          EEnquiryStageStatus.PASSED;
        return this;
      case 'Admission Status':
        this.enquiryStages[this.currentStageIndex].status =
          EEnquiryStageStatus.APPROVED;
        return this;
      default:
        this.enquiryStages[this.currentStageIndex].status =
          EEnquiryStageStatus.COMPLETED;
        break;
    }
    return;
  }

  async updateCurrentAndNextStage() {
    if (this.nextStage) {
      switch (this.nextStage) {
        case 'School visit':
          this.nextStageIndex = this.nextStageIndex + 1;
          this.nextStage = this.enquiryStages[this.nextStageIndex].stage_name;
          return await this.updateCurrentAndNextStage();
        case 'Registration':
          this.markCurrentStageCompleted();
          this.enquiryStages[this.nextStageIndex].status =
            EEnquiryStageStatus.INPROGRESS;
          break;
        case 'Academic Kit Selling':
          this.markCurrentStageCompleted();
          // Call create registration fee function to send registration fee request to finance
          if (!this.enquiryDetails.registration_fee_request_triggered) {
            const feeCreateResponse =
              await this.enquiryHelperService.sendCreateRegistrationFeeRequest(
                this.enquiryDetails,
                this.request,
              );
            this.enquiryStages[this.nextStageIndex].status =
              EEnquiryStageStatus.INPROGRESS;
            if (feeCreateResponse?.status === HttpStatus.OK) {
              await this.enquiryRepository.updateById(this.enquiryDetails._id, {
                registration_fee_request_triggered: true,
              });
            }
          }
          break;
        case 'Competency test':
          this.markCurrentStageCompleted();
          await this.enquiryRepository.updateById(this.enquiryDetails._id, {
            is_registered: true,
          });
          break;
        case 'Admission Status':
          this.markCurrentStageCompleted();
          if (this.enquiryDetails.other_details.enquiry_type === 'readmission_10_11') {
            await this.admissionService.upsertAdmissionRecord(
              new Types.ObjectId(this.enquiryDetails._id),
              EAdmissionApprovalStatus.PENDING,
            );
          };
          this.enquiryStages[this.nextStageIndex].status =
            EEnquiryStageStatus.INPROGRESS;
          if (
            [
              EEnquiryType.PSA,
              EEnquiryType.KIDS_CLUB,
              EEnquiryType.IVT,
              EEnquiryType.ADMISSION_10_11
            ].includes(this.enquiryDetails?.other_details?.enquiry_type)
          ) {
            await this.enquiryRepository.updateById(this.enquiryDetails._id, {
              is_registered: true,
              registered_at: new Date(),
            });
          }
          if (
            [EEnquiryType.IVT, EEnquiryType.READMISSION, EEnquiryType.ADMISSION_10_11].includes(
              this.enquiryDetails?.other_details?.enquiry_type )
          ) {
            const previousEnrolmentDetails =
              await this.admissionService.getStudentDetailsByEnrolmentNumber(
                this.enquiryDetails?.student_details?.enrolment_number,
              );
            await this.workflowService.triggerWorkflow(
              {
                ...this.enquiryDetails,
                previousEnrolmentDetails: previousEnrolmentDetails,
              },
              null,
              this.request,
            );
          } else {
            await this.workflowService.triggerWorkflow(
              this.enquiryDetails,
              null,
              this.request,
            );
          }
          break;
        case 'Payment':
          /**
           * TODO :
           * 1. Create a empty admission record in admission collection
           * 2. Call create admission fee function to send admission fee request to finance based on the type of enquiry
           * */
          this.markCurrentStageCompleted();
          this.enquiryStages[this.nextStageIndex].status =
            EEnquiryStageStatus.INPROGRESS;
          break;
        case 'Admitted or Provisional Approval':
          // Marking the payment stage completed and Admission or Provisional Approval stage in progress
          this.markCurrentStageCompleted();
          if (
            this.enquiryDetails?.other_details?.enquiry_type ===
            EEnquiryType.IVT
          ) {
            await this.admissionService.sendUpdateAdmissionRequest(
              this.enquiryDetails._id.toString(),
              this.enquiryDetails?.enquiry_number,
              this.request,
              this.enquiryStages,
              EChangeAdmissionRequest.IVT
            );
            return
          } else if (this.enquiryDetails?.other_details?.enquiry_type === EEnquiryType.ADMISSION_10_11) {
            await this.admissionService.sendUpdateAdmissionRequest(
              this.enquiryDetails._id.toString(),
              this.enquiryDetails?.enquiry_number,
              this.request,
              this.enquiryStages,
              EChangeAdmissionRequest.ADMISSION_10_11
            );
            return
          } else if (this.enquiryDetails?.other_details?.enquiry_type === EEnquiryType.READMISSION) {
            await this.admissionService.sendUpdateAdmissionRequest(
              this.enquiryDetails._id.toString(),
              this.enquiryDetails?.enquiry_number,
              this.request,
              this.enquiryStages,
              EChangeAdmissionRequest.READMISSION
            );
            return
          } else {
            this.enquiryStages[this.nextStageIndex].status =
              EEnquiryStageStatus.INPROGRESS;
            await this.enquiryRepository.updateById(this.enquiryDetails._id, {
              enquiry_stages: this.enquiryStages,
            });
            try {
              // Fetch enquiry data
              let enquiryData = await this.enquiryRepository.getById(
                new Types.ObjectId(this.enquiryDetails._id)
              );

              const baseUrl = this.configService.get<string>('MARKETING_BASE_URL') || 
                'https://preprod-marketing-hubbleorion.hubblehox.com';

              // Extract authorization token from request
              const token = this.request.headers.authorization?.replace('Bearer ', '') || '';
              const platform = 'web';


              const parentType = enquiryData?.other_details?.parent_type || 'Father';
                
              const getParentDetails = () => {
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
              };

              const parentDetails = getParentDetails();
              const parentEmail = parentDetails?.email;
              const parentPhone = parentDetails?.mobile;
              const parentName = `${parentDetails?.first_name || ''} ${parentDetails?.last_name || ''}`.trim() || parentType;
              const studentName = `${enquiryData.student_details.first_name} ${enquiryData.student_details.last_name}`;

              //! Send INITIAL notification only
              await this.sendInitialAdmissionNotification(enquiryData);

              //! Employee Referral
              if (enquiryData.other_details?.enquiry_employee_source_id) {
                const employeeEmail = enquiryData.other_details.enquiry_employee_source_value;
                const employeePhone = enquiryData.other_details.enquiry_employee_source_number;
                const employeeName = enquiryData.other_details.enquiry_employee_source_name || 'Employee';

                const parentReferralUrl = `${baseUrl}/referral-view/?id=${this.enquiryDetails._id}&type=parent&action=referral`;
                const employeeReferrerUrl = `${baseUrl}/referral-view/?id=${this.enquiryDetails._id}&type=employee&action=referrer`;

                // Send notification to parent
                await this.notificationService.sendNotification(
                  {
                    slug: 'Marketing related-Others-Email-Wed Dec 03 2025 14:36:19 GMT+0000 (Coordinated Universal Time)',
                    employee_ids: [],
                    global_ids: [],
                    mail_to: [parentEmail],
                    sms_to: parentPhone ? [parentPhone.toString().slice(-10)] : [],
                    param: {
                      recipientType: 'Parent',
                      recipientName: parentName,
                      referrerName: employeeName,
                      verificationUrl: parentReferralUrl,
                      studentName: studentName,
                      enquiryId: this.enquiryDetails.enquiry_number.toString()
                    }
                  },
                  token,
                  platform
                );

                // Send notification to employee
                await this.notificationService.sendNotification(
                  {
                    slug: 'Marketing related-Others-Email-Wed Dec 03 2025 14:36:19 GMT+0000 (Coordinated Universal Time)',
                    employee_ids: [],
                    global_ids: [],
                    mail_to: [employeeEmail],
                    sms_to: employeePhone ? [employeePhone.toString().slice(-10)] : [],
                    param: {
                      recipientType: 'Employee',
                      recipientName: employeeName,
                      referrerName: employeeName,
                      verificationUrl: employeeReferrerUrl,
                      studentName: studentName,
                      parentName: parentName,
                      enquiryId: this.enquiryDetails.enquiry_number.toString()
                    }
                  },
                  token,
                  platform
                );

                this.loggerService.log(`Employee referral notifications sent for enquiry: ${this.enquiryDetails.enquiry_number}`);
              }

              //! Parent Referral
              else if (enquiryData.other_details?.enquiry_parent_source_id) {
                const referrerParentEnquiryId = enquiryData.other_details.enquiry_parent_source_id;
                let referrerParentEnquiryData = await this.enquiryRepository.getById(
                  new Types.ObjectId(referrerParentEnquiryId)
                );

                const referrerParentDetails =
                  referrerParentEnquiryData?.parent_details?.father_details ||
                  referrerParentEnquiryData?.parent_details?.mother_details ||
                  referrerParentEnquiryData?.parent_details?.guardian_details;

                const referrerParentEmail = referrerParentDetails?.email;
                const referrerParentPhone = enquiryData.other_details.enquiry_parent_source_value;
                const referrerParentName = `${referrerParentDetails?.first_name || ''} ${referrerParentDetails?.last_name || ''}`.trim() || 'Referring Parent';

                const parentReferralUrl = `${baseUrl}/referral-view/?id=${this.enquiryDetails._id}&type=parent&action=referral`;
                const referrerUrl = `${baseUrl}/referral-view/?id=${this.enquiryDetails._id}&type=referringparent&action=referrer`;

                // Send to parent (referral)
                await this.notificationService.sendNotification(
                  {
                    slug: 'Marketing related-Others-Email-Wed Dec 03 2025 14:36:19 GMT+0000 (Coordinated Universal Time)',
                    employee_ids: [],
                    global_ids: [],
                    mail_to: [parentEmail],
                    sms_to: parentPhone ? [parentPhone.toString().slice(-10)] : [],
                    param: {
                      recipientType: 'Parent',
                      recipientName: parentName,
                      referrerName: referrerParentName,
                      verificationUrl: parentReferralUrl,
                      studentName: studentName,
                      enquiryId: this.enquiryDetails.enquiry_number.toString()
                    }
                  },
                  token,
                  platform
                );

                // Send to referring parent
                await this.notificationService.sendNotification(
                  {
                    slug: 'Marketing related-Others-Email-Wed Dec 03 2025 14:36:19 GMT+0000 (Coordinated Universal Time)',
                    employee_ids: [],
                    global_ids: [],
                    mail_to: [referrerParentEmail],
                    sms_to: referrerParentPhone ? [referrerParentPhone.toString().slice(-10)] : [],
                    param: {
                      recipientType: 'Referring Parent',
                      recipientName: referrerParentName,
                      referrerName: referrerParentName,
                      verificationUrl: referrerUrl,
                      studentName: studentName,
                      enquiryId: this.enquiryDetails.enquiry_number.toString()
                    }
                  },
                  token,
                  platform
                );

                this.loggerService.log(`Parent referral notifications sent for enquiry: ${this.enquiryDetails.enquiry_number}`);
              }

              //! Preschool Referral
              else if (enquiryData.enquiry_school_source?.id) {
                const preschoolSpocEmail = enquiryData.enquiry_school_source?.spoc_email;
                const preschoolName = enquiryData.enquiry_school_source?.value || 'Preschool';
                const schoolPhone = enquiryData.enquiry_school_source?.spoc_mobile_no;

                const parentReferralUrl = `${baseUrl}/referral-view/?id=${this.enquiryDetails._id}&type=parent&action=referral`;
                const schoolReferrerUrl = `${baseUrl}/referral-view/?id=${this.enquiryDetails._id}&type=referringschool&action=referrer`;

                // Send to parent
                await this.notificationService.sendNotification(
                  {
                    slug: 'Marketing related-Others-Email-Wed Dec 03 2025 14:36:19 GMT+0000 (Coordinated Universal Time)',
                    employee_ids: [],
                    global_ids: [],
                    mail_to: [parentEmail],
                    sms_to: parentPhone ? [parentPhone.toString().slice(-10)] : [],
                    param: {
                      recipientType: 'Parent',
                      recipientName: parentName,
                      referrerName: preschoolName,
                      verificationUrl: parentReferralUrl,
                      studentName: studentName,
                      enquiryId: this.enquiryDetails.enquiry_number.toString()
                    }
                  },
                  token,
                  platform
                );

                // Send to school
                await this.notificationService.sendNotification(
                  {
                    slug: 'Marketing related-Others-Email-Wed Dec 03 2025 14:36:19 GMT+0000 (Coordinated Universal Time)',
                    employee_ids: [],
                    global_ids: [],
                    mail_to: [preschoolSpocEmail],
                    sms_to: schoolPhone ? [schoolPhone.toString().slice(-10)] : [],
                    param: {
                      recipientType: 'School Team',
                      recipientName: preschoolName,
                      referrerName: preschoolName,
                      verificationUrl: schoolReferrerUrl,
                      studentName: studentName,
                      parentName: parentName,
                      enquiryId: this.enquiryDetails.enquiry_number.toString()
                    }
                  },
                  token,
                  platform
                );

                this.loggerService.log(`Preschool referral notifications sent for enquiry: ${this.enquiryDetails.enquiry_number}`);
              }

              //! Corporate Referral
              else if (enquiryData.other_details?.enquiry_corporate_source_id) {
                const corporateSpocEmail = enquiryData.other_details?.enquiry_corporate_source_email;
                const corporateName = enquiryData.other_details?.enquiry_corporate_source_name || 'Corporate';
                const corporatePhone = enquiryData.other_details?.enquiry_corporate_source_number;

                const parentReferralUrl = `${baseUrl}/referral-view/?id=${this.enquiryDetails._id}&type=parent&action=referral`;
                const corporateReferrerUrl = `${baseUrl}/referral-view/?id=${this.enquiryDetails._id}&type=referringcorporate&action=referrer`;

                // Send to parent
                await this.notificationService.sendNotification(
                  {
                    slug: 'Marketing related-Others-Email-Wed Dec 03 2025 14:36:19 GMT+0000 (Coordinated Universal Time)',
                    employee_ids: [],
                    global_ids: [],
                    mail_to: [parentEmail],
                    sms_to: parentPhone ? [parentPhone.toString().slice(-10)] : [],
                    param: {
                      recipientType: 'Parent',
                      recipientName: parentName,
                      referrerName: corporateName,
                      verificationUrl: parentReferralUrl,
                      studentName: studentName,
                      enquiryId: this.enquiryDetails.enquiry_number.toString()
                    }
                  },
                  token,
                  platform
                );

                // Send to corporate
                await this.notificationService.sendNotification(
                  {
                    slug: 'Marketing related-Others-Email-Wed Dec 03 2025 14:36:19 GMT+0000 (Coordinated Universal Time)',
                    employee_ids: [],
                    global_ids: [],
                    mail_to: [corporateSpocEmail],
                    sms_to: corporatePhone ? [corporatePhone.toString().slice(-10)] : [],
                    param: {
                      recipientType: 'Corporate Team',
                      recipientName: corporateName,
                      referrerName: corporateName,
                      verificationUrl: corporateReferrerUrl,
                      studentName: studentName,
                      parentName: parentName,
                      enquiryId: this.enquiryDetails.enquiry_number.toString()
                    }
                  },
                  token,
                  platform
                );

                this.loggerService.log(`Corporate referral notifications sent for enquiry: ${this.enquiryDetails.enquiry_number}`);
              }

              try {
                await this.referralReminderService.createReminderRecords(enquiryData);
                this.loggerService.log(`Referral reminders sent for enquiry: ${this.enquiryDetails.enquiry_number}`);
              } catch (error) {
                this.loggerService.error(`Error sending referral reminders: ${error.message}`, error.stack,);
              }
            } catch (error) {
              console.error('Error sending referral notifications:', error);
              this.loggerService.error(
                `Error sending referral notifications: ${JSON.stringify(error)}`,
                error.stack
              );
            }
          }
          break;
        default:
          this.markCurrentStageCompleted();
          this.enquiryStages[this.nextStageIndex].status =
            EEnquiryStageStatus.INPROGRESS;
          break;
      }
    }

    await this.enquiryRepository.updateById(this.enquiryDetails._id, {
      enquiry_stages: this.enquiryStages,
    });
    return;
  }
  sendInitialAdmissionNotification(enquiryData: Record<string, any>) {
    throw new Error('Method not implemented.');
  }

  async moveToNextStage(
    enquiryId: string,
    currentStage: string,
    req: Request = null,
  ) {
    this.request = req;
    const classObject = await this.getEnquiryStages(enquiryId);
    classObject.getNextStage(currentStage);
    await this.myTaskService.closePastStagesTasks(enquiryId, this.currentStage);
    await classObject.updateCurrentAndNextStage();
    // Logs
    this.loggerService.log(
      `[Move to Next Stage][EnquiryId - ${this.enquiryDetails._id.toString()}][Current Stage - ${this.currentStage}][Current Stage Index - ${this.currentStageIndex}][Current Stage Status - ${this.enquiryStages[this.currentStageIndex].status}]`,
    );
    this.loggerService.log(
      `[Move to Next Stage][EnquiryId - ${this.enquiryDetails._id.toString()}][Next Stage - ${this.nextStage}][Next Stage Index - ${this.nextStageIndex}][Next Stage Status - ${this.enquiryStages[this.nextStageIndex].status}]`,
    );
  }

   async sendSMS(phone: number, message: string, studentId: any = null) {
      const options: any = await this.smsGatewayOptions();
      try {
        const res = await axios.get(
          `${options.url}?APIKey=${options.key}&senderid=VIBSMS&channel=2&DCS=0&flashsms=0&number=${phone}&text=${message}&route=49`,
        );
  
        // await this.parentLoginLogService.createLog({
        //   studentId: studentId || "0",
        //   event: ParentLoginEvent.SMS,
        //   action: `Referral notification sent to ${phone}`,
        //   log_data: { action : 'sms' },
        // });
        return res.data;
      } catch (err: any) {
        return {
          status: 'error',
          details: JSON.stringify(err),
          id: '500',
        };
      }
    }

     async smsGatewayOptions() {
    return {
      url: process.env.SMS_URL,
      key: process.env.SMS_API_KEY,
    };
  }
}
