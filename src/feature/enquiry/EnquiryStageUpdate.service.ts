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
import { ShortUrlService } from '../shortUrl/shorturl.service';
import { SmsReminderService } from '../referralReminder/smsReminder.service';

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
    private urlService: ShortUrlService,
    private smsReminderService: SmsReminderService,
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
          
          // Handle special enquiry types that need different processing
          if (this.enquiryDetails?.other_details?.enquiry_type === EEnquiryType.IVT) {
            await this.admissionService.sendUpdateAdmissionRequest(
              this.enquiryDetails._id.toString(),
              this.enquiryDetails?.enquiry_number,
              this.request,
              this.enquiryStages,
              EChangeAdmissionRequest.IVT
            );
            return;
          } else if (this.enquiryDetails?.other_details?.enquiry_type === EEnquiryType.ADMISSION_10_11) {
            await this.admissionService.sendUpdateAdmissionRequest(
              this.enquiryDetails._id.toString(),
              this.enquiryDetails?.enquiry_number,
              this.request,
              this.enquiryStages,
              EChangeAdmissionRequest.ADMISSION_10_11
            );
            return;
          } else if (this.enquiryDetails?.other_details?.enquiry_type === EEnquiryType.READMISSION) {
            await this.admissionService.sendUpdateAdmissionRequest(
              this.enquiryDetails._id.toString(),
              this.enquiryDetails?.enquiry_number,
              this.request,
              this.enquiryStages,
              EChangeAdmissionRequest.READMISSION
            );
            return;
          } else {
            // Mark stage as in progress
            this.enquiryStages[this.nextStageIndex].status = EEnquiryStageStatus.INPROGRESS;
            await this.enquiryRepository.updateById(this.enquiryDetails._id, {
              enquiry_stages: this.enquiryStages,
            });
            
            try {
              const {
                subject_details,
                student_id,
                opted_for_transport,
                transport_details,
              } = await this.admissionRepository.getOne({
                enquiry_id: this.enquiryDetails._id,
              });

              this.loggerService.log(
                `Admission Details :: ${JSON.stringify({ subject_details, student_id })}`,
              );

              if (!student_id) {
                this.loggerService.log(
                  `Proceeding to call create student profile as student id is ${student_id}`,
                );
                const studentDetails =
                  await this.admissionService.addStudentDetail(
                    this.enquiryDetails._id,
                    this.request,
                  );

                // Push the mapping of subjects to students
                const studentId =
                  studentDetails?.student_profile?.id ?? studentDetails?.id;
                const submitStudentMappingDataPromises = [];
                subject_details.forEach((subject) => {
                  console.log("subject data-", {
                          subject_id: subject.subject_id,
                          student_id: studentId,
                          academic_year:
                            studentDetails?.student_profile?.academic_year_id ??
                            subject?.academic_year_id,
                          selected_on: moment(new Date()).format('YYYY-MM-DD'),
                          selected_for: `${+this.enquiryDetails.academic_year.value.split('-')[0] + 1}-01-01`,
                          grade_id:
                            studentDetails?.student_profile?.crt_grade_id ??
                            studentDetails?.crt_grade_id,
                        },);
                  submitStudentMappingDataPromises.push(
                    this.mdmService.postDataToAPI(
                      MDM_API_URLS.SUBMIT_SUBJECT_DETAILS,
                      {
                        data: {
                          subject_id: subject.subject_id,
                          student_id: studentId,
                          academic_year:
                            studentDetails?.student_profile?.academic_year_id ??
                            subject?.academic_year_id,
                          selected_on: moment(new Date()).format('YYYY-MM-DD'),
                          selected_for: `${+this.enquiryDetails.academic_year.value.split('-')[0] + 1}-01-01`,
                          grade_id:
                            studentDetails?.student_profile?.crt_grade_id ??
                            studentDetails?.crt_grade_id,
                        },
                      },
                    ),
                  );
                });

                // Call to submit the documents submitted against the student enquiry
                submitStudentMappingDataPromises.push(
                  this.axiosService
                    .setBaseUrl(
                      this.configService.get<string>('ADMIN_PANEL_URL'),
                    )
                    .setUrl(ADMIN_API_URLS.MAP_STUDENT_DOCUMENTS)
                    .setMethod(EHttpCallMethods.POST)
                    .setHeaders({
                      Authorization: this.request.headers.authorization,
                    } as AxiosRequestHeaders)
                    .setBody({
                      student_id: studentId,
                      documents: this.enquiryDetails.documents,
                    })
                    .sendRequest(),
                );

                // Call transport service API to update the student id against student stop mapping
                if (
                  opted_for_transport &&
                  transport_details &&
                  this.configService.get<string>('NODE_ENV') !== 'production'
                ) {
                  await this.axiosService
                    .setBaseUrl(
                      this.configService.get<string>('TRANSPORT_PANEL_URL'),
                    )
                    .setUrl(
                      TRANSPORT_PANEL_URL.UPDATE_STUDENT_STOP_MAPPING(
                        this.enquiryDetails.enquiry_number,
                      ),
                    )
                    .setMethod(EHttpCallMethods.PATCH)
                    .setHeaders({
                      Authorization: this.request.headers.authorization,
                    } as AxiosRequestHeaders)
                    .setBody({
                      student_id: studentId,
                    })
                    .sendRequest();
                }

                await Promise.all(submitStudentMappingDataPromises);
              } else {
                this.loggerService.log(
                  `Student details have already been pushed against enquiry - ${this.enquiryDetails._id.toString()}`,
                );
              }

              // Afer student is created marking the Admission or Provisional Approval stage completed
              const admissionType = this.enquiryHelperService.getAdmissionType(
                this.enquiryDetails.documents,
              );
              this.enquiryStages[this.nextStageIndex].status =
                admissionType === EEnquiryAdmissionType.ADMISSION
                  ? EEnquiryStageStatus.ADMITTED
                  : EEnquiryStageStatus.PROVISIONAL_ADMISSION;

              // Fetch fresh enquiry data
              const enquiryData = await this.enquiryRepository.getById(
                new Types.ObjectId(this.enquiryDetails._id)
              );
              
              const token = this.request?.headers?.authorization?.replace('Bearer ', '') || '';
              const platform = 'web';

              // Get parent details
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

              // ================================================================
              // STEP 1: Send general admission notification (NOT referral-related)
              // ================================================================
              const hasReferralSource = 
                enquiryData.other_details?.enquiry_employee_source_id ||
                enquiryData.other_details?.enquiry_parent_source_id ||
                enquiryData.enquiry_school_source?.id ||
                enquiryData.other_details?.enquiry_corporate_source_id;

              if (hasReferralSource) {
                // ================================================================
                // STEP 2: Send BOTH initial email/SMS AND schedule reminders
                // ================================================================
                this.loggerService.log(`Referral source detected for enquiry: ${enquiryData.enquiry_number}`);
                
                try {
                  // ✅ This single function call will:
                  // 1. Generate short URLs ONCE per recipient
                  // 2. Send initial email to parent with admission notification
                  // 3. Send initial SMS to all recipients (parent + referrer)
                  // 4. Create reminder records in database for automated reminders
                  await this.referralReminderService.sendInitialNotificationAndScheduleReminders(
                    enquiryData,
                    token,
                    platform
                  );
                  
                  this.loggerService.log(`✅ Initial notifications sent and reminders scheduled successfully`);
                } catch (error) {
                  this.loggerService.error(
                    `Error in referral notification flow: ${error.message}`,
                    error.stack
                  );
                }
              } else {
                // ================================================================
                // STEP 3: No referral - send standard admission notification only
                // ================================================================
                this.loggerService.log(`No referral source found for enquiry: ${enquiryData.enquiry_number}`);
                
                try {
                  if (parentEmail) {
                    await this.notificationService.sendNotification(
                      {
                        slug: 'Marketing related-Others-Email-Thu Dec 04 2025 01:25:58 GMT+0000 (Coordinated Universal Time)',
                        employee_ids: [],
                        global_ids: [],
                        mail_to: [parentEmail],
                        sms_to: parentPhone ? [parentPhone.toString().slice(-10)] : [],
                        param: {
                          parentName: parentName,
                          studentName: studentName,
                          schoolName: enquiryData.school_location?.value,
                          academicYear: enquiryData.academic_year?.value,
                        }
                      },
                      token,
                      platform
                    );
                    
                    this.loggerService.log(`✅ Standard admission notification sent`);
                  }
                } catch (error) {
                  this.loggerService.error(`Error sending admission notification: ${error.message}`, error.stack);
                }
              }
              
            } catch (error) {
              console.error('Error in admission/referral notification flow:', error);
              this.loggerService.error(
                `Error in admission/referral notification flow: ${error.message}`,
                error.stack
              );
            }
          }
          break;
      }
    }

    await this.enquiryRepository.updateById(this.enquiryDetails._id, {
      enquiry_stages: this.enquiryStages,
    });
    return;
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
