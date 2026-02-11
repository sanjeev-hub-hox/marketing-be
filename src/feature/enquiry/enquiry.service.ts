import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuditLogRepository,
  EStorageType,
  HTTP_METHODS,
  mongodbPaginationQuery,
  RedisService,
  StorageService,
} from 'ampersand-common-module';
import axios, { AxiosRequestHeaders } from 'axios';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';
import { formatToTimeZone } from 'date-fns-timezone';
import { Request } from 'express';
import * as fs from 'fs';
import * as moment from 'moment';
import { Document, PipelineStage, Types } from 'mongoose';
import * as xlsx from 'node-xlsx';

import {
  ADMIN_PANEL_URL,
  EMAIL_TEMPLATE_SLUGS,
} from '../../global/global.constant';
import { EmailService } from '../../global/global.email.service';
import { AxiosService, EHttpCallMethods } from '../../global/service';
import { CreatedByDetailsDto } from '../../middleware/auth/auth.dto';
import {
  ADMIN_API_URLS,
  ALL_LEADS_PERMISSION,
  buildFilter,
  EMPLOYEE_ACTIVITY_STATUS,
  extractCreatedByDetailsFromBody,
  FRONTEND_STANDALONE_PAGES_URL,
  getCcReHrisCodes,
  getSdoRoleCodes,
  LoggerService,
  MdmService,
} from '../../utils';
import { MDM_API_URLS } from '../../utils';
import {
  applyTemplate,
  getSessionData,
  isAppRequest,
} from '../../utils/utility-functions';
import { AdmissionRepository } from '../admission/admission.repository';
import { AdmissionService } from '../admission/admission.service';
import { EAdmissionApprovalStatus, EFeeType } from '../admission/admission.type';
import { CsvService } from '../csv/csv.service';
import { EnquiryLogRepository } from '../enquiryLog/enquiryLog.repository';
import { EnquiryLogService } from '../enquiryLog/enquiryLog.service';
import {
  EEnquiryEvent,
  EEnquiryEventSubType,
  EEnquiryEventType,
} from '../enquiryLog/enquiryLog.type';
import { EnquiryStageRepository } from '../enquiryStage/enquiryStage.repository';
import { EnquiryTypeService } from '../enquiryType/enquiryType.service';
import { FileService } from '../file/file.service';
import { MyTaskService } from '../myTask/myTask.service';
import { ETaskEntityType } from '../myTask/myTask.type';
import { ParentLoginLogService } from '../parentLoginLogs/parentLoginLogs.service';
import { ParentLoginEvent } from '../parentLoginLogs/parentLoginLogs.type';
import { PdfService } from '../pdf/pdf.service';
import { WorkflowService } from '../workflow/workflow.service';
import { MasterFieldDto } from './app/dto';
import { UpdateIvtEnquiryStatusDto } from './dto';
import { FilterItemDto, TransferEnquiryRequestDto } from './dto/apiResponse.dto';
import { GrReportFilterDto } from './dto/gr-report-filter.dto';
import {
  EnquiryDetails,
  GetMergeDto,
  PostMergeDto,
} from './dto/mergeEnquiry.dto';
import { CheckFeePayload, UpdateAdmissionDto } from './dto/updateAdmission.dto';
import {
  AdmissionStatus,
  ENQUIRY_PRIORITY,
  ENQUIRY_STAGES,
  ENQUIRY_TYPE,
  ENQUIRY_TYPE_SLUG,
  enquiryGlobalSearchFields,
  GLOBAL_ENQUIRY_GENERATOR_ID,
  STATE_AGE_MAPPING,
} from './enquiry.constant';
import { EnquiryRepository } from './enquiry.repository';
import { EnquiryDocument } from './enquiry.schema';
import {
  EEnquiryAdmissionType,
  EEnquiryStageStatus,
  EEnquiryStatus,
  EEnquiryType,
  EParentType,
  EPaymentType,
  RoundRobinAssignedStatus,
} from './enquiry.type';
import { EnquiryHelper } from './enquiryHelper.service';
import { EnquiryStageUpdateService } from './EnquiryStageUpdate.service';
import { transporter } from './enquiryMailService';
import { JobShadulerService } from '../jobShaduler/jobShaduler.service';
// import { AppRegistrationService } from '../registration/app/appRegistration.service';
import { ReferralReminderService } from '../referralReminder/referralReminder.service';
import { VerificationTrackerService } from '../referralReminder/verificationTracker.service';
import { FEETYPES } from '../admission/admission.dto';

@Injectable()
export class EnquiryService {
  smsReminderService: any;
  constructor(
    private enquiryRepository: EnquiryRepository,
    private jobShadulerService: JobShadulerService,
    private enquiryHelper: EnquiryHelper,
    private storageService: StorageService,
    private enquiryLogService: EnquiryLogService,
    private enquiryLogRepository: EnquiryLogRepository,
    private enquiryStageRepository: EnquiryStageRepository,
    private parentLoginLogService: ParentLoginLogService,
    private configService: ConfigService,
    private auditLogRepository: AuditLogRepository,
    private enquiryTypeService: EnquiryTypeService,
    @Inject(forwardRef(() => AdmissionService))
    private admissionService: AdmissionService,
    // private registrationService: AppRegistrationService,
    private mdmService: MdmService,
    private axiosService: AxiosService,
    private admissionRepository: AdmissionRepository,
    private enquiryStageUpdateService: EnquiryStageUpdateService,
    private workflowService: WorkflowService,
    private myTaskService: MyTaskService,
    private pdfService: PdfService,
    private fileService: FileService,
    private loggerService: LoggerService,
    private csvService: CsvService,
    private emailService: EmailService,
    private referralReminderService: ReferralReminderService,
    private verificationTrackerService: VerificationTrackerService,
    @Inject('REDIS_INSTANCE') private redisInstance: RedisService,
    @InjectQueue('admissionFees') private admissionFeeQueue: Queue,
  ) {
    // console.log(this.checkIfFeeAttached({},req));
  }
  private async processFeesAndPayment(
    enquiryId: string,
    payload: CheckFeePayload,
    req: any,
  ) {


  }

  async getDuplicateEnquiries(payload) {
    const enquiryDetails = await this.enquiryRepository.aggregate([
      {
        $match: {
          $or: [
            {"parent_details.father_details.email": payload.email},
            {"parent_details.father_details.mobile": payload.phone},
            {"parent_details.mother_details.email": payload.email},
            {"parent_details.mother_details.mobile": payload.phone},
            {"parent_details.guardian_details.email": payload.email},
            {"parent_details.guardian_details.mobile": payload.phone},
          ]
        },
      },
      {
        $project: {
          enquiry_number: 1
        }
      },
    ]);
    if (!enquiryDetails.length) {
      throw new HttpException('Enquiry not found', HttpStatus.NOT_FOUND);
    }

    return enquiryDetails;
  }

  private async processNewFees(
    enquiryDetails: any,
    payload: CheckFeePayload,
    req: any,
  ) {

    const enquiryId = enquiryDetails?._id;
    const RegistrationFeesStatus = enquiryDetails.enquiry_stages.find(s => s.stage_name === "Academic Kit Selling")?.status;
    const admissionFeesStatus = enquiryDetails.enquiry_stages.find(s => s.stage_name === "Admission Status")?.status;
    const paymentFeeStatus = enquiryDetails.enquiry_stages.find(s => s.stage_name === "Payment")?.status;

    if (RegistrationFeesStatus == 'In Progress') {
      // Extract year from academic_year value (e.g., "AY 2024 - 25" -> "2024")
      const currentYear = enquiryDetails.academic_year?.value;
      const newYear = payload.academicYearId?.value;

      if (currentYear && newYear && currentYear !== newYear) {
         return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Enquiry cannot be transferred to a different academic year during the Academic Kit Selling stage.',
        };
      }

      await this.performBulkDeEnrollment(enquiryDetails, enquiryId, payload, req);
      await this.enquiryRepository.updateOne({ _id: enquiryId }, { $set: { registration_fee_request_triggered: false } });
      const newUrl = process.env.FINANCE_URL;

      let response: any;
      let feesList = [];
      try {
        const fetchResponse: any = await fetch(
          `${newUrl}/fee_collection/fee_details`,
          {
            method: 'POST',
            headers: {
              Authorization: req.headers.authorization,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'all_fees',
              students: [enquiryId],
              // Robust extraction: try splitting "AY 27" -> "27", or fall back to the raw value or ID
              academic_years: [enquiryDetails.academic_year?.value?.split(' ')?.pop() || enquiryDetails.academic_year?.id?.toString()],
            }),
          },
        );
        response = await fetchResponse.json();
        feesList = response?.data?.fees?.[enquiryId]?.[enquiryDetails.academic_year?.value] || [];
      } catch (error) {
        this.loggerService.error('Err occured while fetching fee details', error);
        feesList = []; // Default to empty to trigger fee attachment if verification fails
      }
      
      const registrationFess = feesList?.filter(fee => fee.fee_type_id === FEETYPES.registration_fees);

      // Scenario: Attach if MISSING (!length) or PARTIALLY PAID. Skip if FULLY PAID.
      if (!registrationFess?.length || (registrationFess[0]?.amount !== registrationFess[0]?.paid)) {
        const updatedEnquiryForFee = {
          ...enquiryDetails,
          // Use school_location if provided, otherwise fall back to school, then existing value
          school_location: payload.school_location || enquiryDetails.school_location,
          brand: payload.brand,
          board: payload.board,
          grade: payload.grade,
          course: payload.course,
          shift: payload.shift,
          stream: payload.stream,
          academic_year: payload.academicYearId,
          student_details: {
            ...enquiryDetails.student_details,
            grade: payload.grade
          },
          // Use guestHostSchool if provided (optional), otherwise fall back to guest_school
          guest_student_details: (payload.guestHostSchool) ? {
            location: payload.guestHostSchool
          } : enquiryDetails.guest_student_details
        };
        
        await this.enquiryHelper.sendCreateRegistrationFeeRequest(updatedEnquiryForFee, req);
      }
    }
    if (admissionFeesStatus == 'In Progress' || admissionFeesStatus == 'Pending' || admissionFeesStatus == 'Approved' || paymentFeeStatus == 'In Progress') {
      const workflowLog = await this.enquiryRepository.getWorkflowLogByReferenceId(enquiryDetails.enquiry_number);
      if (workflowLog) {
        await this.axiosService
          .setBaseUrl(process.env.ADMIN_PANEL_URL)
          .setUrl('workflow/disable-workflow')
          .setMethod(EHttpCallMethods.POST)
          .setHeaders({ Authorization: req.headers.authorization } as AxiosRequestHeaders)
          .setBody({ workflow_log_id: workflowLog._id.toString() })
          .sendRequest();
      }
      await this.enquiryRepository.updateOne({ _id: enquiryId }, { 
        $set: { 
          admission_fee_request_triggered: false,
          'enquiry_stages.$[payment].status': EEnquiryStageStatus.OPEN,
          'enquiry_stages.$[admission].status': EEnquiryStageStatus.PENDING 
        } 
      }, {
        arrayFilters: [
          { 'payment.stage_name': 'Payment' },
          { 'admission.stage_name': 'Admission Status' }
        ]
      });
      // Update enquiry details with new transfer values for workflow and fee request
      const updatedEnquiryForFee = {
        ...enquiryDetails,
        // Use school_location if provided, otherwise fall back to existing value
        school_location: payload.school_location || enquiryDetails.school_location,
        brand: payload.brand,
        board: payload.board,
        grade: payload.grade,
        course: payload.course,
        shift: payload.shift,
        stream: payload.stream,
        academic_year: payload.academicYearId,
        student_details: {
          ...enquiryDetails.student_details,
          grade: payload.grade
        },
        // Use guestHostSchool if provided (optional), otherwise fall back to guest_school
        guest_student_details: (payload.guestHostSchool || payload.guest_school) ? {
          location: payload.guestHostSchool || payload.guest_school
        } : enquiryDetails.guest_student_details
      };
      await this.workflowService.triggerWorkflow(updatedEnquiryForFee, null, req);
      
      // Fix: Follow the pattern of sendCreateRegistrationFeeRequest to ensure fee_type is valid
      // We manually set a valid default fee object to prevent 'fee_type as undefined'
      await this.admissionRepository.updateByEnquiryId(new Types.ObjectId(enquiryId), {
        $set: { 
          'default_fees.0': { 
            fee_type_slug: EFeeType.ADMISSION,
            fee_sub_type_id: 3 
          },
          admission_fee_request_triggered: false 
        }
      });
      await this.performBulkDeEnrollment(enquiryDetails, enquiryId, payload, req);
      // we dont have to attach the admission fee...
      // await this.admissionService.sendCreateAdmissionPaymentRequest(updatedEnquiryForFee, req.headers.authorization);
    }

    // if(paymentFeeStatus == 'In Progress'){

    //   // Update enquiry details with new transfer values for workflow and fee request
    //   const updatedEnquiryForFee = {
    //     ...enquiryDetails,
    //     // Use school_location if provided, otherwise fall back to school, then existing value
    //     school_location: payload.school_location || enquiryDetails.school_location,
    //     brand: payload.brand,
    //     board: payload.board,
    //     grade: payload.grade,
    //     course: payload.course,
    //     shift: payload.shift,
    //     stream: payload.stream,
    //     academic_year: payload.academicYearId,
    //     student_details: {
    //       ...enquiryDetails.student_details,
    //       grade: payload.grade
    //     },
    //     // Use guestHostSchool if provided (optional), otherwise fall back to guest_school
    //     guest_student_details: (payload.guestHostSchool || payload.guest_school) ? {
    //       location: payload.guestHostSchool || payload.guest_school
    //     } : enquiryDetails.guest_student_details
    //   };
    //   await this.workflowService.triggerWorkflow(updatedEnquiryForFee, null, req);
      
    //   // Fix: Follow the pattern of sendCreateRegistrationFeeRequest to ensure fee_type is valid
    //   await this.admissionRepository.updateByEnquiryId(new Types.ObjectId(enquiryId), {
    //       admission_fee_request_triggered: false, 
    //   });

    //   // await this.admissionService.sendCreateAdmissionPaymentRequest(updatedEnquiryForFee, req.headers.authorization);
    // }
  }

  async checkIfFeeAttached(payload: CheckFeePayload, req: any) {
    try {
      const enquiryDetails = await this.enquiryRepository.getByEnquiryNumber(
        payload.enquiry_number,
      );

      await this.updateEnquiryDetails(enquiryDetails._id, payload);

      await this.processNewFees(
        enquiryDetails,
        payload,
        req,
      );

    } catch (error) {
      console.error('Error in checkIfFeeAttached:', {
        enquiryNumber: payload.enquiry_number,
        error: error.message,
        stack: error.stack,
      });
      throw new HttpException(
        'Invalid field value',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  }
  private async updateEnquiryDetails(
    enquiryId: string,
    payload: CheckFeePayload,
  ) {
    const objectId = new Types.ObjectId(enquiryId);

    const result = await this.enquiryRepository.updateOne(
      { _id: objectId },
      {
        $set: {
          brand: { id: payload.brand.id, value: payload.brand.value },
          academic_year: { id: payload.academicYearId.id, value: payload.academicYearId.value },
          board: { id: payload.board.id, value: payload.board.value },
          course: { id: payload.course.id, value: payload.course.value },
          stream: { id: payload.stream.id, value: payload.stream.value },
          shift: { id: payload.shift.id, value: payload.shift.value },
          'student_details.grade': {
            id: payload.grade.id,
            value: payload.grade.value,
          },
          school_location: {
            id: payload.school.id, // Fixed: should be school.id, not grade.id
            value: payload.school.value,
          },
        },
      },
    );

    return result;
  }



  private async getStudentFeeDetails(enquiryData, enquireId, req, payload) {
    const enquire_id = enquireId.toHexString();
    let idArray: any = [];
    const newUrl = process.env.FINANCE_URL;
    const yeartId = enquiryData.academic_year.value.split(' - ')[1];
    const yeartValue = enquiryData.academic_year.value;
    console.log('feeData', {
      type: 'pending',
      students: [enquire_id],
      // academic_years: [yeartId],
    },);

        console.log('feeData', {
      type: 'pending',
      students: [enquire_id],
      academic_years: [yeartId],
    },);    console.log(`${newUrl}/fee_collection/fee_details`);

    console.log(req.headers.authorization);

const response = await fetch(
  `${newUrl}/fee_collection/fee_details`,
  {
    method: 'POST',
    headers: {
      Authorization: req.headers.authorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'pending',
      students: [enquire_id],
      academic_years: [yeartId],
    }),
  },
);

if (!response.ok) {
  throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
}
console.log(JSON.stringify(response));

const feeData = await response.json();
    console.log('feeData', feeData);

    if (feeData.status !== 200) {
      console.error(`fee detail with status: ${feeData.status}`);
      throw new HttpException(
        'Something went wrong in fee detail',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    console.log('feeData1', feeData?.data?.fees);
    console.log('feeData2', feeData?.data?.fees?.[enquire_id]);


    if (!feeData?.data?.fees?.[enquire_id]) {
      return idArray;
    }

    console.log('feeData5', yeartValue, enquire_id);

    const data = feeData?.data?.fees?.[enquire_id][yeartValue];
    idArray = data.map((item) => item.id.toString());
    console.log('idArray', idArray);

    if (idArray.length == 0) {
      return idArray;
    }

    return idArray;
  }

  private async performBulkDeEnrollment(enquiryData, enquireId, payload, req) {
    const feeIds = await this.getStudentFeeDetails(enquiryData, enquireId, req, payload);
    console.log('feeIds', feeIds);

    const newUrl = process.env.FINANCE_URL;

    if (feeIds.length == 0) {
      return;
    }
    const reasonData = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.DE_ENROLL_REASONS}?filters%5Bname%5D=Different%20Combination%20Requried'`,
    );

    const reasonId = Number(reasonData?.data[0]?.id);
    console.log('feeIds2', feeIds);

    await Promise.allSettled(
      feeIds.map(async (feeId) => {
        try {
          console.log('allSettled', feeId);

          const res = await axios.post(
            `${newUrl}/student-fees/bulk-deenrolment`,
            {
              student_fees_id: [feeId],
              reason_id: reasonId || 152,
            },
            {
              headers: {
                Authorization: req.headers.authorization,
                "Content-Type": "application/json",
              },
            }
          );

          return { feeId, success: true, data: res.data };
        } catch (err) {
          console.error(`Error for feeId ${feeId} →`, err.message);

          // IMPORTANT: return a success object instead of throwing
          return { feeId, success: false, error: err.message };
        }
      })
    );

    return;
  }

  // Helper method to normalize phone numbers
  private normalizePhone(phone: any): string {
    if (!phone) return '';
    // Convert to string first, then remove all non-digit characters
    const phoneStr = String(phone).replace(/\D/g, '');
    // Get last 10 digits (to handle country codes)
    return phoneStr.slice(-10);
  }

  // Helper method to calculate referral status
  private calculateReferralStatus(enquiry: any, parentNumber: string): string {
    const od = enquiry.other_details || {};

    // ✅ PRIORITY 1: Check for manual rejection first
    if (od.manuallyRejectedData?.manuallyRejected) {
      return 'Rejected';
    }

    // ✅ PRIORITY 2: Check for manual verification (HIGHEST PRIORITY)
    if (od.manuallyVerifiedData?.manuallyVerified) {
      return 'Both Verified';
    }

    // Rest of your existing logic for automatic verification
    const referrerVerified = od.referrer?.verified || false;
    const referralVerified = od.referral?.verified || false;

    if (referrerVerified && referralVerified) {
      return 'Both Verified';
    }

    if (referrerVerified && !referralVerified) {
      return 'Referrer Verified';
    }

    if (!referrerVerified && referralVerified) {
      return 'Referral Verified';
    }

    // Check for phone mismatch
    const normalizePhone = (phone: string): string => {
      if (!phone) return '';
      return phone.toString().replace(/[\s\-\(\)]/g, '').trim();
    };

    const parentPhone = normalizePhone(parentNumber);
    const referrerPhone = normalizePhone(od.referrer?.phoneNumber || '');
    const referralPhone = normalizePhone(od.referral?.phoneNumber || '');

    return 'Pending';
  }

  async getAllReferrals(page: number = 1, pageSize: number = 10, searchTerm: string = '') {
    try {
      const pageNum = Number(page) || 1;
      const pageSizeNum = Number(pageSize) || 10;
      const skip = (pageNum - 1) * pageSizeNum;

      console.log('search___', searchTerm);

      // Build search filter
      const searchFilter = searchTerm ? {
        $or: [
          { 'student_details.first_name': { $regex: searchTerm, $options: 'i' } },
          { 'student_details.last_name': { $regex: searchTerm, $options: 'i' } },
          { 'parent_details.father_details.first_name': { $regex: searchTerm, $options: 'i' } },
          { 'parent_details.mother_details.first_name': { $regex: searchTerm, $options: 'i' } },
          { 'parent_details.guardian_details.first_name': { $regex: searchTerm, $options: 'i' } },
          { 'admissionDetails.enrolment_number': { $regex: searchTerm, $options: 'i' } },
        ]
      } : {};

      // Base filter for referrals
      const baseFilter = {
        $and: [
          {
            $or: [
              { 'other_details.referrer': { $exists: true, $ne: null } },
              { 'other_details.referral': { $exists: true, $ne: null } },
              { 'other_details.enquiry_parent_source_id': { $exists: true, $ne: null } },
              { 'other_details.enquiry_employee_source_id': { $exists: true, $ne: null } },
              { 'enquiry_school_source.id': { $exists: true, $ne: null } },
              { 'other_details.enquiry_school_source_id': { $exists: true, $ne: null } },
              { 'enquiry_corporate_source.id': { $exists: true, $ne: null } },
              { 'other_details.enquiry_corporate_source_id': { $exists: true, $ne: null } },
              { 'enquiry_parent_source': { $exists: true, $ne: null } },
              { 'enquiry_corporate_source': { $exists: true, $ne: null } },
              { 'enquiry_school_source': { $exists: true, $ne: null } },
              { 'enquiry_employee_source': { $exists: true, $ne: null } },
            ]
          },
          {
            $or: [
              { 'student_details.enrolment_number': { $exists: true, $ne: null } },
              {
                $and: [
                  {
                    'enquiry_stages': {
                      $elemMatch: {
                        stage_name: 'Payment',
                        status: 'Completed'
                      }
                    }
                  },
                  { 'registration_fees_paid': true }
                ]
              }
            ]
          }
        ]
      };

      // Build aggregation pipeline - FIXED: Added search filter
      const pipeline: any[] = [
        { $match: baseFilter },
        {
          $lookup: {
            from: 'admission',
            localField: '_id',
            foreignField: 'enquiry_id',
            as: 'admissionDetails',
          },
        },
        // CRITICAL FIX: Apply search filter after lookup
        ...(searchTerm ? [{ $match: searchFilter }] : []),
        {
          $addFields: {
            enrolment_number: {
              $cond: {
                if: {
                  $gt: [{ $size: { $ifNull: ['$admissionDetails', []] } }, 0],
                },
                then: {
                  $let: {
                    vars: {
                      admissionRecordWithEnrolmentNumber: {
                        $filter: {
                          input: { $ifNull: ['$admissionDetails', []] },
                          as: 'record',
                          cond: {
                            $and: [
                              { $ne: ['$$record.enrolment_number', null] },
                              { $ne: ['$$record.student_id', null] },
                            ],
                          },
                        },
                      },
                    },
                    in: {
                      $cond: {
                        if: { $gt: [{ $size: '$$admissionRecordWithEnrolmentNumber' }, 0] },
                        then: {
                          $arrayElemAt: [
                            {
                              $ifNull: [
                                '$$admissionRecordWithEnrolmentNumber.enrolment_number',
                                [],
                              ],
                            },
                            0,
                          ],
                        },
                        else: null,
                      },
                    },
                  },
                },
                else: null,
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            student_details: 1,
            enquiry_number: 1,
            parent_details: 1,
            academic_year: 1,
            school_location: 1,
            other_details: 1,
            enquiry_source: 1,
            enquiry_sub_source: 1,
            enquiry_corporate_source: 1,
            enquiry_parent_source: 1,
            enquiry_employee_source: 1, // ✅ Include root level employee source
            enquiry_school_source: 1,
            board: 1,
            assigned_to: 1,
            enrolment_number: 1,
            createdAt: 1,
            admissionDetails: 1,
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: pageSizeNum }
      ];

      // Count pipeline
      const countPipeline = [
        { $match: baseFilter },
        {
          $lookup: {
            from: 'admission',
            localField: '_id',
            foreignField: 'enquiry_id',
            as: 'admissionDetails',
          },
        },
        ...(searchTerm ? [{ $match: searchFilter }] : []),
        { $count: 'total' }
      ];

      console.log('Main Pipeline:', JSON.stringify(pipeline, null, 2));
      console.log('Count Pipeline:', JSON.stringify(countPipeline));

      const countResult = await this.enquiryRepository.aggregate(countPipeline);
      const totalCount = countResult.length > 0 ? countResult[0].total : 0;

      // Get paginated data
      const enquiryDocs = await this.enquiryRepository.aggregate(pipeline);

      console.log('Enquiry Docs Found:', enquiryDocs.length);
      console.log('First Doc Sample:', JSON.stringify(enquiryDocs[0], null, 2));

      const result = enquiryDocs.map(enq => {
        // Add null check at the start
        if (!enq) {
          console.error('Null enquiry document found');
          return null;
        }

        const enquiryid = enq._id;
        const studentName = `${enq.student_details?.first_name || ''} ${enq.student_details?.last_name || ''}`.trim();

        const parentName = () => {
          switch (enq.other_details?.parent_type?.toLowerCase()) {
            case 'father':
              return `${enq.parent_details?.father_details?.first_name || ''} ${enq.parent_details?.father_details?.last_name || ''}`.trim() || null;
            case 'mother':
              return `${enq.parent_details?.mother_details?.first_name || ''} ${enq.parent_details?.mother_details?.last_name || ''}`.trim() || null;
            case 'guardian':
              return `${enq.parent_details?.guardian_details?.first_name || ''} ${enq.parent_details?.guardian_details?.last_name || ''}`.trim() || null;
            default:
              return null;
          }
        }

        const parentNumber = () => {
          switch (enq.other_details?.parent_type?.toLowerCase()) {
            case 'father':
              return enq.parent_details?.father_details?.mobile || null;
            case 'mother':
              return enq.parent_details?.mother_details?.mobile || null;
            case 'guardian':
              return enq.parent_details?.guardian_details?.mobile || null;
            default:
              return null;
          }
        }

        const enrollmentNumber = enq.enrolment_number || null;
        const academicYear = enq.academic_year?.value || null;
        const school = enq.school_location?.value || null;
        const grade = enq.student_details?.grade?.value || null;
        const board = enq.board?.value || null;
        const assignedTo = enq.assigned_to || null;
        const enquirySource = enq.enquiry_source?.value || null;
        const enquirySubSource = enq.enquiry_sub_source?.value || null;

        console.log('enquiry_Data___', enq)

        const od = enq?.other_details || {};

        // ================================================================
        // ✅ PRIORITY ORDER for extracting referral source details
        // ================================================================
        let sourceName = '';
        let referrerPhone = null;
        let referrerEmail = null;
        let referralType = '';

        // PRIORITY 1: Parent Referral (ROOT level)
        if (enq.enquiry_parent_source) {
          console.log('✅ Parent referral detected (root level)');
          sourceName = enq.enquiry_parent_source.name || 'Parent';
          referrerPhone = enq.enquiry_parent_source.value; // Phone number
          referrerEmail = enq.enquiry_parent_source.parent_email;
          referralType = 'Parent Referral';
        }
        // PRIORITY 2: Employee Referral (ROOT level) ✅ NEW!
        else if (enq.enquiry_employee_source) {
          console.log('✅ Employee referral detected (root level)');
          sourceName = enq.enquiry_employee_source.name || 'Employee';
          referrerPhone = enq.enquiry_employee_source.number; // ✅ Phone at root level
          referrerEmail = enq.enquiry_employee_source.value; // ✅ Email at root level
          referralType = 'Employee Referral';
        }
        // PRIORITY 3: Pre-School Referral (ROOT level)
        else if (enq.enquiry_school_source?.id) {
          console.log('✅ Pre-School referral detected (root level)');
          sourceName = enq.enquiry_school_source.value || 'Preschool';
          referrerPhone = enq.enquiry_school_source.spoc_mobile_no;
          referrerEmail = enq.enquiry_school_source.spoc_email;
          referralType = 'Pre-School Referral';
        }
        // PRIORITY 4: Corporate Referral (ROOT level)
        else if (enq.enquiry_corporate_source?.id) {
          console.log('✅ Corporate referral detected (root level)');
          sourceName = enq.enquiry_corporate_source.value || 'Corporate';
          referrerPhone = enq.enquiry_corporate_source.spoc_mobile_no;
          referrerEmail = enq.enquiry_corporate_source.spoc_email;
          referralType = 'Corporate Referral';
        }
        // FALLBACK 1: Employee Referral (other_details)
        else if (od.enquiry_employee_source_id) {
          console.log('✅ Employee referral detected (other_details)');
          sourceName = od.enquiry_employee_source_name || 'Employee';
          referrerPhone = od.enquiry_employee_source_number;
          referrerEmail = od.enquiry_employee_source_value;
          referralType = 'Employee Referral (other_details)';
        }
        // FALLBACK 2: Pre-School Referral (other_details)
        else if (od.enquiry_school_source_id) {
          console.log('✅ Pre-School referral detected (other_details)');
          sourceName = od.enquiry_school_source_value || 'Preschool';
          referrerPhone = od.enquiry_school_source_number;
          referrerEmail = od.enquiry_school_source_email;
          referralType = 'Pre-School Referral (other_details)';
        }
        // FALLBACK 3: Corporate Referral (other_details)
        else if (od.enquiry_corporate_source_id) {
          console.log('✅ Corporate referral detected (other_details)');
          sourceName = od.enquiry_corporate_source_value || 'Corporate';
          referrerPhone = od.enquiry_corporate_source_number;
          referrerEmail = od.enquiry_corporate_source_email;
          referralType = 'Corporate Referral (other_details)';
        }
        // FALLBACK 4: Legacy referrer field
        else {
          console.log('⚠️ Using legacy referrer field');
          sourceName = (od.enquiry_parent_source_value && `${od.enquiry_parent_source_value}`) || '';
          referrerPhone = od.referrer?.phoneNumber || null;
          referrerEmail = od.referrer?.email || null;
          referralType = 'Legacy Referral';
        }

        const referralPhone = parentNumber();
        const referralStatus = this.calculateReferralStatus(enq, parentNumber());

        console.log('sent_data___', {
          enquiryid: enquiryid,
          student_name: studentName,
          enquiry_number: enq.enquiry_number,
          enrollment_number: enrollmentNumber,
          parent_name: parentName(),
          parent_number: parentNumber(),
          academic_year: academicYear,
          school: school,
          grade: grade,
          board: board,
          leadOwner: assignedTo,
          enquirySource: enquirySource,
          enquirySubSource: enquirySubSource,
          sourceName: sourceName,
          referralType: referralType, // ✅ NEW: Show referral type
          status: referralStatus,
          referrerPhone: referrerPhone,
          referrerEmail: referrerEmail, // ✅ NEW: Include email
          referralPhone: referralPhone,
          referrerVerified: od.referrer?.verified || false,
          referralVerified: od.referral?.verified || false,
          manuallyVerified: od.manuallyVerifiedData?.manuallyVerified || false,
          manuallyRejected: od.manuallyRejectedData?.manuallyRejected || false,
          referrerRejectionReason: od.manuallyRejectedData?.manualRejectionReason || null,
          manuallyVerifiedData: od.manuallyVerifiedData || null,
          manuallyRejectedData: od.manuallyRejectedData || null,
        })

        return {
          enquiryid: enquiryid,
          student_name: studentName,
          enquiry_number: enq.enquiry_number,
          enrollment_number: enrollmentNumber,
          parent_name: parentName(),
          parent_number: parentNumber(),
          academic_year: academicYear,
          school: school,
          grade: grade,
          board: board,
          leadOwner: assignedTo,
          enquirySource: enquirySource,
          enquirySubSource: enquirySubSource,
          sourceName: sourceName,
          referralType: referralType, // ✅ NEW: Show referral type
          status: referralStatus,
          referrerPhone: referrerPhone,
          referrerEmail: referrerEmail, // ✅ NEW: Include email
          referralPhone: referralPhone,
          referrerVerified: od.referrer?.verified || false,
          referralVerified: od.referral?.verified || false,
          manuallyVerified: od.manuallyVerifiedData?.manuallyVerified || false,
          manuallyRejected: od.manuallyRejectedData?.manuallyRejected || false,
          referrerRejectionReason: od.manuallyRejectedData?.manualRejectionReason || null,
          manuallyVerifiedData: od.manuallyVerifiedData || null,
          manuallyRejectedData: od.manuallyRejectedData || null,
        };
      }).filter(item => item !== null); // Filter out any null results

      return {
        data: result,
        pagination: {
          page: pageNum,
          pageSize: pageSizeNum,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSizeNum),
          hasNextPage: pageNum < Math.ceil(totalCount / pageSizeNum),
          hasPrevPage: pageNum > 1
        }
      };

    } catch (error) {
      console.error('Error fetching all referrals:', error);
      throw error;
    }
  }

  // New endpoint to verify a referral
  async verifyReferral(enquiryId: string, verificationType: 'referrer' | 'referral' | 'both') {
    try {
      const enquiry = await this.enquiryRepository.getById(new Types.ObjectId(enquiryId));

      if (!enquiry) {
        throw new Error('Enquiry not found');
      }

      // Get parent phone number
      const parentNumber =
        enquiry.parent_details?.father_details?.mobile ||
        enquiry.parent_details?.mother_details?.mobile ||
        enquiry.parent_details?.guardian_details?.mobile ||
        null;

      if (!parentNumber) {
        throw new Error('Parent phone number not found');
      }

      const normalizePhone = (phone: string): string => {
        if (!phone) return '';
        return phone.toString().replace(/[\s\-\(\)]/g, '').trim();
      };

      const parentPhone = normalizePhone(parentNumber);
      const od = enquiry.other_details || {};

      // Verify and update based on type
      const updateData: any = { ...od };

      if (verificationType === 'referrer' || verificationType === 'both') {
        const referrerPhone = normalizePhone(od.referrer?.phoneNumber);

        if (referrerPhone && referrerPhone === parentPhone) {
          updateData.referrer = {
            ...od.referrer,
            verified: true,
            verifiedAt: new Date()
          };
        } else {
          throw new Error('Referrer phone number does not match parent phone number');
        }
      }

      if (verificationType === 'referral' || verificationType === 'both') {
        const referralPhone = normalizePhone(od.referral?.phoneNumber);

        if (referralPhone && referralPhone === parentPhone) {
          updateData.referral = {
            ...od.referral,
            verified: true,
            verifiedAt: new Date()
          };
        } else {
          throw new Error('Referral phone number does not match parent phone number');
        }
      }

      // Update the enquiry
      await this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
        other_details: updateData
      });

      return { success: true, message: 'Verification successful' };

    } catch (error) {
      console.error('Error verifying referral:', error);
      throw error;
    }
  }


  async verifyReferralManually(
    enquiryId: string,
    verificationType: 'both',
    verifiedBy: string,
    reason?: string
  ) {
    try {
      const objectId = new Types.ObjectId(enquiryId);
      const enquiry = await this.enquiryRepository.getById(objectId);

      if (!enquiry) {
        throw new Error('Enquiry not found');
      }

      const od = enquiry.other_details || {};
      const updateData: any = { ...od };

      const manualVerificationData = {
        manuallyVerified: true,
        manuallyVerifiedAt: new Date(),
        manuallyVerifiedBy: verifiedBy,
        manualVerificationReason: reason || 'Manual verification by admin',
        canUnverify: false,
        verifiedPhoneNumber: enquiry.parent_details?.father_details?.mobile ||
          enquiry.parent_details?.mother_details?.mobile ||
          enquiry.parent_details?.guardian_details?.mobile
      };

      updateData.manuallyVerifiedData = manualVerificationData;

      await this.enquiryRepository.updateById(objectId, {
        other_details: updateData
      });

      return {
        success: true,
        message: 'Manual verification successful - Money transfer can proceed. This verification cannot be undone.',
        verifiedBy,
        reason,
        verificationType
      };

    } catch (error) {
      console.error('Error in manual verification:', error);
      throw error;
    }
  }

  async rejectReferralManually(enquiryId: string, reason: string) {
    try {
      const objectId = new Types.ObjectId(enquiryId);
      const enquiry = await this.enquiryRepository.getById(objectId);

      if (!enquiry) {
        throw new Error('Enquiry not found');
      }

      const od = enquiry.other_details || {};
      const updateData: any = { ...od };

      const manualRejectionData = {
        manuallyRejected: true,
        manuallyRejectedAt: new Date(),
        manualRejectionReason: reason
      };

      updateData.manuallyRejectedData = manualRejectionData;

      await this.enquiryRepository.updateById(objectId, {
        other_details: updateData
      });

      return {
        success: true,
        message: 'Manual rejection successful.',
        reason
      };

    } catch (error) {
      console.error('Error in manual rejection:', error);
      throw error;
    }
  }


  async fetchReferralDetails(id: string) {
    try {
      const enquiryDocs = await this.enquiryRepository.getMany({
        _id: new Types.ObjectId(id),
      });

      if (!enquiryDocs || enquiryDocs.length === 0) {
        throw new Error("No enquiry found for the given ID");
      }

      const enquiry = enquiryDocs[0];
      if (enquiry?.other_details.enquiry_employee_source_value) {
        const capitalize = (str: string) =>
          str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

        const parts = enquiry.other_details.enquiry_employee_source_value.split('.');
        const firstName = capitalize(parts[0]);
        const lastName = capitalize(parts[1].split('@')[0]);

        enquiry.referring_employee_name = `${firstName} ${lastName}`;

      }
      else if (enquiry?.other_details.enquiry_corporate_source_value) {
        enquiry.referring_corporate_name = enquiry?.other_details.enquiry_corporate_source_value;

      }
      else if (enquiry?.other_details.enquiry_school_source_value) {
        enquiry.referring_school_name = enquiry?.other_details.enquiry_school_source_value;
      }
      // 🟢 Determine available parent name in priority: Father → Mother → Guardian
      const referredfatherName = `${enquiry.parent_details?.father_details?.first_name} ${enquiry.parent_details?.father_details?.last_name}` || "";
      const referredmotherName = `${enquiry.parent_details?.mother_details?.first_name} ${enquiry.parent_details?.mother_details?.last_name}` || "";
      const referredguardianName = `${enquiry.parent_details?.guardian_details?.first_name} ${enquiry.parent_details?.guardian_details?.last_name}` || "";

      const referredparentName =
        referredfatherName || referredmotherName || referredguardianName || "Unknown";

      // 🟢 Add the extracted parent name to main enquiry details
      enquiry.referred_parent_name = referredparentName;


      // 🟢 Check if parent enquiry source exists
      const parentSourceId =
        enquiry?.other_details?.enquiry_parent_source_id ??
        enquiry?.other_details?.enquiry_parent_source?.id ??
        enquiry?.other_details?.enquiry_employee_source?.id ??
        enquiry?.other_details?.enquiry_corporate_source?.id ??
        enquiry?.other_details?.enquiry_school_source?.id ??
        null;

      enquiry.referring_parent_name =
        enquiry?.enquiry_parent_source?.name ??
        enquiry?.enquiry_employee_source?.name ??
        enquiry?.enquiry_corporate_source?.value ??
        enquiry?.enquiry_school_source?.value ??
        null;

      return [enquiry];

    } catch (error) {
      console.error("Error fetching referral details:", error);
      throw error;
    }
  }


  async referralConfirmation(enquiryId: string, reqbody) {
    const { type, phoneNumber, action } = reqbody;

    const existingEnquiry = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId)
    );
    if (!existingEnquiry) {
      throw new HttpException('Enquiry not found', HttpStatus.NOT_FOUND);
    }

    console.log('existing_enquiry___', existingEnquiry);

    const otherDetails = existingEnquiry.other_details || {};
    const parentDetails = existingEnquiry.parent_details || {};
    const targetKey = action === 'referrer' ? 'referrer' : 'referral';

    // 🧩 Check if this side was already verified
    if (otherDetails?.[targetKey]?.verified === true) {
      return { message: 'Referral details were already submitted.' };
    }

    // 🧱 Initialize stored object
    const storedTarget = otherDetails[targetKey] || {};
    const failedAttempts = storedTarget.failedAttempts || 0;

    // 🛑 Lock if 3 attempts done
    if (failedAttempts >= 3) {
      throw new HttpException(
        'Maximum attempts reached. Please contact admin or try again later.',
        HttpStatus.BAD_REQUEST
      );
    }

    let isMatch = false;

    if (action === 'referral') {
      // ✅ Referral → check against source numbers following the PRIORITY ORDER
      const validNumbers = [];

      // PRIORITY 1: Parent Referral (ROOT level)
      if (existingEnquiry.enquiry_parent_source?.value) {
        validNumbers.push(existingEnquiry.enquiry_parent_source.value);
      }

      // PRIORITY 2: Employee Referral (ROOT level)
      if (existingEnquiry.enquiry_employee_source?.number) {
        validNumbers.push(existingEnquiry.enquiry_employee_source.number);
      }

      // PRIORITY 3: Pre-School Referral (ROOT level)
      if (existingEnquiry.enquiry_school_source?.spoc_mobile_no) {
        validNumbers.push(existingEnquiry.enquiry_school_source.spoc_mobile_no);
      }

      // PRIORITY 4: Corporate Referral (ROOT level)
      if (existingEnquiry.enquiry_corporate_source?.spoc_mobile_no) {
        validNumbers.push(existingEnquiry.enquiry_corporate_source.spoc_mobile_no);
      }

      // FALLBACK 1: Employee Referral (other_details)
      if (otherDetails.enquiry_employee_source_number) {
        validNumbers.push(otherDetails.enquiry_employee_source_number);
      }

      // FALLBACK 2: Pre-School Referral (other_details)
      if (otherDetails.enquiry_school_source_number) {
        validNumbers.push(otherDetails.enquiry_school_source_number);
      }

      // FALLBACK 3: Corporate Referral (other_details)
      if (otherDetails.enquiry_corporate_source_number) {
        validNumbers.push(otherDetails.enquiry_corporate_source_number);
      }

      // FALLBACK 4: Legacy parent source (other_details)
      if (otherDetails.enquiry_parent_source_value) {
        validNumbers.push(otherDetails.enquiry_parent_source_value);
      }

      // FALLBACK 5: Legacy referrer phone
      if (otherDetails.referrer?.phoneNumber) {
        validNumbers.push(otherDetails.referrer.phoneNumber);
      }

      // Remove duplicates and filter out null/undefined
      const uniqueValidNumbers = [...new Set(validNumbers.filter(Boolean))];

      console.log('Valid referral numbers:', uniqueValidNumbers);
      isMatch = uniqueValidNumbers.includes(phoneNumber);

    } else if (action === 'referrer') {
      // ✅ Referrer → check in parent_details
      const validNumbers = [
        parentDetails?.father_details?.mobile,
        parentDetails?.mother_details?.mobile,
        parentDetails?.guardian_details?.mobile,
      ].filter(Boolean);

      console.log('Valid referrer numbers:', validNumbers);
      isMatch = validNumbers.includes(phoneNumber);
    }

    // ❌ Wrong number case
    if (!isMatch) {
      const newAttempts = failedAttempts + 1;
      const attemptsLeft = 3 - newAttempts;

      const updatePayload: any = {
        other_details: {
          ...otherDetails,
          [targetKey]: {
            ...(storedTarget || {}),
            type,
            phoneNumber,
            failedAttempts: newAttempts,
            verified: false,
          },
        },
      };

      await this.enquiryRepository.updateById(
        new Types.ObjectId(enquiryId),
        updatePayload,
      );

      if (newAttempts >= 3) {
        throw new HttpException(
          'Incorrect phone number entered 3 times. Verification locked.',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        `Incorrect phone number. ${attemptsLeft} attempt(s) left.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // ✅ Correct number
    const updatedDetails = {
      ...otherDetails,
      [targetKey]: {
        type,
        phoneNumber,
        verified: true,
        failedAttempts: 0,
      },
    };

    // 🟩 Check if both verified → set referralStatus true
    const referrerVerified = updatedDetails.referrer?.verified === true;
    const referralVerified = updatedDetails.referral?.verified === true;

    if (referrerVerified && referralVerified) {
      updatedDetails.referralStatus = true;
    }

    await this.enquiryRepository.updateById(
      new Types.ObjectId(enquiryId),
      { other_details: updatedDetails }
    );

    await this.verificationTrackerService.markAsVerified(enquiryId, action);

    return { message: `${action} verified successfully.` };
  }



  // Add this method to your EnquiryService class

  /**
   * Fetches enrollment details from external API
   * @param enrollmentNumber - The enrollment number to search
   * @param req - Request object for authorization header
   */
  async getEnrollmentDetailFromAPI(enrollmentNumber: string, req: Request) {
    try {
      console.log('calling getEnrollmentDetailFromAPI____', enrollmentNumber, req)
      console.log('response___', this.configService.get<string>('ADMIN_PANEL_URL'))
      const response = await this.axiosService
        .setBaseUrl(this.configService.get<string>('ADMIN_PANEL_URL'))
        .setUrl('studentProfile/getEnrollmentDetail')
        .setMethod(EHttpCallMethods.POST)
        .setHeaders({
          Authorization: req.headers.authorization,
        } as AxiosRequestHeaders)
        .setBody({
          crt_enr_on: enrollmentNumber,
        })
        .sendRequest()

      console.log('getEnr_data___', response);

      if (response?.data?.success && response?.data?.data) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      this.loggerService.log(
        `Error fetching enrollment ${enrollmentNumber}: ${error.message}`
      );
      return null;
    }
  }

  /**
   * Transforms API response to match the expected format
   */
  private transformAPIResponse(apiData: any): any {
    const studentProfile = apiData.studentProfile;
    const parents = apiData.parent || [];

    // Find father, mother, and guardian from parent array
    const father = parents.find(
      (p: any) => p.relation?.toLowerCase() === 'father' || p.guardian_relationship_id === 6
    );
    const mother = parents.find(
      (p: any) => p.relation?.toLowerCase() === 'mother' || p.guardian_relationship_id === 5
    );
    const guardian = parents.find(
      (p: any) =>
        p.relation?.toLowerCase() !== 'father' &&
        p.relation?.toLowerCase() !== 'mother' &&
        p.guardian_relationship_id !== 5 &&
        p.guardian_relationship_id !== 6
    );

    // Determine primary contact (prefer preferred contacts)
    let parentPhone = null;
    let parentName = null;

    const preferredParent = parents.find((p: any) => p.is_preferred_mobile_no === 1);

    if (preferredParent) {
      parentPhone = preferredParent.mobile_no;
      parentName = [preferredParent.first_name, preferredParent.last_name]
        .filter(Boolean)
        .join(' ');
    } else if (father?.mobile_no) {
      parentPhone = father.mobile_no;
      parentName = [father.first_name, father.last_name].filter(Boolean).join(' ');
    } else if (mother?.mobile_no) {
      parentPhone = mother.mobile_no;
      parentName = [mother.first_name, mother.last_name].filter(Boolean).join(' ');
    } else if (guardian?.mobile_no) {
      parentPhone = guardian.mobile_no;
      parentName = [guardian.first_name, guardian.last_name].filter(Boolean).join(' ');
    }

    return {
      id: studentProfile.global_id?.toString() || studentProfile.id?.toString(),
      student_name: [
        studentProfile.first_name,
        studentProfile.middle_name,
        studentProfile.last_name,
      ]
        .filter(Boolean)
        .join(' '),
      enrollment_number: studentProfile.crt_enr_on || null,
      parent_phone: parentPhone,
      parent_name: parentName,
      academic_year: studentProfile.academic_year_name || null,
      parent_details: {
        father: father
          ? {
            global_id: father.global_no || null,
            first_name: father.first_name || null,
            last_name: father.last_name || null,
            mobile: father.mobile_no || null,
            email: father.email || null,
            country_code: null, // Not provided in API response
          }
          : null,
        mother: mother
          ? {
            global_id: mother.global_no || null,
            first_name: mother.first_name || null,
            last_name: mother.last_name || null,
            mobile: mother.mobile_no || null,
            email: mother.email || null,
            country_code: null, // Not provided in API response
          }
          : null,
        guardian: guardian
          ? {
            first_name: guardian.first_name || null,
            last_name: guardian.last_name || null,
            mobile: guardian.mobile_no || null,
            email: guardian.email || null,
            relationship_with_child: guardian.relation || null,
            country_code: null, // Not provided in API response
          }
          : null,
      },
    };
  }

  async getEnrollmentAndParentNumber(search?: string, req?: Request) {
    try {
      console.log('data___' , this.configService.get<string>('ADMIN_PANEL_URL'))
      console.log('req_data___', req)
      console.log('search_string___', search)
      // Validate req is provided
      if (!req) {
        throw new HttpException(
          'Request object is required for API authentication',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!search || !search.trim()) {
        this.loggerService.warn('List functionality requires search parameter');
        return [];
      }

      const searchTerm = search.trim();

      // Check if search term starts with "EA" (enrollment number search)
      if (searchTerm.toUpperCase().startsWith('EN')) {
        const apiData = await this.getEnrollmentDetailFromAPI(searchTerm, req);
        console.log('Data fetching for the enrl-no___', apiData)
        if (apiData) {
          const transformed = this.transformAPIResponse(apiData);
          const unique = [];
          const seen = new Set();

          if (transformed.enrollment_number && !seen.has(transformed.enrollment_number)) {
            seen.add(transformed.enrollment_number);
            unique.push(transformed);
          }

          return unique;
        }

        this.loggerService.warn(`No enrollment found for search term: ${searchTerm}`);
        return [];
      }

      // Otherwise, treat as mobile number search
      const guardiansData = await this.getGuardianStudentDetailsByMobile(searchTerm, req);

      if (!guardiansData || !guardiansData.students || guardiansData.students.length === 0) {
        this.loggerService.warn(`No students found for mobile number: ${searchTerm}`);
        return [];
      }

      // Fetch enrollment details for each student found
      const enrollmentPromises = guardiansData.students.map(async (student: any) => {
        try {
          const enrollmentNumber = student.crt_enr_on;
          if (!enrollmentNumber) {
            return null;
          }

          const apiData = await this.getEnrollmentDetailFromAPI(enrollmentNumber, req);

          if (apiData) {
            return this.transformAPIResponse(apiData);
          }

          return null;
        } catch (error) {
          this.loggerService.log(
            `Error fetching enrollment for student ${student.id}: ${error.message}`
          );
          return null;
        }
      });

      const enrollmentResults = await Promise.all(enrollmentPromises);

      // Filter out null results and deduplicate by enrollment number
      const unique = [];
      const seen = new Set();

      for (const result of enrollmentResults) {
        if (result && result.enrollment_number && !seen.has(result.enrollment_number)) {
          seen.add(result.enrollment_number);
          unique.push(result);
        }
      }

      return unique;

    } catch (error) {
      this.loggerService.error(
        `Error fetching enrollment number and parent numbers: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Fetches student details by guardian mobile number from MDM API
   * @param mobileNumber - The mobile number to search
   * @param req - Request object for authorization header
   */
  private async getGuardianStudentDetailsByMobile(mobileNumber: string, req: Request) {
    try {
      const response = await this.axiosService
        .setBaseUrl(this.configService.get<string>('MDM_URL'))
        .setUrl('/api/guardian-student-details')
        .setMethod(EHttpCallMethods.POST)
        .setHeaders({
          Authorization: req.headers.authorization,
        } as AxiosRequestHeaders)
        .setBody({
          mobile_no: mobileNumber,
        })
        .sendRequest();

      if (response?.data?.success && response?.data?.data) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      this.loggerService.log(
        `Error fetching guardian-student details for mobile ${mobileNumber}: ${error.message}`
      );
      return null;
    }
  }

  private async getEnquiryDetail(enquiryNumber: string) {
    const enquiryDetails =
      await this.enquiryRepository.getByEnquiryNumber(enquiryNumber);

    if (!enquiryDetails) {
      throw new HttpException(
        'No Enquiry found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return enquiryDetails;
  }

  async approveAdmissionworkflow(enquiryNumber: string) {
    try {
      if (!enquiryNumber) {
        throw new NotFoundException('Enquiry number not found');
      }

      await Promise.all([
        this.enquiryRepository.updateOne(
          {
            enquiry_number: enquiryNumber,
            'enquiry_stages.stage_name': 'Admission Status'
          },
          {
            $set: {
              'enquiry_stages.$.status': 'Approved',
            },
          },
        ),
      ]);
    } catch (error) {
      console.error('Error in admission approvel', {
        error: error.message,
      });
      throw new HttpException(
        'Invalid field value',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  }

  async smsGatewayOptions() {
    return {
      url: process.env.SMS_URL,
      key: process.env.SMS_API_KEY,
    };
  }

  buildCommunicationTemplate(name, email, password) {
    return `Hi ${name},
              Welcome! Your username is ${email} and your temporary password is ${password}. Please log in and reset your password immediately. Thank you -VIBGYOR`;
  }

  async getAdminAuthToken(adminAuthUrl, username, password): Promise<string> {
    try {
      console.log('adminAuthUrl:', adminAuthUrl);
      const response = await this.axiosService
        .setBaseUrl(adminAuthUrl)
        .setUrl('/admin/auth/login')
        .setMethod(EHttpCallMethods.POST)
        .setHeaders({
          'Content-Type': 'application/json',
        } as AxiosRequestHeaders)
        .setBody({
          username: username,
          password: password,
        })
        .sendRequest();

      return response?.data?.data?.access_token; // Adjust based on actual response structure
    } catch (error) {
      console.error(`Error getting admin auth token: ${error.message}`);
      throw new HttpException(
        'Failed to authenticate with admin panel',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateStudentGuardianMapping(body: any, req: any) {
    for (let i = 0; i < body?.length; i++) {
      if (
        !body[i].ParentfirstName ||
        !body[i].ParentMobile ||
        !body[i].ParentEmail ||
        !body[i].relationshipId ||
        !body[i].studentId
      ) {
        throw new HttpException(
          'Guardian details are required',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    const environment = this.configService.get<string>('NODE_ENV') || 'development';

    let adminAuthUrl: string;
    let adminUsername: string;
    let adminPassword: string;
    let previousData = null;


    previousData = await this.axiosService
      .setBaseUrl(this.configService.get<string>('ADMIN_PANEL_URL'))
      .setUrl(`${ADMIN_API_URLS.STUDENT_PROFILE}/${body[0].studentId}`)
      .setMethod(EHttpCallMethods.GET)
      .setHeaders({
        Authorization: req.headers.authorization,
      } as AxiosRequestHeaders)
      .sendRequest();



    const guardinaRelationship = [];

    for (let j = 0; j < body?.length; j++) {
      let correctGuardianId = null;
      let correctStudentGuardianId = null;
      let correctGlobalUserId = null;
      let correctGlobalUserNumber = null;
      let correctGlobalUserExist = false;

      await this.parentLoginLogService.createLog({
        studentId: body[j].studentId,
        event: ParentLoginEvent.MAP_GUARDIAN_API,
        action: 'process guardian',
        log_data: { body },
        ip: req?.ip,
      });

      // co global and sso update
      const getGlobaluser = await this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.CO_GLOBAL_USER}?filters[$or][0][email][$eq]=${body[j]?.ParentEmail}&filters[$or][1][mobile_no][$eq]=${body[j]?.ParentMobile}`,
      );

      getGlobaluser?.data?.forEach((element) => {
        if (
          element.attributes?.mobile_no === body[j]?.ParentMobile &&
          element.attributes?.email === body[j]?.ParentEmail
        ) {
          correctGlobalUserExist = true;
          correctGlobalUserId = element?.id;
          correctGlobalUserNumber = element?.attributes?.global_number;
        }
      });

      if (getGlobaluser?.data?.length > 0) {
        //global user clean up
        await this.glbalUserCleanUp(getGlobaluser, body[j].studentId, req);

        if (!correctGlobalUserExist) {
          correctGlobalUserId = getGlobaluser?.data[0]?.id;
          correctGlobalUserNumber =
            getGlobaluser?.data[0]?.attributes?.global_number;
        }
        let password = body[j]?.ParentEmail.substring(0, 4);
        password =
          password?.charAt(0).toUpperCase() +
          password.slice(1).toLowerCase() +
          '@123';

        const updatecoglobaled = await this.mdmService.putDataToAPI(
          `${MDM_API_URLS.CO_GLOBAL_USER}/${correctGlobalUserId}`,
          {
            data: {
              first_name: body[j].ParentfirstName,
              middle_name: body[j]?.ParentMiddleName || '',
              last_name: body[j]?.ParentLastName || '',
              mobile_no: body[j]?.ParentMobile,
              email: body[j]?.ParentEmail,
              global_number: correctGlobalUserNumber,
              status_id: 1,
              sso_password: password,
            },
          },
        );
        const message: any = this.buildCommunicationTemplate(
          body[j].ParentfirstName + ' ' + body[j].ParentLastName,
          body[j].ParentEmail,
          password,
        );
        const sms = await this.sendSMS(
          body[j].ParentMobile,
          message,
          body[j]?.studentId,
          req
        );
        const info = await transporter.sendMail({
          from: process.env.MAIL_FROM,
          to: body[j].ParentEmail,
          subject: "Your Password has been reset",
          text: `Hi ${body[j].ParentfirstName} ${body[j].ParentLastName},
          Welcome! Your username is ${body[j].ParentEmail} and your temporary password is ${password}. Please log in and reset your password immediately. Thank you - VIBGYOR`,
          html: `<b>Hi ${body[j].ParentfirstName} ${body[j].ParentLastName},</b><br><br>
                Welcome! Your username is <b>${body[j].ParentEmail}</b> and your temporary password is <b>${password}</b>.<br>
                Please log in and reset your password immediately.<br>
                <br>
                Thank you,<br>
                VIBGYOR`,
        });

        await this.parentLoginLogService.createLog({
          studentId: body[j].studentId,
          event: ParentLoginEvent.MAP_GUARDIAN_API,
          action: 'update global users',
          log_data: { updatecoglobaled },
          ip: req?.ip,
        });
      } else {
        const updatecoglobale = await this.mdmService.postDataToAPI(
          `${MDM_API_URLS.GLOBAL_USER}`,
          {
            user_type: 1,
            first_name: body[j].ParentfirstName,
            middle_name: body[j]?.ParentMiddleName || ' ',
            last_name: body[j]?.ParentLastName || ' ',
            application_id: 1,
            service_id: 1,
            status_id: 1,
            mobile_no: body[j].ParentMobile,
            email: body[j].ParentEmail,
          },
        );
        correctGlobalUserId = updatecoglobale?.data?.id;
        correctGlobalUserNumber =
          updatecoglobale?.data?.attributes?.global_number;

        const message: any = this.buildCommunicationTemplate(
          body[j].ParentfirstName + ' ' + body[j].ParentLastName,
          body[j].ParentEmail,
          updatecoglobale?.data[0]?.sso_password,
        );
        const sms = await this.sendSMS(
          body[j].ParentMobile,
          message,
          body[j]?.studentId,
          req
        );
        const info = await transporter.sendMail({
          from: process.env.MAIL_FROM,
          to: body[j].ParentEmail,
          subject: "Your Password has been reset",
          text: `Hi ${body[j].ParentfirstName} ${body[j].ParentLastName},
          Welcome! Your username is ${body[j].ParentEmail} and your temporary password is ${updatecoglobale?.data[0]?.sso_password}. Please log in and reset your password immediately. Thank you - VIBGYOR`,
          html: `<b>Hi ${body[j].ParentfirstName} ${body[j].ParentLastName},</b><br><br>
                Welcome! Your username is <b>${body[j].ParentEmail}</b> and your temporary password is <b>${updatecoglobale?.data[0]?.sso_password}</b>.<br>
                Please log in and reset your password immediately.<br>
                <br>
                Thank you,<br>
                VIBGYOR`,
        });

        await this.parentLoginLogService.createLog({
          studentId: body[j].studentId,
          event: ParentLoginEvent.MAP_GUARDIAN_API,
          action: 'craete new global users',
          log_data: { updatecoglobale },
          ip: req?.ip,
        });
      }
      // guardian update
      if (body[j]?.guardianId) {
        correctGuardianId = body[j].guardianId;
        const updateParentData = await this.mdmService.putDataToAPI(
          `${MDM_API_URLS.GUARDIANS}/${correctGuardianId}`,
          {
            data: {
              first_name: body[j].ParentfirstName,
              middle_name: body[j]?.ParentMiddleName || '',
              last_name: body[j]?.ParentLastName || '',
              mobile_no: body[j].ParentMobile,
              email: body[j].ParentEmail,
              global_no: correctGlobalUserNumber,
              global_id: correctGlobalUserId,
            },
          },
        );

        await this.parentLoginLogService.createLog({
          studentId: body[j].studentId,
          event: ParentLoginEvent.MAP_GUARDIAN_API,
          action: 'update guardian data with given guardian id',
          log_data: { updateParentData },
          ip: req?.ip,
        });
      } else {
        const findguraidan = await this.mdmService.fetchDataFromAPI(
          `${MDM_API_URLS.GUARDIANS}?filters[$or][0][mobile_no][$eq]=${body[j].ParentMobile}&filters[$or][1][email][$eq]=${body[j].ParentEmail}&filters[$or][2][global_no][$eq]=${correctGlobalUserNumber}`,
        );

        if (findguraidan?.data?.length > 0) {
          correctGuardianId = findguraidan?.data[0]?.id;
          const updateParentData = await this.mdmService.putDataToAPI(
            `${MDM_API_URLS.GUARDIANS}/${findguraidan?.data[0]?.id}`,
            {
              data: {
                first_name: body[j].ParentfirstName,
                middle_name: body[j]?.ParentMiddleName || '',
                last_name: body[j]?.ParentLastName || '',
                mobile_no: body[j].ParentMobile,
                email: body[j].ParentEmail,
                global_no: correctGlobalUserNumber,
                global_id: correctGlobalUserId,
              },
            },
          );

          await this.parentLoginLogService.createLog({
            studentId: body[j].studentId,
            event: ParentLoginEvent.MAP_GUARDIAN_API,
            action: 'update guardian data by given guardian data',
            log_data: { updateParentData },
            ip: req?.ip,
          });
        } else {
          const updateParentData = await this.mdmService.postDataToAPI(
            `${MDM_API_URLS?.GUARDIANS}`,
            {
              data: {
                first_name: body[j].ParentfirstName,
                middle_name: body[j]?.ParentMiddleName || ' ',
                last_name: body[j]?.ParentLastName || ' ',
                mobile_no: body[j].ParentMobile,
                email: body[j].ParentEmail,
                global_no: correctGlobalUserNumber,
                global_id: correctGlobalUserId,
                profile_image: ' ',
                is_legal_guardian: true,
                is_mobile_verified: true,
                is_email_verified: true,
                is_active: true,
                is_deleted: false,
              },
            },
          );
          correctGuardianId = updateParentData?.data?.id;
          await this.parentLoginLogService.createLog({
            studentId: body[j].studentId,
            event: ParentLoginEvent.MAP_GUARDIAN_API,
            action: 'create new guardian',
            log_data: { updateParentData },
            ip: req?.ip,
          });
        }
      }
      // STUDENT_GUARDIAN update
      const updateStudentGuardian = await this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.STUDENT_GUARDIAN}?filters[student_id][$eq]=${body[j].studentId}&filters[guardian_id][$eq]=${correctGuardianId}`,
      );

      if (updateStudentGuardian.data.length > 0) {
        const updateStudentGuardianData = await this.mdmService.putDataToAPI(
          `${MDM_API_URLS.STUDENT_GUARDIAN}/${updateStudentGuardian?.data[0]?.id}`,
          {
            data: {
              guardian_id: correctGuardianId,
              guardian_relationship_id: body[j].relationshipId,
            },
          },
        );

        correctStudentGuardianId = updateStudentGuardianData?.data?.id;
        await this.parentLoginLogService.createLog({
          studentId: body[j].studentId,
          event: ParentLoginEvent.MAP_GUARDIAN_API,
          action: 'update student-guardian',
          log_data: { updateStudentGuardianData },
          ip: req?.ip,
        });
      } else {
        const createStudentGurdian = await this.mdmService.postDataToAPI(
          `${MDM_API_URLS.STUDENT_GUARDIAN}`,
          {
            data: {
              student_id: body[j].studentId,
              guardian_id: correctGuardianId,
              guardian_relationship_id: body[j].relationshipId,
              preferred_mobile_no: 0, // need to disscuse abit this
              preferred_email_no: 0,
            },
          },
        );
        correctStudentGuardianId = createStudentGurdian?.data?.id;
        await this.parentLoginLogService.createLog({
          studentId: body[j].studentId,
          event: ParentLoginEvent.MAP_GUARDIAN_API,
          action: 'create new student-guardian',
          log_data: { createStudentGurdian },
          ip: req?.ip,
        });
      }

      //guardian clean up
      await this.guardianCleanUp(
        correctGuardianId,
        correctGlobalUserNumber,
        correctStudentGuardianId,
        body,
        j,
        req
      );

      // STUDENT_GUARDIAN clean up 1
      await this.studentGuardianCleanUp(
        correctGuardianId,
        correctStudentGuardianId,
        body,
        j,
        req
      );

      guardinaRelationship.push({
        guardianId: correctGuardianId,
        relationshipId: body[j]?.relationshipId,
      });
    }

    const updatedData = await this.axiosService
      .setBaseUrl(this.configService.get<string>('ADMIN_PANEL_URL'))
      .setUrl(`${ADMIN_API_URLS.STUDENT_PROFILE}/${body[0].studentId}`)
      .setMethod(EHttpCallMethods.GET)
      .setHeaders({
        Authorization: req?.headers?.authorization,
      } as AxiosRequestHeaders)
      .sendRequest();

    const auditLogs = await this.auditLogRepository.create({
      table_name: 'mdm_ac_students',
      request_body: body,
      response_body: `${JSON.stringify(body ?? {})}`,
      operation_name: 'update-student-guardian-mapping',
      created_by: 0,
      url: `/admin/studentProfile/update`,
      ip_address: 'NA',
      method: HTTP_METHODS.PUT,
      source_service: this.configService.get<string>('SERVICE'),
      record_id: body[0].studentId,
      meta: {
        updated: updatedData?.data?.data,
        previous: previousData?.data?.data,
        updated_by: `${body[0].ParentfirstName} ${body[0].ParentLastName}`,
      },
    });


    return guardinaRelationship;
  }

  async glbalUserCleanUp(getGlobaluser, studentId, req) {
    for (let o = 1; o < getGlobaluser?.data?.length; o++) {
      const dummyMobileNo = this.enquiryHelper.getDummyMobileNo(
        getGlobaluser?.data[o]?.id,
      );
      console.log('dummyMobileNo-', dummyMobileNo);

      const updateDummycoglobale = await this.mdmService.putDataToAPI(
        `${MDM_API_URLS.CO_GLOBAL_USER}/${getGlobaluser?.data[o]?.id}`,
        {
          data: {
            mobile_no: dummyMobileNo,
            email: `${dummyMobileNo}@vgos.org`,
            sso_password: `${dummyMobileNo}@vgos.org`,
            sso_id: `${dummyMobileNo}@vgos.org`,
          },
        },
      );
      await this.parentLoginLogService.createLog({
        studentId: studentId,
        event: ParentLoginEvent.MAP_GUARDIAN_API,
        action: 'set dummy global users',
        log_data: { updateDummycoglobale },
        ip: req?.ip,
      });
    }
  }

  async guardianCleanUp(
    correctGuardianId,
    correctGlobalUserNumber,
    correctStudentGuardianId,
    body,
    index,
    req
  ) {
    const allExistingParent: any = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.GUARDIANS}?filters[$or][0][mobile_no][$eq]=${body[index].ParentMobile}&filters[$or][1][email][$eq]=${body[index].ParentEmail}&filters[$or][2][global_no][$eq]=${correctGlobalUserNumber}`,
    );

    const originalData = allExistingParent.data;

    const filteredExistingParent = originalData?.filter(
      (item) => item?.id !== correctGuardianId,
    );

    for (let k = 0; k < filteredExistingParent?.length; k++) {
      const dummyMobileNo = this.enquiryHelper.getDummyMobileNo(
        filteredExistingParent[k]?.id,
      );
      const addDummyParent = await this.mdmService.putDataToAPI(
        `${MDM_API_URLS.GUARDIANS}/${filteredExistingParent[k]?.id}`,
        {
          data: {
            mobile_no: dummyMobileNo,
            email: `${dummyMobileNo}@vgos.org`,
          },
        },
      );

      await this.parentLoginLogService.createLog({
        studentId: body[index].studentId,
        event: ParentLoginEvent.MAP_GUARDIAN_API,
        action: 'set dummy guardian users',
        log_data: { addDummyParent },
        ip: req?.ip,
      });

      //do we need to clean studetn guardian mapping for dmmy guardianId???

      // const dublicateStudentGuardian = await this.mdmService.fetchDataFromAPI(
      //   `${MDM_API_URLS.STUDENT_GUARDIAN}?filters[guardian_id][$eq]=${correctGuardianId}`,
      // );
      // for (let a = 0; a < dublicateStudentGuardian?.data?.length; a++) {
      //   if (
      //     correctStudentGuardianId &&
      //     dublicateStudentGuardian?.data[a]?.id !== correctStudentGuardianId
      //   ) {
      //     const removedStudentGuardian = await this.mdmService.putDataToAPI(
      //       `${MDM_API_URLS.STUDENT_GUARDIAN}/${dublicateStudentGuardian?.data[a]?.id}`,
      //       { data: { guardian_id: null, student_id: null } }, // and student id also 000
      //     );
      //     await this.parentLoginLogService.createLog({
      //       studentId: body[index].studentId,
      //       event: ParentLoginEvent.MAP_GUARDIAN_API,
      //       action: 'set dummy student guardian',
      //       log_data: { removedStudentGuardian },
      //     });
      //   }
      // }
    }
  }

  async studentGuardianCleanUp(
    correctGuardianId,
    correctStudentGuardianId,
    body,
    index,
    req
  ) {
    const dublicateStudentGuardian = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.STUDENT_GUARDIAN}?filters[student_id][$eq]=${body[index].studentId}&filters[guardian_id][$eq]=${correctGuardianId}`,
    );
    for (let a = 0; a < dublicateStudentGuardian?.data?.length; a++) {
      if (
        correctStudentGuardianId &&
        dublicateStudentGuardian?.data[a]?.id !== correctStudentGuardianId
      ) {
        const removedStudentGuardian = await this.mdmService.putDataToAPI(
          `${MDM_API_URLS.STUDENT_GUARDIAN}/${dublicateStudentGuardian?.data[a]?.id}`,
          { data: { guardian_id: null, student_id: null } }, // and student id also 000
        );

        await this.parentLoginLogService.createLog({
          studentId: body[index].studentId,
          event: ParentLoginEvent.MAP_GUARDIAN_API,
          action: 'set dummy student guardian',
          log_data: { removedStudentGuardian },
          ip: req?.ip,
        });
      }
    }
    // STUDENT_GUARDIAN clean up 2

    const dublicateStudentGuardian2 = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.STUDENT_GUARDIAN}?filters[student_id][$eq]=${body[index].studentId}&filters[guardian_relationship_id][$eq]=${body[index].relationshipId}`,
    );
    for (let b = 0; b < dublicateStudentGuardian2?.data?.length; b++) {
      if (
        correctStudentGuardianId &&
        dublicateStudentGuardian2?.data[b]?.id !== correctStudentGuardianId
      ) {
        const removedStudentGuardian2 = await this.mdmService.putDataToAPI(
          `${MDM_API_URLS.STUDENT_GUARDIAN}/${dublicateStudentGuardian2?.data[b]?.id}`,
          { data: { guardian_id: null, student_id: null } },
        );
        await this.parentLoginLogService.createLog({
          studentId: body[index].studentId,
          event: ParentLoginEvent.MAP_GUARDIAN_API,
          action: 'set dummy student guardian',
          log_data: { removedStudentGuardian2 },
          ip: req?.ip,
        });
      }
    }
  }

  async sendSMS(phone: number, message: string, studentId: any = null, req: any) {
    const options: any = await this.smsGatewayOptions();
    console.log('sendSMS-', `${options.url}?APIKey=${options.key}&senderid=VIBSMS&channel=2&DCS=0&flashsms=0&number=${phone}&text=${message}&route=49`);
    try {
      const res = await axios.get(
        `${options.url}?APIKey=${options.key}&senderid=VIBSMS&channel=2&DCS=0&flashsms=0&number=${phone}&text=${message}&route=49`,
      );
      console.log('sendSMS res-', JSON.stringify(res));

      await this.parentLoginLogService.createLog({
        studentId: studentId || 0,
        event: ParentLoginEvent.SMS,
        action: 'Send Notifictain by SMS',
        log_data: { res },
        ip: req?.ip,
      });
      return res.data;
    } catch (err: any) {
      return {
        status: 'error',
        details: JSON.stringify(err),
        id: '500',
      };
    }
  }

  async mapCorrectSibling(body: any, req: any) {
    const correctSiblingIds = [];
    const totalSiblingIds = [];

    let previousData = null;

    previousData = await this.axiosService
      .setBaseUrl(this.configService.get<string>('ADMIN_PANEL_URL'))
      .setUrl(`${ADMIN_API_URLS.STUDENT_PROFILE}/${body[0]?.studentId}`)
      .setMethod(EHttpCallMethods.GET)
      .setHeaders({
        Authorization: req.headers.authorization,
      } as AxiosRequestHeaders)
      .sendRequest();

    for (let i = 0; i < body.length; i++) {

      const { enrolmentNumber, dob, studentId, guardian } = body[i];
      totalSiblingIds.push(Number(studentId));

      await this.parentLoginLogService.createLog({
        studentId: studentId,
        event: ParentLoginEvent.MAP_SIBLING_API,
        action: 'process sibling',
        log_data: { body },
        ip: req?.ip,
      });

      if (!enrolmentNumber || !dob || !studentId || !Array.isArray(guardian)) {
        throw new HttpException(
          'Enrolment Number, DOB, Student Id, and Guardian must be valid',
          HttpStatus.BAD_REQUEST,
        );
      }

      const sibling = await this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.STUDENTS}?filters[crt_enr_on]=${enrolmentNumber}&filters[dob]=${dob}`,
      );

      totalSiblingIds.push(Number(sibling?.data[0]?.id));

      const givneStudent = await this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.STUDENTS}/${studentId}`,
      );

      if (!sibling?.data || sibling?.data?.length == 0 || !givneStudent?.data) {
        throw new HttpException(
          'Sibling not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const checkViceSiblingMapping = await this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.Student_Siblings}?filters[sibling_global_user_id][$eq]=${givneStudent?.data?.attributes?.global_id}&filters[student_id][$eq]=${sibling?.data[0]?.id}`,
      );
      const checkVersaSiblingMapping = await this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.Student_Siblings}?filters[sibling_global_user_id][$eq]=${sibling?.data[0]?.attributes?.global_id}&filters[student_id][$eq]=${givneStudent?.data?.id}`,
      );
      const school_name = await this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.SCHOOL}/${sibling?.data[0]?.attributes?.crt_school_id}`,
      );
      if (checkViceSiblingMapping?.data?.length > 0) {
        const updateSiblingMapping = await this.mdmService.putDataToAPI(
          `${MDM_API_URLS.Student_Siblings}/${checkViceSiblingMapping?.data[0]?.id}`,
          {
            data: {
              sibling_global_user_id: sibling?.data[0]?.attributes?.global_id,
              student_id: studentId,
              school_name: school_name?.data?.attributes?.name || null,
              grade_id: sibling?.data[0]?.attributes?.crt_grade_id || 0,
              board_id: sibling?.data[0]?.attributes?.crt_board_id || 0,
              is_vibgyor_student: true,
              gender_id: sibling?.data[0]?.attributes?.gender_id || 0,
            },
          },
        );
        await this.parentLoginLogService.createLog({
          studentId: studentId,
          event: ParentLoginEvent.MAP_SIBLING_API,
          action: 'update first existing sibling record',
          log_data: { updateSiblingMapping },
          ip: req?.ip,
        });
        correctSiblingIds.push(updateSiblingMapping?.data?.id);
      } else if (checkVersaSiblingMapping?.data?.length > 0) {
        const updateSiblingMapping = await this.mdmService.putDataToAPI(
          `${MDM_API_URLS.Student_Siblings}/${checkVersaSiblingMapping?.data[0]?.id}`,
          {
            data: {
              sibling_global_user_id: sibling?.data[0]?.attributes?.global_id,
              student_id: studentId,
              school_name: school_name?.data?.attributes?.name || null,
              grade_id: sibling?.data[0]?.attributes?.crt_grade_id || 0,
              board_id: sibling?.data[0]?.attributes?.crt_board_id || 0,
              is_vibgyor_student: true,
              gender_id: sibling?.data[0]?.attributes?.gender_id || 0,
            },
          },
        );
        await this.parentLoginLogService.createLog({
          studentId: studentId,
          event: ParentLoginEvent.MAP_SIBLING_API,
          action: 'update first existing sibling record',
          log_data: { updateSiblingMapping },
          ip: req?.ip,
        });
        correctSiblingIds.push(updateSiblingMapping?.data?.id);
      } else {
        const createSiblingMapping = await this.mdmService.postDataToAPI(
          `${MDM_API_URLS.Student_Siblings}`,
          {
            data: {
              sibling_global_user_id: sibling?.data[0]?.attributes?.global_id,
              student_id: studentId,
              school_name: school_name?.data?.attributes?.name || null,
              grade_id: sibling?.data[0]?.attributes?.crt_grade_id || 0,
              board_id: sibling?.data[0]?.attributes?.crt_board_id || 0,
              is_vibgyor_student: true,
              gender_id: sibling?.data[0]?.attributes?.gender_id || 0,
            },
          },
        );
        await this.parentLoginLogService.createLog({
          studentId: studentId,
          event: ParentLoginEvent.MAP_SIBLING_API,
          action: 'create new sibling record',
          log_data: { createSiblingMapping },
          ip: req?.ip,
        });
        correctSiblingIds.push(createSiblingMapping?.data?.id);
      }

      //clean up
      const cleanUpkViceSiblingMapping = await this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.Student_Siblings}?filters[$or][0][sibling_global_user_id][$eq]=${givneStudent?.data?.attributes?.global_id}&filters[$or][1][student_id][$eq]=${sibling?.data[0]?.id}`,
      );
      const cleanUpVersaSiblingMapping = await this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.Student_Siblings}?filters[$or][0][sibling_global_user_id][$eq]=${sibling?.data[0]?.attributes?.global_id}&filters[$or][1][student_id][$eq]=${givneStudent?.data?.id}`,
      );

      let cleanUpIds = [];
      const Vicefiltered = cleanUpkViceSiblingMapping.data.filter(
        (item) => !correctSiblingIds.includes(item.id),
      );

      const Versafiltered = cleanUpVersaSiblingMapping.data.filter(
        (item) => !correctSiblingIds.includes(item.id),
      );

      cleanUpIds = [...Vicefiltered, ...Versafiltered];
      console.log('clean');

      for (const item of cleanUpIds) {
        const clearstudentGuiardian = await this.mdmService.putDataToAPI(
          `${MDM_API_URLS.Student_Siblings}/${item?.id}`,
          {
            data: {
              sibling_global_user_id: null,
              student_id: null,
              school_name: null,
              grade_id: 0,
              board_id: 0,
              is_vibgyor_student: true,
              gender_id: 0,
            },
          },
        );
        await this.parentLoginLogService.createLog({
          studentId: studentId,
          event: ParentLoginEvent.MAP_SIBLING_API,
          action: 'clear dummy student-guardian record',
          log_data: { clearstudentGuiardian },
          ip: req?.ip,
        });
      }

      console.log('correctSiblingIds');
      // student guardian update
      let correctsudentGuardianid = null;
      for (let a = 0; a < guardian.length; a++) {
        const updateStudentGuardian = await this.mdmService.fetchDataFromAPI(
          `${MDM_API_URLS.STUDENT_GUARDIAN}?filters[student_id][$eq]=${sibling?.data[0]?.id}&filters[guardian_relationship_id][$eq]=${guardian[a]?.relationshipId}`,
        );
        if (updateStudentGuardian?.data?.length > 0) {
          const updateStudentGuardianData = await this.mdmService.putDataToAPI(
            `${MDM_API_URLS.STUDENT_GUARDIAN}/${updateStudentGuardian?.data[0]?.id}`,
            {
              data: {
                guardian_id: guardian[a]?.guardianId,
              },
            },
          );

          correctsudentGuardianid = updateStudentGuardianData.data?.id;
          await this.parentLoginLogService.createLog({
            studentId: studentId,
            event: ParentLoginEvent.MAP_SIBLING_API,
            action: 'correct student-guardian record updated for given sibling',
            log_data: { updateStudentGuardianData },
            ip: req?.ip,
          });
        } else {
          const createStudentGurdian = await this.mdmService.postDataToAPI(
            `${MDM_API_URLS.STUDENT_GUARDIAN}`,
            {
              data: {
                student_id: sibling?.data[0]?.id,
                guardian_id: guardian[a]?.guardianId,
                guardian_relationship_id: guardian[a]?.relationshipId,
                preferred_mobile_no: 0,
                preferred_email_no: 0,
              },
            },
          );
          correctsudentGuardianid = createStudentGurdian.data.id;
          await this.parentLoginLogService.createLog({
            studentId: studentId,
            event: ParentLoginEvent.MAP_SIBLING_API,
            action: 'create new student-guardian record for given sibling',
            log_data: { createStudentGurdian },
            ip: req?.ip,
          });
        }
        console.log('clean student guardian data');

        //  clean student guardian data
        const siblingFilter = totalSiblingIds
          .map((id, i) => `filters[student_id][$notIn][${i}]=${id}`)
          .join("&");

        const url = `${MDM_API_URLS.STUDENT_GUARDIAN}?${siblingFilter}&filters[guardian_id][$eq]=${guardian[a]?.guardianId}`;
        const allStudentGuardian = await this.mdmService.fetchDataFromAPI(url);

        console.log('allStudentGuardian', JSON.stringify(allStudentGuardian));
        for (let x = 0; x < allStudentGuardian?.data?.length; x++) {
          const removedStudentGuardian = await this.mdmService.putDataToAPI(
            `${MDM_API_URLS.STUDENT_GUARDIAN}/${allStudentGuardian?.data[x]?.id}`,
            { data: { guardian_id: null, student_id: null } },
          );
          await this.parentLoginLogService.createLog({
            studentId: studentId,
            event: ParentLoginEvent.MAP_SIBLING_API,
            action: 'dummy student-guardian record updated for given sibling',
            log_data: { removedStudentGuardian },
            ip: req?.ip,
          });
        }
      }
    }

    const updatedData = await this.axiosService
      .setBaseUrl(this.configService.get<string>('ADMIN_PANEL_URL'))
      .setUrl(`${ADMIN_API_URLS.STUDENT_PROFILE}/${body[0].studentId}`)
      .setMethod(EHttpCallMethods.GET)
      .setHeaders({
        Authorization: req.headers.authorization,
      } as AxiosRequestHeaders)
      .sendRequest();

    const auditLogs = await this.auditLogRepository.create({
      table_name: 'mdm_ac_students',
      request_body: body,
      response_body: `${JSON.stringify(body ?? {})}`,
      operation_name: 'update-student-guardian-mapping',
      created_by: 0,
      url: `/admin/studentProfile/update`,
      ip_address: 'NA',
      method: HTTP_METHODS.PUT,
      source_service: this.configService.get<string>('SERVICE'),
      record_id: body[0].studentId,
      meta: {
        updated: updatedData?.data?.data,
        previous: previousData?.data?.data,
        updated_by: 'system',
      },
    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    for (let j = 0; j < body.length - 1; j++) {
      for (let k = j + 1; k < body.length; k++) {
        const { studentId } = body[j];

        // await this.parentLoginLogService.createLog({
        //   studentId: studentId,
        //   event: ParentLoginEvent.MAP_SIBLING_API,
        //   action: 'process sibling',
        //   log_data: { body },
        //   ip: req?.ip,
        // });

        const sibling = await this.mdmService.fetchDataFromAPI(
          `${MDM_API_URLS.STUDENTS}?filters[crt_enr_on]=${body[k]?.enrolmentNumber}&filters[dob]=${body[k]?.dob}`,
        );

        const givneStudent = await this.mdmService.fetchDataFromAPI(
          `${MDM_API_URLS.STUDENTS}?filters[crt_enr_on]=${body[j]?.enrolmentNumber}&filters[dob]=${body[j]?.dob}`,
        );

        if (
          !sibling?.data ||
          sibling?.data?.length == 0 ||
          !givneStudent?.data
        ) {
          throw new HttpException(
            'Sibling not found',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        const checkViceSiblingMapping = await this.mdmService.fetchDataFromAPI(
          `${MDM_API_URLS.Student_Siblings}?filters[sibling_global_user_id][$eq]=${givneStudent?.data[0]?.attributes?.global_id}&filters[student_id][$eq]=${sibling?.data[0]?.id}`,
        );
        const checkVersaSiblingMapping = await this.mdmService.fetchDataFromAPI(
          `${MDM_API_URLS.Student_Siblings}?filters[sibling_global_user_id][$eq]=${sibling?.data[0]?.attributes?.global_id}&filters[student_id][$eq]=${givneStudent?.data[0]?.id}`,
        );
        const school_name = await this.mdmService.fetchDataFromAPI(
          `${MDM_API_URLS.SCHOOL}/${sibling?.data[0]?.attributes?.crt_school_id}`,
        );
        if (checkViceSiblingMapping?.data?.length > 0) {
          const updateSiblingMapping = await this.mdmService.putDataToAPI(
            `${MDM_API_URLS.Student_Siblings}/${checkViceSiblingMapping?.data[0]?.id}`,
            {
              data: {
                sibling_global_user_id: sibling?.data[0]?.attributes?.global_id,
                student_id: givneStudent?.data[0]?.id,
                school_name: school_name?.data?.attributes?.name || null,
                grade_id: sibling?.data[0]?.attributes?.crt_grade_id || 0,
                board_id: sibling?.data[0]?.attributes?.crt_board_id || 0,
                is_vibgyor_student: true,
                gender_id: sibling?.data[0]?.attributes?.gender_id || 0,
              },
            },
          );
          await this.parentLoginLogService.createLog({
            studentId: studentId,
            event: ParentLoginEvent.MAP_SIBLING_API,
            action: 'update first existing sibling record',
            log_data: { updateSiblingMapping },
            ip: req?.ip,
          });
          correctSiblingIds.push(updateSiblingMapping?.data?.id);
        } else if (checkVersaSiblingMapping?.data?.length > 0) {
          const updateSiblingMapping = await this.mdmService.putDataToAPI(
            `${MDM_API_URLS.Student_Siblings}/${checkVersaSiblingMapping?.data[0]?.id}`,
            {
              data: {
                sibling_global_user_id: sibling?.data[0]?.attributes?.global_id,
                student_id: givneStudent?.data[0]?.id,
                school_name: school_name?.data?.attributes?.name || null,
                grade_id: sibling?.data[0]?.attributes?.crt_grade_id || 0,
                board_id: sibling?.data[0]?.attributes?.crt_board_id || 0,
                is_vibgyor_student: true,
                gender_id: sibling?.data[0]?.attributes?.gender_id || 0,
              },
            },
          );
          await this.parentLoginLogService.createLog({
            studentId: studentId,
            event: ParentLoginEvent.MAP_SIBLING_API,
            action: 'update first existing sibling record',
            log_data: { updateSiblingMapping },
            ip: req?.ip,
          });
          correctSiblingIds.push(updateSiblingMapping?.data?.id);
        } else {
          const createSiblingMapping = await this.mdmService.postDataToAPI(
            `${MDM_API_URLS.Student_Siblings}`,
            {
              data: {
                sibling_global_user_id: sibling?.data[0]?.attributes?.global_id,
                student_id: givneStudent?.data[0]?.id,
                school_name: school_name?.data?.attributes?.name || null,
                grade_id: sibling?.data[0]?.attributes?.crt_grade_id || 0,
                board_id: sibling?.data[0]?.attributes?.crt_board_id || 0,
                is_vibgyor_student: true,
                gender_id: sibling?.data[0]?.attributes?.gender_id || 0,
              },
            },
          );
          await this.parentLoginLogService.createLog({
            studentId: studentId,
            event: ParentLoginEvent.MAP_SIBLING_API,
            action: 'create new sibling record',
            log_data: { createSiblingMapping },
            ip: req?.ip,
          });
          correctSiblingIds.push(createSiblingMapping?.data?.id);
        }
        /////////////////////clean up ////////////////

        const cleanUpkViceSiblingMapping =
          await this.mdmService.fetchDataFromAPI(
            `${MDM_API_URLS.Student_Siblings}?filters[$or][0][sibling_global_user_id][$eq]=${givneStudent?.data[0]?.attributes?.global_id}&filters[$or][1][student_id][$eq]=${sibling?.data[0]?.id}`,
          );
        const cleanUpVersaSiblingMapping =
          await this.mdmService.fetchDataFromAPI(
            `${MDM_API_URLS.Student_Siblings}?filters[$or][0][sibling_global_user_id][$eq]=${sibling?.data[0]?.attributes?.global_id}&filters[$or][1][student_id][$eq]=${givneStudent?.data[0]?.id}`,
          );

        let cleanUpIds = [];
        const Vicefiltered = cleanUpkViceSiblingMapping.data.filter(
          (item) => !correctSiblingIds.includes(item.id),
        );

        const Versafiltered = cleanUpVersaSiblingMapping.data.filter(
          (item) => !correctSiblingIds.includes(item.id),
        );

        cleanUpIds = [...Vicefiltered, ...Versafiltered];

        for (const item of cleanUpIds) {
          const clearstudentGuiardian = await this.mdmService.putDataToAPI(
            `${MDM_API_URLS.Student_Siblings}/${item?.id}`,
            {
              data: {
                sibling_global_user_id: null,
                student_id: null,
                school_name: null,
                grade_id: 0,
                board_id: 0,
                is_vibgyor_student: true,
                gender_id: 0,
              },
            },
          );
        }
      }
    }
  }


  async findGurdian(body: any, req: any) {
    const { enrolmentNumber, dob } = body;

    if (!enrolmentNumber && dob) {
      throw new HttpException(
        'Student enrolmentNumber required',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (enrolmentNumber && !dob) {
      throw new HttpException(
        'Student dob required',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const parentList = [];

    const existingStudent: any = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.STUDENTS}?filters[crt_enr_on]=${enrolmentNumber}&filters[dob]=${dob}`,
    );

    if (!existingStudent?.data || existingStudent?.data?.length === 0) {
      throw new HttpException(
        'Student not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const existingStudentGurdian: any = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.STUDENT_GUARDIAN}?filters[student_id][$eq]=${existingStudent?.data[0]?.id}`,
    );

    for (let i = 0; i < existingStudentGurdian?.data?.length; i++) {
      const parentDeatil = await this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.GUARDIANS}/${existingStudentGurdian?.data[i]?.attributes?.guardian_id}`,
      );
      if (parentDeatil?.data) {
        parentList.push({
          ...parentDeatil?.data,
          guardian_relationship_id:
            existingStudentGurdian?.data[i]?.attributes
              ?.guardian_relationship_id,
        });
      }
    }

    await this.parentLoginLogService.createLog({
      studentId: existingStudent?.data[0]?.id,
      event: ParentLoginEvent.GET_CHILD_PARENT_API,
      action: 'get guardians for given student',
      log_data: {
        student: existingStudent?.data[0],
        parentList: parentList,
      },
      ip: req?.ip,
    });

    return {
      student: existingStudent?.data[0],
      parentList: parentList,
    };
  }

  async reOpenEnquiry(enquiryId: string, reqBody: any) {

    console.log("reqbody", reqBody);

    try {
      if (!enquiryId) {
        throw new NotFoundException('Enquiry Id not found');
      }

      const enquiryData = await this.enquiryRepository.getById(
        new Types.ObjectId(enquiryId),
      );

      if (reqBody.validate) {
        if (enquiryData?.status !== 'Closed') {
          throw new NotFoundException('Enquiry is not closed');
        }

        const currentAcademicYear = this.getCurrentAcademicYear();
        const enquiryAcademicYear = enquiryData.academic_year.value.slice(0, 4);

        const laterStages = enquiryData.enquiry_stages.slice(5);

        const hasNonOpenAfterFourth = laterStages.some(
          (s: any) => s.status !== 'Open',
        );

        if (hasNonOpenAfterFourth) {
          throw new BadRequestException(
            'Cannot reopen enquiry because enquirer is already in admission stage.',
          );
        } else if (Number(enquiryAcademicYear) < Number(currentAcademicYear)) {
          throw new BadRequestException(
            'Cannot reopen enquiry for a past academic year.',
          );
        }
        const duplicateOpen = await this.enquiryRepository.getOne({
          _id: { $ne: enquiryId }, // exclude the current enquiry
          'student_details.first_name': enquiryData.student_details.first_name,
          'student_details.last_name': enquiryData.student_details.last_name,
          'student_details.dob': enquiryData.student_details.dob,
          status: 'Open',
        });

        if (duplicateOpen) {
          throw new BadRequestException(
            'Cannot reopen enquiry because another open enquiry already exists for the same student.',
          );
        }
      } else if (!reqBody.validate) {
        await this.enquiryRepository.updateOne(
          { _id: enquiryId },
          { status: 'Open' },
        );

        await this.enquiryLogService.createLog({
          enquiry_id: new Types.ObjectId(enquiryId),
          event_type: EEnquiryEventType.ENQUIRY,
          event_sub_type: EEnquiryEventSubType.ENQUIRY_ACTION,
          event: EEnquiryEvent.ENQUIRY_REOPENED,
          log_data: reqBody?.reopenReason,
          created_by: reqBody?.created_by?.user_name ? reqBody?.created_by?.user_name : 'NA',
          created_by_id: reqBody?.created_by?.user_id ? reqBody?.created_by?.user_id : 'NA',
        });
      }
    } catch (error) {
      console.error('Error in reOpenEnquiry:', {
        error: error.message,
      });
      throw new HttpException(
        'Invalid field value',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  }

  /**
   * Returns the current academic year ID
   * Example: 2024-25 → return 2024
   */
  getCurrentAcademicYear(): number {
    const year = new Date().getFullYear();
    const nextYear = year + 1;
    return year; // e.g. "2025-2026"
  }

  async setFileUploadStorage() {
    const bucketName = this.configService.get<string>('BUCKET_NAME');
    const folderName = this.configService.get<string>('FOLDER_NAME');

    this.storageService.setStorage(EStorageType.GCS, {
      projectId: this.configService.get<string>('PROJECT_ID'),
      credentials: {
        type: this.configService.get<string>('TYPE'),
        project_id: this.configService.get<string>('PROJECT_ID'),
        private_key_id: this.configService.get<string>('PRIVATE_KEY_ID'),
        private_key: this.configService
          .get<string>('PRIVATE_KEY')
          .replace(/\\n/g, '\n'),
        client_email: this.configService.get<string>('CLIENT_EMAIL'),
        client_id: this.configService.get<string>('GCS_CLIENT_ID'),
        auth_uri: this.configService.get<string>('AUTH_URI'),
        token_uri: this.configService.get<string>('TOKEN_URI'),
        auth_provider_x509_cert_url: this.configService.get<string>(
          'AUTH_PROVIDER_X509_CERT_URL',
        ),
        client_x509_cert_url: this.configService.get<string>(
          'CLIENT_X509_CERT_URL',
        ),
        universe_domain: this.configService.get<string>('UNIVERSAL_DOMAIN'),
      },
      bucketName: bucketName,
      folderName: folderName,
    });
    return { bucketName };
  }

  async create(req: Request) {

    const payload = req.body;

    const { metadata, data } = payload;
    const createdByDetails = extractCreatedByDetailsFromBody(req);
    if (createdByDetails) {
      data.created_by = payload.created_by;
      delete payload?.created_by;
    }
    let anotherStudentDetail;

    // Converting email in lower case
    if (data['parent_details.father_details.email']) {
      data['parent_details.father_details.email'] =
        data['parent_details.father_details.email'].toLowerCase();
    } else if (data['parent_details.mother_details.email']) {
      data['parent_details.mother_details.email'] =
        data['parent_details.mother_details.email'].toLowerCase();
    } else if (data['parent_details.guardian_details.email']) {
      data['parent_details.guardian_details.email'] =
        data['parent_details.guardian_details.email'].toLowerCase();
    }

    const isAnotherChild = payload?.data?.['is_another_child_enquiry'];
    if (payload?.data?.['is_another_child_enquiry'] === 'yes') {
      anotherStudentDetail = {
        first_name: payload?.data?.['another_student_details.first_name'],
        last_name: payload?.data?.['another_student_details.last_name'],
        dob: payload?.data?.['another_student_details.dob'],
      };
      delete payload?.data['another_student_details.type'];
      delete payload.data['another_student_details.first_name'];
      delete payload.data['another_student_details.last_name'];
      delete payload.data['another_student_details.dob'];
    }
    const { form_id, enquiry_type_id } = metadata;
    const enquiryFormDetails = await this.enquiryHelper.getEnquiryFormDetails(
      form_id,
      req.headers.authorization,
    );
    const { inputs: formFields } = enquiryFormDetails;
    const validationObjects =
      this.enquiryHelper.extractValidationObjects(formFields);
    const errors = this.enquiryHelper.validateFormData(data, validationObjects);
    if (Object.keys(errors).length) {
      throw new HttpException('Invalid field value', HttpStatus.BAD_REQUEST, {
        cause: errors,
      });
    }

    const enquiryTypeDetails =
      await this.enquiryTypeService.getEnquiryTypeDetailsWithStageName(
        enquiry_type_id,
      );

    if (!enquiryTypeDetails) {
      throw new HttpException(
        'Invalid enquiry type sent',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { stages, slug } = enquiryTypeDetails;

    const paths = this.enquiryRepository.getSchemaPaths();

    const defaultEnquiryFields =
      await this.enquiryHelper.getDefaultEnquiryFields(createdByDetails);
    let createPayload = this.enquiryHelper.generateEnquirySchema(data, paths);

    const other_details_ =
      await this.enquiryHelper.checkAndAddNewAdmissionConcessionTags(
        slug,
        createPayload.other_details,
        req.headers.authorization,
      );
    createPayload.other_details = other_details_;
    createPayload.other_details['terms_and_conditions_email_sent'] = false; //Setting the flag as false by default
    createPayload.other_details['are_terms_and_condition_accepted'] = true; //Setting the flag as true bypass the terms and conditions check, in future again set the flag as false
    // Nikhil
    // Map Employee Source
    if (data['enquiry_employee_source.id']) {
      createPayload.other_details['enquiry_employee_source_id'] = data['enquiry_employee_source.id'];
      createPayload.other_details['enquiry_employee_source_value'] = data['enquiry_employee_source.value'];
      createPayload.other_details['enquiry_employee_source_name'] = data['enquiry_employee_source.name'];
      createPayload.other_details['enquiry_employee_source_number'] = data['enquiry_employee_source.number'];
    }

    // Map Parent Source
    else if (data['enquiry_parent_source.id']) {
      createPayload.other_details['enquiry_parent_source_id'] = data['enquiry_parent_source.id'];
      createPayload.other_details['enquiry_parent_source_value'] = data['enquiry_parent_source.value'];
      createPayload.other_details['enquiry_parent_source_enquirynumber'] = data['enquiry_parent_source.enquirynumber'];
    }

    // Map Corporate Source
    else if (data['enquiry_corporate_source.id']) {
      createPayload.other_details['enquiry_corporate_source_id'] = data['enquiry_corporate_source.id'];
      createPayload.other_details['enquiry_corporate_source_value'] = data['enquiry_corporate_source.value'];
      createPayload.other_details['enquiry_corporate_source_number'] = data['enquiry_corporate_source.spoc_mobile_no'];
      createPayload.other_details['enquiry_corporate_source_email'] = data['enquiry_corporate_source.spoc_email'];
    }

    // Map Pre-School Source
    else if (data['enquiry_school_source.id']) {
      createPayload.other_details['enquiry_school_source_id'] = data['enquiry_school_source.id'];
      createPayload.other_details['enquiry_school_source_value'] = data['enquiry_school_source.value'];
      createPayload.other_details['enquiry_school_source_number'] = data['enquiry_school_source.spoc_mobile_no'];
      createPayload.other_details['enquiry_school_source_email'] = data['enquiry_school_source.spoc_email'];
    }



    createPayload.enquiry_number = await this.enquiryHelper.getGlobalId(
      GLOBAL_ENQUIRY_GENERATOR_ID,
    );
    let fatherGlobalId = null;
    let motherGlobalId = null;
    let guardianGlobalId = null;
    let parentSsoUsername = null;
    let parentSsoPassword = null;
    switch (data.parent_type) {
      case EParentType.FATHER:
        if (
          createPayload?.parent_details?.father_details?.mobile &&
          createPayload?.parent_details?.father_details?.email
        ) {
          const response = await this.enquiryHelper.getParentGlobalId(
            createPayload.parent_details.father_details.mobile,
            createPayload.parent_details.father_details.email,
            createPayload.parent_details?.father_details?.first_name,
            createPayload.parent_details?.father_details?.last_name,
          );
          fatherGlobalId = response.global_no;
          parentSsoUsername = response.sso_email;
          parentSsoPassword = response.sso_password;
        }
        createPayload.parent_details.father_details.global_id = fatherGlobalId;
        createPayload.parent_details.father_details.sso_username =
          parentSsoUsername;
        createPayload.parent_details.father_details.sso_password =
          parentSsoPassword;
        break;
      case EParentType.MOTHER:
        if (
          createPayload?.parent_details?.mother_details?.mobile &&
          createPayload?.parent_details?.mother_details?.email
        ) {
          const response = await this.enquiryHelper.getParentGlobalId(
            createPayload.parent_details.mother_details.mobile,
            createPayload.parent_details.mother_details.email,
            createPayload.parent_details?.mother_details?.first_name,
            createPayload.parent_details?.mother_details?.last_name,
          );
          motherGlobalId = response.global_no;
          parentSsoUsername = response.sso_email;
          parentSsoPassword = response.sso_password;
        }
        createPayload.parent_details.mother_details.global_id = motherGlobalId;
        createPayload.parent_details.mother_details.sso_username =
          parentSsoUsername;
        createPayload.parent_details.mother_details.sso_password =
          parentSsoPassword;
        break;
      case EParentType.GUARDIAN:
        if (
          createPayload?.parent_details?.guardian_details?.mobile &&
          createPayload?.parent_details?.guardian_details?.email
        ) {
          const response = await this.enquiryHelper.getParentGlobalId(
            createPayload.parent_details.guardian_details.mobile,
            createPayload.parent_details.guardian_details.email,
            createPayload.parent_details?.guardian_details?.first_name,
            createPayload.parent_details?.guardian_details?.last_name,
          );
          guardianGlobalId = response.global_no;
          parentSsoUsername = response.sso_email;
          parentSsoPassword = response.sso_password;
        }
        createPayload.parent_details.guardian_details.global_id =
          guardianGlobalId;
        createPayload.parent_details.guardian_details.sso_username =
          parentSsoUsername;
        createPayload.parent_details.guardian_details.sso_password =
          parentSsoPassword;
        break;
    }

    if (
      createPayload?.student_details?.first_name &&
      createPayload?.student_details?.last_name &&
      createPayload?.student_details?.dob
    ) {
      const studentGlobalId = await this.enquiryHelper.getStudentGlobalId(
        createPayload.student_details.first_name,
        createPayload.student_details.last_name,
        createPayload.student_details.dob,
      );
      createPayload.student_details.global_id = studentGlobalId;
    }

    createPayload.enquiry_type_id = new Types.ObjectId(
      enquiry_type_id as string,
    );
    createPayload.enquiry_form_id = new Types.ObjectId(form_id as string);

    // if (
    //   enquiry_type_id &&
    //   createPayload?.student_details?.first_name &&
    //   ((createPayload?.parent_details?.father_details?.mobile &&
    //     createPayload?.parent_details?.father_details?.email) ||
    //     (createPayload?.parent_details?.mother_details?.mobile &&
    //       createPayload?.parent_details?.mother_details?.email) ||
    //     (createPayload?.parent_details?.guardian_details?.mobile &&
    //       createPayload?.parent_details?.guardian_details?.email))
    // ) {
    //   const response =
    //     await this.enquiryHelper.getDuplicateEnquiriesCountWhileCreate({
    //       ...createPayload,
    //       ...stages,
    //       ...defaultEnquiryFields,
    //     });

    //   if (response.duplicate > 0) {
    //     return {
    //       flag: 'duplicate',
    //       enquiry_id: response.result[0].projectedResults[0]._id.toString(),
    //       message: `This lead is been already created by ${response.result[0].projectedResults[0].assigned_to}
    //       with Enquiry No ${response.result[0].projectedResults[0].enquiry_number} for
    //       ${response.result[0].projectedResults[0].school_location.value}.
    //       if you click on continue, the owner of the existing lead will be replaced by yours.`,
    //     };
    //   }
    // }

    let student_slug: string;
    if (
      createPayload?.other_details?.['enquiry_type'] ===
      ENQUIRY_TYPE.NEW_ADMISSION
    ) {
      student_slug = ENQUIRY_TYPE_SLUG.NEW_ADMISSION;
    } else if (
      createPayload?.other_details?.['enquiry_type'] === ENQUIRY_TYPE.KIDS_CLUB
    ) {
      student_slug = ENQUIRY_TYPE_SLUG.KIDS_CLUB;
    } else if (
      createPayload?.other_details?.['enquiry_type'] === ENQUIRY_TYPE.PSA
    ) {
      student_slug = ENQUIRY_TYPE_SLUG.PSA;
    } else if (
      createPayload?.other_details?.['enquiry_type'] === ENQUIRY_TYPE.ADMISSION_10_11
    ) {
      const admissionDetail = await this.admissionRepository.getOne({
        enrolment_number: createPayload?.student_details?.enrolment_number,
      });
      const previousEnquiryDetails = await this.enquiryRepository.getById(new Types.ObjectId(admissionDetail.enquiry_id));

      createPayload.parent_details = { ...previousEnquiryDetails.parent_details };
      // createPayload.existing_school_details = { ...previousEnquiryDetails.existing_school_details };
      createPayload.residential_details = { ...previousEnquiryDetails.residential_details };
      createPayload.sibling_details = { ...previousEnquiryDetails.sibling_details };
      createPayload.contact_details = { ...previousEnquiryDetails.contact_details };
      createPayload.medical_details = { ...previousEnquiryDetails.medical_details };
      createPayload.bank_details = { ...previousEnquiryDetails.bank_details };
      createPayload.documents = [...previousEnquiryDetails.documents];
      // console.log(JSON.stringify(createPayload));
    }

    const responseStudentSlug = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.STUDENT_TAGS}?filters[slug]=${student_slug}`,
    );
    if (responseStudentSlug?.data?.length) {
      createPayload.other_details = {
        ...other_details_,
        student_slug: [...responseStudentSlug.data],
      };
    }

    const enquiry: Partial<EnquiryDocument & Document> =
      await this.enquiryHelper.createEnquiry(
        createPayload,
        stages,
        defaultEnquiryFields,
      );
    if (enquiry.other_details?.['student_slug']?.length) {
      await this.mdmService.postDataToAPI(`${MDM_API_URLS.POST_STUDENT_TAGS}`, {
        data: {
          student_id: null,
          tag_id: enquiry.other_details?.['student_slug'][0]['id'],
          added_on: `${moment(enquiry['created_at']).format('YYYY-MM-DD')}`,
          removed_on: `${moment(enquiry['created_at']).add(1, 'y').format('YYYY-MM-DD')}`,
          is_verified: 1,
          enquiry_id: `${enquiry._id.toString()}`,
        },
      });
    }

    console.log('before notif call');
    this.loggerService.log(
      `notification sent to ${JSON.stringify(createPayload)}, data:: ${JSON.stringify(data)}`,
    );

    const globalIds = [];
    if (data?.parent_type === 'guardian') {
      globalIds.push(guardianGlobalId);
    } else if (data?.parent_type === 'father') {
      globalIds.push(fatherGlobalId);
    } else {
      globalIds.push(motherGlobalId);
    }

    // below function sends notification
    this.emailService.setEnquiryDetails(enquiry).sendNotification(
      EMAIL_TEMPLATE_SLUGS.ENQUIRY_CREATED,
      {
        enq_no: enquiry.enquiry_number,
        e_signature: '+91 6003000700',
        link: 'https://www.vibgyorhigh.com/',
        username: parentSsoUsername,
        password: parentSsoPassword,
      },
      [
        this.enquiryHelper.getEnquirerDetails(enquiry, 'email')
          ?.email as string,
      ],
    );

    // Create a new task
    const tPlusFiveDate = new Date();
    tPlusFiveDate.setDate(new Date().getDate() + 5);
    tPlusFiveDate.setHours(23, 59, 59, 999);

    await this.myTaskService.createMyTask({
      enquiry_id: enquiry._id.toString(),
      created_for_stage: ETaskEntityType.ENQUIRY,
      valid_from: new Date(),
      valid_till: tPlusFiveDate,
      task_creation_count: 1,
      assigned_to_id: enquiry.assigned_to_id,
    });
    if (isAnotherChild === 'yes') {
      const enquiryNumberAnotherChild = await this.enquiryHelper.getGlobalId(
        GLOBAL_ENQUIRY_GENERATOR_ID,
      );
      const anotherStudentPayload = {
        ...createPayload,
        enquiry_number: enquiryNumberAnotherChild,
        student_details: {
          first_name: anotherStudentDetail.first_name,
          last_name: anotherStudentDetail.last_name,
          dob: anotherStudentDetail.dob,
        },
      };
      await this.enquiryHelper.createEnquiry(
        anotherStudentPayload,
        stages,
        defaultEnquiryFields,
      );
    }
    return enquiry;
  }

  async update(
    enquiryId: string,
    payload: any,
    userInfo: CreatedByDetailsDto | null,
    req: Request,
  ) {
    const { metadata, data } = payload;
    const { form_id, enquiry_type_id } = metadata;
    const enquiryFormDetails = await this.enquiryHelper.getEnquiryFormDetails(
      form_id,
      req.headers.authorization,
    );
    const { inputs: formFields } = enquiryFormDetails;
    const validationObjects =
      this.enquiryHelper.extractValidationObjects(formFields);
    const errors = this.enquiryHelper.validateFormData(data, validationObjects);
    if (Object.keys(errors).length) {
      throw new HttpException('Invalid field value', HttpStatus.BAD_REQUEST, {
        cause: errors,
      });
    }

    const enquiryTypeDetails =
      await this.enquiryTypeService.getEnquiryTypeDetailsWithStageName(
        enquiry_type_id,
      );

    if (!enquiryTypeDetails) {
      throw new HttpException(
        'Invalid enquiry type sent',
        HttpStatus.BAD_REQUEST,
      );
    }
    const existingEnquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );
    const paths = this.enquiryRepository.getSchemaPaths();
    const updatePayload = this.enquiryHelper.generateEnquirySchema(
      data,
      paths,
      existingEnquiryDetails,
    );
    updatePayload.enquiry_type_id = new Types.ObjectId(
      enquiry_type_id as string,
    );
    updatePayload.enquiry_form_id = new Types.ObjectId(form_id as string);

    if (userInfo) {
      // check if school_location.id is different than in DB
      const newLocationId = payload?.data?.['school_location.id'];
      const oldLocationId = existingEnquiryDetails?.school_location?.id;
      console.log("locations:", newLocationId, oldLocationId, userInfo?.user_name);

      if (newLocationId && String(newLocationId) !== String(oldLocationId)) {
        updatePayload.assigned_to = userInfo?.user_name ?? null;
        updatePayload.assigned_to_id = userInfo?.user_id ?? null;
      }
      this.enquiryLogService.createLog({
        enquiry_id: new Types.ObjectId(enquiryId),
        event_type: EEnquiryEventType.REASSIGN,
        event_sub_type: EEnquiryEventSubType.ADMISSION_ACTION,
        event: EEnquiryEvent.ENQUIRY_REASSIGNED,
        created_by: `${userInfo?.user_name}`,
        created_by_id: userInfo?.user_id,
      })
    }


    const { updatedEnquiryStages, isRegistrationStageCompleted } =
      this.enquiryHelper.getUpdatedStatusOfEnquiryStage(
        enquiryTypeDetails,
        existingEnquiryDetails.enquiry_stages,
        form_id,
      );
    updatePayload.enquiry_stages = updatedEnquiryStages;

    if (
      updatePayload?.parent_details?.father_details?.mobile &&
      updatePayload?.parent_details?.father_details?.email
    ) {
      const response = await this.enquiryHelper.getParentGlobalId(
        updatePayload.parent_details.father_details.mobile,
        updatePayload.parent_details.father_details.email,
        updatePayload?.parent_details?.father_details?.first_name,
        updatePayload?.parent_details?.father_details?.last_name,
      );
      updatePayload.parent_details.father_details.global_id =
        response.global_no;
      updatePayload.parent_details.father_details.sso_username =
        response.sso_email;
      updatePayload.parent_details.father_details.sso_password =
        response.sso_password;
    }

    if (
      updatePayload?.parent_details?.mother_details?.mobile &&
      updatePayload?.parent_details?.mother_details?.email
    ) {
      const response = await this.enquiryHelper.getParentGlobalId(
        updatePayload.parent_details.mother_details.mobile,
        updatePayload.parent_details.mother_details.email,
        updatePayload?.parent_details?.mother_details?.first_name,
        updatePayload?.parent_details?.mother_details?.last_name,
      );
      updatePayload.parent_details.mother_details.global_id =
        response.global_no;
      updatePayload.parent_details.mother_details.sso_username =
        response.sso_email;
      updatePayload.parent_details.mother_details.sso_password =
        response.sso_password;
    }

    if (
      updatePayload?.parent_details?.guardian_details?.mobile &&
      updatePayload?.parent_details?.guardian_details?.email
    ) {
      const response = await this.enquiryHelper.getParentGlobalId(
        updatePayload.parent_details.guardian_details.mobile,
        updatePayload.parent_details.guardian_details.email,
        updatePayload?.parent_details?.guardian_details?.first_name,
        updatePayload?.parent_details?.guardian_details?.last_name,
      );
      updatePayload.parent_details.guardian_details.global_id =
        response.global_no;
      updatePayload.parent_details.guardian_details.sso_username =
        response.sso_email;
      updatePayload.parent_details.guardian_details.sso_password =
        response.sso_password;
    }

    const enquiry = await this.enquiryRepository.updateById(
      new Types.ObjectId(enquiryId),
      updatePayload,
    );
    // 🔎 Re-fetch latest enquiry to ensure updated stages are included
    const getEnquiry = await this.enquiryRepository.getById(enquiry._id);

    // ---- Stage based checks ----
    const registrationStage = getEnquiry.enquiry_stages.find(
      (stage) => stage.stage_name === "Academic Kit Selling"
    );

    const admissionStage = getEnquiry.enquiry_stages.find(
      (stage) => stage.stage_name === "Payment"
    );

    console.log("registrationStage", registrationStage);
    console.log("admissionStage", admissionStage);

    // Handle registration fee trigger
    if (
      registrationStage?.status === "In Progress" ||
      admissionStage?.status === "Completed"
    ) {
      await this.enquiryRepository.updateById(getEnquiry._id, {
        registration_fee_request_triggered: false,
      });

      await this.enquiryHelper.sendCreateRegistrationFeeRequest(getEnquiry, req);
    }

    // Handle admission fee trigger
    if (
      admissionStage?.status === "In Progress" ||
      admissionStage?.status === "Completed"
    ) {
      await this.admissionRepository.updateById(getEnquiry._id, {
        admission_fee_request_triggered: false,
      });

      await this.admissionService.sendPaymentRequest(enquiryId, req);
    }

    if (isRegistrationStageCompleted) {
      const tPlusFiveDate = new Date();
      tPlusFiveDate.setDate(new Date().getDate() + 5);
      tPlusFiveDate.setHours(23, 59, 59, 999);

      await Promise.all([
        this.enquiryRepository.updateById(enquiry._id, {
          is_registered: true,
          registered_at: new Date(),
        }),
        this.myTaskService.createMyTask({
          enquiry_id: enquiry._id.toString(),
          created_for_stage: ETaskEntityType.REGISTRATION,
          task_creation_count: 1,
          valid_from: new Date(),
          valid_till: tPlusFiveDate,
          assigned_to_id: enquiry.assigned_to_id,
        }),
        this.enquiryLogService.createLog({
          enquiry_id: enquiry._id,
          event_type: EEnquiryEventType.REGISTRATION,
          event_sub_type: EEnquiryEventSubType.REGISTRATION_ACTION,
          event: EEnquiryEvent.REGISTRATION_DETAILS_RECIEVED,
          created_by: userInfo?.user_name ?? null,
          created_by_id: userInfo?.user_id ?? null,
        }),
      ]);
    }

    return enquiry;
  }

  async updateEnquiryData(enquiryId: string, payload: any) {
    const enquiryDetails = await this.enquiryRepository.updateById(
      new Types.ObjectId(enquiryId),
      payload,
    );
    return enquiryDetails;
  }

  async getEnquiryDetails(enquiryId: string) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );
    const result = {
      ...enquiryDetails,
      ...(enquiryDetails?.other_details ? enquiryDetails?.other_details : {}),
    };
    delete result.other_details;
    return result;
  }

  async getEnquiryDetailsCC(
    req: Request,
    page?: number,
    size?: number,
    filtersArray?: FilterItemDto[],
    globalSearchText?: string,
    sortBy?: string,              // NEW PARAMETER
    sortOrder?: 'asc' | 'desc',   // NEW PARAMETER
  ) {
    const startTime = Date.now(); // For performance monitoring

    const pageNumber = page || 1;
    const pageSize = size ? parseInt(size as any, 10) : 10;
    const skip = (pageNumber - 1) * pageSize;

    const createdByDetails = extractCreatedByDetailsFromBody(req);
    const { permissions } = await getSessionData(req, this.redisInstance);
    const isSuperAdmissionPermission = !!permissions.find(
      (permission) =>
        permission.toLowerCase() === ALL_LEADS_PERMISSION.toLowerCase(),
    );

    const { user_id } = createdByDetails;
    let customFilter = {};

    let isStatusFilterApplied = false;
    let hasAnyFilter = false;

    // Check if any filters are provided
    if (filtersArray && filtersArray.length > 0) {
      hasAnyFilter = true;
      filtersArray.forEach((filter) => {
        const { column, operation, search } = filter;
        const filterClause = buildFilter(column, operation, search);
        if (column === 'status') {
          isStatusFilterApplied = true;
        }
        customFilter = { ...customFilter, ...filterClause };
      });
    }

    // Check if global search is provided
    if (globalSearchText && globalSearchText.trim()) {
      hasAnyFilter = true;
    }

    const stages = await this.enquiryStageRepository.getMany(
      {
        name: {
          $in: ENQUIRY_STAGES,
        },
      },
      { name: 1 },
    );

    const pipeline: PipelineStage[] = [];

    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    const escapeRegex = (str: string): string => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    // ============================================
    // STEP 1: INITIAL MATCH
    // ============================================
    const baseMatch = {
      ...(!isSuperAdmissionPermission ? { assigned_to_id: user_id } : {}),
      ...(!hasAnyFilter ? { status: EEnquiryStatus.OPEN } : {}),
    };

    pipeline.push({ $match: baseMatch });

    // ============================================
    // STEP 2: ENHANCED GLOBAL SEARCH
    // ============================================
    if (globalSearchText && globalSearchText.trim()) {
      const searchText = globalSearchText.trim();
      const escapedSearchText = escapeRegex(searchText);

      // Enhanced email detection
      const fullEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isFullEmail = fullEmailPattern.test(searchText);

      // Check if it could be a partial email search (contains @ or looks like domain)
      const containsAt = searchText.includes('@');
      const isDomainLike = /^[a-zA-Z0-9]+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/.test(searchText);

      // Check if it's a phone number search (digits, spaces, hyphens, parentheses, or starts with +)
      const phonePattern = /^[\d\s\-\(\)\+]+$/;
      const looksLikePhone = phonePattern.test(searchText);

      if (looksLikePhone) {
        // ============================================
        // MOBILE NUMBER SEARCH (with normalization)
        // ============================================
        const escapedNormalizedSearch = escapeRegex(searchText);

        // Check if search text might include country code
        const startsWithPlus = searchText.startsWith('+');
        const searchWithoutPlus = searchText.replace(/^\+/, '');

        pipeline.push({
          $match: {
            $or: [
              { enquiry_number: { $regex: escapedSearchText, $options: 'i' } },
              // Father mobile - exact search with + if present
              {
                $expr: {
                  $regexMatch: {
                    input: {
                      $replaceAll: {
                        input: {
                          $replaceAll: {
                            input: {
                              $replaceAll: {
                                input: {
                                  $replaceAll: {
                                    input: { $ifNull: ['$parent_details.father_details.mobile', ''] },
                                    find: ' ',
                                    replacement: '',
                                  },
                                },
                                find: '-',
                                replacement: '',
                              },
                            },
                            find: '(',
                            replacement: '',
                          },
                        },
                        find: ')',
                        replacement: '',
                      },
                    },
                    regex: startsWithPlus ? escapedSearchText : escapedNormalizedSearch,
                  },
                },
              },
              // Mother mobile - exact search with + if present
              {
                $expr: {
                  $regexMatch: {
                    input: {
                      $replaceAll: {
                        input: {
                          $replaceAll: {
                            input: {
                              $replaceAll: {
                                input: {
                                  $replaceAll: {
                                    input: { $ifNull: ['$parent_details.mother_details.mobile', ''] },
                                    find: ' ',
                                    replacement: '',
                                  },
                                },
                                find: '-',
                                replacement: '',
                              },
                            },
                            find: '(',
                            replacement: '',
                          },
                        },
                        find: ')',
                        replacement: '',
                      },
                    },
                    regex: startsWithPlus ? escapedSearchText : escapedNormalizedSearch,
                  },
                },
              },
              // Guardian mobile - exact search with + if present
              {
                $expr: {
                  $regexMatch: {
                    input: {
                      $replaceAll: {
                        input: {
                          $replaceAll: {
                            input: {
                              $replaceAll: {
                                input: {
                                  $replaceAll: {
                                    input: { $ifNull: ['$parent_details.guardian_details.mobile', ''] },
                                    find: ' ',
                                    replacement: '',
                                  },
                                },
                                find: '-',
                                replacement: '',
                              },
                            },
                            find: '(',
                            replacement: '',
                          },
                        },
                        find: ')',
                        replacement: '',
                      },
                    },
                    regex: startsWithPlus ? escapedSearchText : escapedNormalizedSearch,
                  },
                },
              },
            ]
          }
        });
      } else if (isFullEmail || containsAt || isDomainLike) {
        // ============================================
        // EMAIL SEARCH (Full, Username, or Domain)
        // ============================================

        const emailSearchConditions: any[] = [];
        const emailFields = [
          'parent_details.father_details.email',
          'parent_details.mother_details.email',
          'parent_details.guardian_details.email'
        ];

        if (containsAt) {
          // User typed something with @
          // Example: "sanjeev@" or "sanjeev@gmail" or "sanjeevmajhi@gmail.com"

          if (isFullEmail) {
            // Complete email search - exact match on full email
            emailFields.forEach((field) => {
              emailSearchConditions.push({
                [field]: { $regex: `^${escapedSearchText}$`, $options: 'i' }
              });
            });
          } else {
            // Partial email with @
            // Split into username and domain parts
            const [usernamePart, domainPart] = searchText.split('@');
            const escapedUsername = escapeRegex(usernamePart);
            const escapedDomain = domainPart ? escapeRegex(domainPart) : '';

            if (domainPart) {
              // Search for: username@domain (both parts provided)
              emailFields.forEach((field) => {
                emailSearchConditions.push({
                  [field]: {
                    $regex: `^${escapedUsername}.*@.*${escapedDomain}`,
                    $options: 'i'
                  }
                });
              });
            } else {
              // Only username before @
              emailFields.forEach((field) => {
                emailSearchConditions.push({
                  [field]: {
                    $regex: `${escapedUsername}.*@`,
                    $options: 'i'
                  }
                });
              });
            }
          }
        } else if (isDomainLike) {
          // Domain-only search (no @)
          emailFields.forEach((field) => {
            emailSearchConditions.push({
              [field]: {
                $regex: `@.*${escapedSearchText}`,
                $options: 'i'
              }
            });
          });
        } else {
          // Username-only search (no @ and not domain-like)
          emailFields.forEach((field) => {
            emailSearchConditions.push({
              [field]: {
                $regex: `${escapedSearchText}.*@`,
                $options: 'i'
              }
            });
          });
        }

        pipeline.push({
          $match: {
            $or: emailSearchConditions
          }
        });
      } else {
        // ============================================
        // TEXT SEARCH (Names)
        // ============================================
        pipeline.push({
          $match: {
            $or: [
              { enquiry_number: { $regex: escapedSearchText, $options: 'i' } },
              { 'student_details.first_name': { $regex: escapedSearchText, $options: 'i' } },
              { 'student_details.last_name': { $regex: escapedSearchText, $options: 'i' } },
              { 'parent_details.father_details.first_name': { $regex: escapedSearchText, $options: 'i' } },
              { 'parent_details.father_details.last_name': { $regex: escapedSearchText, $options: 'i' } },
              { 'parent_details.mother_details.first_name': { $regex: escapedSearchText, $options: 'i' } },
              { 'parent_details.mother_details.last_name': { $regex: escapedSearchText, $options: 'i' } },
              { 'parent_details.guardian_details.first_name': { $regex: escapedSearchText, $options: 'i' } },
              { 'parent_details.guardian_details.last_name': { $regex: escapedSearchText, $options: 'i' } },
              {

                $expr: {
                  $regexMatch: {
                    input: { $concat: [{ $ifNull: ['$student_details.first_name', ''] }, ' ', { $ifNull: ['$student_details.last_name', ''] }] },
                    regex: escapedSearchText, // Matches "John Doe" exactly against the full name
                     options: 'i',
                  },
                },
              },
              // Father Full Name
              {
                $expr: {
                  $regexMatch: {
                    input: { $concat: [{ $ifNull: ['$parent_details.father_details.first_name', ''] }, ' ', { $ifNull: ['$parent_details.father_details.last_name', ''] }] },
                     regex: escapedSearchText,
                    options: 'i',
                  },
                },
              },
              // Mother Full Name
              {
                $expr: {
                  $regexMatch: {
                    input: {
                      $concat: [
                        { $ifNull: ['$parent_details.mother_details.first_name', ''] },
                        ' ',
                        { $ifNull: ['$parent_details.mother_details.last_name', ''] }
                      ]
                    },
                    regex: escapedSearchText,
                    options: 'i',
                  },
                },
              },
              // Guardian Full Name
              {
                $expr: {
                  $regexMatch: {
                    input: {
                      $concat: [
                        { $ifNull: ['$parent_details.guardian_details.first_name', ''] },
                        ' ',
                        { $ifNull: ['$parent_details.guardian_details.last_name', ''] }
                      ]
                    },
                    regex: escapedSearchText,
                    options: 'i',
                  },
                },
              }
            ]
          }
        });
      }
    }

    // ============================================
    // REST OF YOUR PIPELINE (Keep as is)
    // ============================================
    pipeline.push(
      {
        $lookup: {
          from: 'enquiryType',
          localField: 'enquiry_type_id',
          foreignField: '_id',
          as: 'enquiryType',
        },
      },
      {
        $addFields: {
          enquiry_type: {
            $arrayElemAt: ['$enquiryType', 0],
          },
        },
      },
      {
        $lookup: {
          from: 'followUps',
          localField: '_id',
          foreignField: 'enquiry_id',
          as: 'lastFollowUps',
          pipeline: [
            {
              $sort: {
                _id: -1,
              },
            },
          ],
        },
      },
    );

    pipeline.push(
      {
        $addFields: {
          stages: stages,
        },
      },
      {
        $addFields: {
          completedStages: {
            $filter: {
              input: '$enquiry_stages',
              as: 'stage',
              cond: {
                $or: [
                  {
                    $and: [
                      {
                        $in: [
                          '$$stage.stage_name',
                          ['Enquiry', 'Admitted or Provisional Approval']
                        ]
                      },
                      {
                        $eq: ['$$stage.status', EEnquiryStageStatus.INPROGRESS],
                      },
                    ],
                  },
                  { $eq: ['$$stage.status', EEnquiryStageStatus.COMPLETED] },
                  { $eq: ['$$stage.status', EEnquiryStageStatus.PASSED] },
                  { $eq: ['$$stage.status', EEnquiryStageStatus.APPROVED] },
                ],
              },
            },
          },
        },
      },
    );

    pipeline.push(
      {
        $addFields: {
          lastCompletedStage: {
            $arrayElemAt: [
              '$completedStages',
              { $subtract: [{ $size: '$completedStages' }, 1] },
            ],
          },
        },
      },
      {
        $addFields: {
          lastCompletedStageIndex: {
            $indexOfArray: [
              '$enquiry_stages.stage_name',
              '$lastCompletedStage.stage_name',
            ],
          },
        },
      },
      {
        $addFields: {
          nextStage: {
            $arrayElemAt: [
              '$enquiry_stages',
              { $add: ['$lastCompletedStageIndex', 1] },
            ],
          },
        },
      },
    );
    pipeline.push(
      {
        $addFields: {
          nextFollowUpDateComputed: {
            $cond: {
              if: {
                $and: [
                  { $eq: ['$enquiry_mode.value', 'Digital (website)'] },
                  { $eq: [{ $size: { $ifNull: ['$lastFollowUps', []] } }, 0] },
                ],
              },
              then: '$created_at',
              else: {
                $cond: {
                  if: {
                    $gt: [{ $size: { $ifNull: ['$lastFollowUps', []] } }, 0],
                  },
                  then: {
                    $dateFromString: {
                      dateString: {
                        $arrayElemAt: [
                          { $ifNull: ['$lastFollowUps.date', []] },
                          0,
                        ],
                      },
                    },
                  },
                  else: null,
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          overdueDays: {
            $cond: {
              if: { $ne: ['$nextFollowUpDateComputed', null] },
              then: {
                $max: [
                  {
                    $dateDiff: {
                      startDate: '$nextFollowUpDateComputed',
                      endDate: '$$NOW',
                      unit: 'day',
                    },
                  },
                  0,
                ],
              },
              else: null,
            },
          },
        },
      },
    );
    pipeline.push({
      $addFields: {
        enquiryFor: {
          $ifNull: ['$enquiry_type.name', null],
        },
        lastCompletedStage: { $arrayElemAt: ['$completedStages', -1] },
        studentName: {
          $concat: [
            { $ifNull: ['$student_details.first_name', ''] },
            ' ',
            { $ifNull: ['$student_details.last_name', ''] },
          ],
        },
        mobileNumber: {
          $switch: {
            branches: [
              {
                case: {
                  $eq: ['$other_details.parent_type', EParentType.FATHER],
                },
                then: '$parent_details.father_details.mobile',
              },
              {
                case: {
                  $eq: ['$other_details.parent_type', EParentType.MOTHER],
                },
                then: '$parent_details.mother_details.mobile',
              },
              {
                case: {
                  $eq: ['$other_details.parent_type', EParentType.GUARDIAN],
                },
                then: '$parent_details.guardian_details.mobile',
              },
            ],
            default: null,
          },
        },
        grade: {
          $ifNull: ['$student_details.grade.value', null],
        },
        board: {
          $ifNull: ['$board.value', null],
        },
        nextFollowUpDate: {
          $cond: {
            if: { $ne: ['$nextFollowUpDateComputed', null] },
            then: {
              $dateToString: {
                format: '%d-%m-%Y',
                date: '$nextFollowUpDateComputed',
              },
            },
            else: null,
          },
        },
        enquiryDate: {
          $dateToString: {
            format: '%d-%m-%Y',
            date: '$created_at',
          },
        },
        createdAt: {
          $let: {
            vars: {
              parts: {
                $dateToParts: {
                  date: '$created_at',
                  timezone: 'Asia/Kolkata',
                },
              },
            },
            in: {
              $concat: [
                {
                  $toString: {
                    $cond: [
                      { $lt: ['$$parts.day', 10] },
                      { $concat: ['0', { $toString: '$$parts.day' }] },
                      { $toString: '$$parts.day' },
                    ],
                  },
                },
                '-',
                {
                  $toString: {
                    $cond: [
                      { $lt: ['$$parts.month', 10] },
                      { $concat: ['0', { $toString: '$$parts.month' }] },
                      { $toString: '$$parts.month' },
                    ],
                  },
                },
                '-',
                { $toString: '$$parts.year' },
                ' ',
                {
                  $toString: {
                    $cond: [
                      { $eq: [{ $mod: ['$$parts.hour', 12] }, 0] },
                      12,
                      { $mod: ['$$parts.hour', 12] },
                    ],
                  },
                },
                ':',
                {
                  $toString: {
                    $cond: [
                      { $lt: ['$$parts.minute', 10] },
                      { $concat: ['0', { $toString: '$$parts.minute' }] },
                      { $toString: '$$parts.minute' },
                    ],
                  },
                },
                ' ',
                { $cond: [{ $lt: ['$$parts.hour', 12] }, 'AM', 'PM'] },
              ],
            },
          },
        },
        enquirer: {
          $switch: {
            branches: [
              {
                case: { $eq: ['$other_details.parent_type', 'Father'] },
                then: {
                  $concat: [
                    {
                      $ifNull: [
                        '$parent_details.father_details.first_name',
                        '',
                      ],
                    },
                    ' ',
                    {
                      $ifNull: ['$parent_details.father_details.last_name', ''],
                    },
                  ],
                },
              },
              {
                case: { $eq: ['$other_details.parent_type', 'Mother'] },
                then: {
                  $concat: [
                    {
                      $ifNull: [
                        '$parent_details.mother_details.first_name',
                        '',
                      ],
                    },
                    ' ',
                    {
                      $ifNull: ['$parent_details.mother_details.last_name', ''],
                    },
                  ],
                },
              },
              {
                case: { $eq: ['$other_details.parent_type', 'Guardian'] },
                then: {
                  $concat: [
                    {
                      $ifNull: [
                        '$parent_details.guardian_details.first_name',
                        '',
                      ],
                    },
                    ' ',
                    {
                      $ifNull: [
                        '$parent_details.guardian_details.last_name',
                        '',
                      ],
                    },
                  ],
                },
              },
            ],
            default: null,
          },
        },
        priority: {
          $cond: [
            {
              $and: [
                { $ne: ['$status', EEnquiryStatus.CLOSED] },
                {
                  $lte: [
                    {
                      $dateDiff: {
                        startDate: '$created_at',
                        endDate: '$$NOW',
                        unit: 'day',
                      },
                    },
                    15,
                  ],
                },
              ],
            },
            `${ENQUIRY_PRIORITY.HOT}`,
            {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', EEnquiryStatus.CLOSED] },
                    {
                      $gt: [
                        {
                          $dateDiff: {
                            startDate: '$created_at',
                            endDate: '$$NOW',
                            unit: 'day',
                          },
                        },
                        15,
                      ],
                    },
                    {
                      $lte: [
                        {
                          $dateDiff: {
                            startDate: '$created_at',
                            endDate: '$$NOW',
                            unit: 'day',
                          },
                        },
                        30,
                      ],
                    },
                  ],
                },
                `${ENQUIRY_PRIORITY.WARM}`,
                {
                  $cond: [
                    { $eq: ['$status', EEnquiryStatus.CLOSED] },
                    `${ENQUIRY_PRIORITY.COLD}`,
                    `${ENQUIRY_PRIORITY.COLD}`,
                  ],
                },
              ],
            },
          ],
        },
        school: {
          $ifNull: ['$school_location.value', null],
        },
        academicYear: {
          $ifNull: ['$academic_year.value', null],
        },
        nextAction: 'NA',
        overdueDays: {
          $cond: {
            if: { $eq: [{ $type: '$next_follow_up_at' }, 'date'] },
            then: {
              $max: [
                {
                  $dateDiff: {
                    startDate: '$next_follow_up_at',
                    endDate: '$$NOW',
                    unit: 'day',
                  },
                },
                0,
              ],
            },
            else: null,
          },
        },
      },
    });

    // ============================================
    // STEP 5: APPLY CUSTOM FILTERS
    // ============================================
    if (Object.keys(customFilter)?.length) {
      pipeline.push({ $match: customFilter });
    }

    // ============================================
    // STEP 6: ADD SORT (After all computed fields)
    // ============================================
    const sortStage: any = {};

    if (sortBy) {
      // Map frontend column names to database fields
      const sortFieldMap: Record<string, string> = {
        'enquiryDate': 'created_at',
        'studentName': 'studentName', // Now this exists after $addFields
        'grade': 'grade',
        'mobileNumber': 'mobileNumber',
        'stage': 'lastCompletedStage.stage_name',
        'priority': 'priority',
        'nextFollowUpDate': 'next_follow_up_at',
        'school': 'school',
        'academicYear': 'academicYear',
        'enquirer': 'enquirer',
        'status': 'status'
      };

      const dbField = sortFieldMap[sortBy] || 'created_at';
      sortStage[dbField] = sortOrder === 'desc' ? -1 : 1;

      // Add secondary sort by created_at if not primary sort
      if (dbField !== 'created_at') {
        sortStage.created_at = -1;
      }
    } else {
      // Default sort
      sortStage.created_at = -1;
    }

    pipeline.push({ $sort: sortStage });

    // ============================================
    // STEP 7: PROJECT AND FACET
    // ============================================
    pipeline.push({
      $project: {
        _id: 0,
        id: '$_id',
        enquiryFor: 1,
        studentName: 1,
        mobileNumber: 1,
        grade: 1,
        board: 1,
        stage: '$lastCompletedStage.stage_name',
        nextFollowUpDate: '$nextFollowUpDate',
        next_follow_up_at: 1,
        nextAction: '$nextStage.stage_name',
        actionDate: 1,
        enquiryDate: 1,
        createdAt: 1,
        enquirer: 1,
        status: 1,
        priority: 1,
        school: 1,
        created_at: 1,
        academicYear: 1,
        enquiry_number: 1,
        leadOwner: '$assigned_to',
        enquirySource: '$enquiry_source.value',
        overdueDays: 1,
        isNewLead: {
          $cond: {
            if: { $gt: [{ $size: { $ifNull: ['$lastFollowUps', []] } }, 0] },
            then: false,
            else: true,
          },
        },
      },
    });

    pipeline.push({
      $facet: {
        data: [
          {
            $skip: skip,
          },
          {
            $limit: pageSize,
          },
          {
            $project: {
              created_at: 0,
              next_follow_up_at: 0,
            },
          },
        ],
        totalCount: [
          {
            $count: 'count',
          },
        ],
      },
    });

    // ============================================
    // STEP 8: EXECUTE
    // ============================================
    const populatedEnquiries = await this.enquiryRepository
      .aggregate(pipeline)
      .allowDiskUse(true)
      .exec();

    const [result] = populatedEnquiries;
    const paginatedData = result.data;
    const totalCount =
      result.totalCount.length > 0 ? result.totalCount[0].count : 0;

    const totalPages = Math.ceil(totalCount / pageSize);

    // ============================================
    // STEP 9: LOG PERFORMANCE
    // ============================================
    const executionTime = Date.now() - startTime;
    if (executionTime > 1500) {
      this.loggerService.warn(
        `Slow query detected: ${executionTime}ms | Search: "${globalSearchText}" | Filters: ${filtersArray?.length || 0} | Results: ${totalCount}`
      );
    } else {
      this.loggerService.log(
        `Query executed in ${executionTime}ms | Search: "${globalSearchText}" | Results: ${totalCount}`
      );
    }

    return {
      content: paginatedData,
      pagination: {
        total_pages: totalPages,
        page_size: pageSize,
        total_count: totalCount,
      },
    };
  }

  // Encrypt a message using the public key
  encryptData(data: string): string {
    // Read the public key from the file
    const publicKey = fs.readFileSync('public-key.pem', 'utf8');

    const buffer = Buffer.from(data, 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey.replace(/\\n/g, '\n'),
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      buffer,
    );
    return encrypted.toString('base64');
  }

  // Decrypt a message using the private key
  decryptData(encryptedData: string): string {
    // Read the private key from the file
    const privateKey = fs.readFileSync('private-key.pem', 'utf8');

    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey.replace(/\\n/g, '\n'),
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      buffer,
    );
    return decrypted.toString('utf8');
  }

  async uploadEnquiryDocument(
    req: Request,
    enquiryId: string,
    documentId: number,
    document: Express.Multer.File,
  ) {
    const bucketName = this.configService.get<string>('BUCKET_NAME');
    const folderName = this.configService.get<string>('FOLDER_NAME');

    await this.storageService.setStorage(EStorageType.GCS, {
      projectId: this.configService.get<string>('PROJECT_ID'),
      credentials: {
        type: this.configService.get<string>('TYPE'),
        project_id: this.configService.get<string>('PROJECT_ID'),
        private_key_id: this.configService.get<string>('PRIVATE_KEY_ID'),
        private_key: this.configService
          .get<string>('PRIVATE_KEY')
          .replace(/\\n/g, '\n'),
        client_email: this.configService.get<string>('CLIENT_EMAIL'),
        client_id: this.configService.get<string>('GCS_CLIENT_ID'),
        auth_uri: this.configService.get<string>('AUTH_URI'),
        token_uri: this.configService.get<string>('TOKEN_URI'),
        auth_provider_x509_cert_url: this.configService.get<string>(
          'AUTH_PROVIDER_X509_CERT_URL',
        ),
        client_x509_cert_url: this.configService.get<string>(
          'CLIENT_X509_CERT_URL',
        ),
        universe_domain: this.configService.get<string>('UNIVERSAL_DOMAIN'),
      },
      bucketName: bucketName,
      folderName: folderName,
    });

    const uploadedFileName = await this.storageService.uploadFile(document);

    if (!uploadedFileName) {
      throw new HttpException(
        'Something went wrong while uploading file!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );
    if (!enquiryDetails) {
      throw new HttpException(
        'Enquiry details not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const { documents, enquiry_stages, status } = enquiryDetails as any;

    const updatedDocuments = JSON.parse(JSON.stringify(documents));
    const documentToBeUploaded = updatedDocuments.find(
      (document) => document.document_id === documentId,
    );
    if (!documentToBeUploaded) {
      throw new HttpException('Unknown document', HttpStatus.NOT_FOUND);
    }

    documentToBeUploaded.file = uploadedFileName;
    const loggedInUserRoles =
      await this.enquiryHelper.getCurrentUserRoleCode(req);

    let documentIsVerified = false;
    const { CC, RE } = getCcReHrisCodes();
    const isCcReRole = [...CC, ...RE].some((role) =>
      loggedInUserRoles.includes(role),
    );
    if (isCcReRole) {
      documentToBeUploaded.is_verified = true;
      documentIsVerified = true;
    }

    await this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
      documents: updatedDocuments,
    });

    const admissionType = this.enquiryHelper.getAdmissionType(updatedDocuments);
    const admissionTypeStageRegex = new RegExp(
      'Admitted or Provisional Approval',
      'i',
    );
    const admissionTypeStage = enquiry_stages.find((stage) =>
      admissionTypeStageRegex.test(stage.stage_name),
    );
    if (
      admissionType === EEnquiryAdmissionType.ADMISSION &&
      (admissionTypeStage.status !== EEnquiryStageStatus.INPROGRESS ||
        admissionTypeStage.status !== EEnquiryStageStatus.OPEN)
    ) {
      const updatedStages = enquiry_stages.map((stage) => {
        if (admissionTypeStageRegex.test(stage.stage_name)) {
          stage.status = EEnquiryStageStatus.ADMITTED;
        }
        return stage;
      });
      await this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
        enquiry_stages: updatedStages,
      });

    }

    // Push the newly uploaded documents to academics if the admission is completed
    if (status === EEnquiryStatus.ADMITTED) {
      const [updatedEnquiryDetails, admissionDetails] = await Promise.all([
        this.enquiryRepository.getById(new Types.ObjectId(enquiryId)),
        this.admissionRepository.getOne({
          enquiry_id: new Types.ObjectId(enquiryId),
        }),
      ]);
      if (admissionDetails?.student_id) {
        await this.axiosService
          .setBaseUrl(this.configService.get<string>('ADMIN_PANEL_URL'))
          .setUrl(ADMIN_API_URLS.MAP_STUDENT_DOCUMENTS)
          .setMethod(EHttpCallMethods.POST)
          .setHeaders({
            Authorization: req.headers.authorization,
          } as AxiosRequestHeaders)
          .setBody({
            student_id: admissionDetails.student_id,
            documents: updatedEnquiryDetails.documents,
          })
          .sendRequest();
      }
      this.loggerService.log(
        `New uploaded documents pushed to academics against student Id - ${admissionDetails.student_id}`,
      );
    }
    return { documentIsVerified };
  }

  async getUploadedDocumentUrl(
    enquiryId: string,
    documentId: number,
    download = false,
  ) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );
    if (!enquiryDetails) {
      throw new HttpException('Enquiry not found', HttpStatus.NOT_FOUND);
    }

    const { documents } = enquiryDetails;
    const document = documents.find(
      (document) => document.document_id === documentId,
    );

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    const { file } = document;
    const bucketName = this.configService.get<string>('BUCKET_NAME');
    const folderName = this.configService.get<string>('FOLDER_NAME');

    await this.storageService.setStorage(EStorageType.GCS, {
      projectId: this.configService.get<string>('PROJECT_ID'),
      credentials: {
        type: this.configService.get<string>('TYPE'),
        project_id: this.configService.get<string>('PROJECT_ID'),
        private_key_id: this.configService.get<string>('PRIVATE_KEY_ID'),
        private_key: this.configService
          .get<string>('PRIVATE_KEY')
          .replace(/\\n/g, '\n'),
        client_email: this.configService.get<string>('CLIENT_EMAIL'),
        client_id: this.configService.get<string>('GCS_CLIENT_ID'),
        auth_uri: this.configService.get<string>('AUTH_URI'),
        token_uri: this.configService.get<string>('TOKEN_URI'),
        auth_provider_x509_cert_url: this.configService.get<string>(
          'AUTH_PROVIDER_X509_CERT_URL',
        ),
        client_x509_cert_url: this.configService.get<string>(
          'CLIENT_X509_CERT_URL',
        ),
        universe_domain: this.configService.get<string>('UNIVERSAL_DOMAIN'),
      },
      bucketName: bucketName,
      folderName: folderName,
    });

    const signedUrl = await this.storageService.getSignedUrl(
      bucketName,
      file,
      download,
    );
    return { url: signedUrl };
  }

  async getEnquiryTimeline(
    enquiryId: string,
    filters?: { eventType?: string; eventSubType?: string },
  ) {
    const timelineFilters = {
      eventType: Object.values(EEnquiryEventType),
    };
    if (filters) {
      const timeline = await this.enquiryLogService.getEnquiryLogsByEnquiryId(
        enquiryId,
        'asc',
        filters,
      );
      return {
        filters: timelineFilters,
        timeline: this.enquiryHelper.getDetailedEnquiryTimeline(timeline),
      };
    }
    const timeline = await this.enquiryLogService.getEnquiryLogsByEnquiryId(
      enquiryId,
      'asc',
    );
    return {
      filters: timelineFilters,
      timeline: this.enquiryHelper.getDetailedEnquiryTimeline(timeline),
    };
  }

  async getTimeLineEventSubTypes(eventType: EEnquiryEventType) {
    switch (eventType) {
      case EEnquiryEventType.ENQUIRY:
        return [
          EEnquiryEvent.ENQUIRY_CREATED,
          EEnquiryEvent.ENQUIRY_CLOSED,
          EEnquiryEvent.ENQUIRY_MERGED,
          EEnquiryEvent.ENQUIRY_TRANSFERRED,
          EEnquiryEvent.ENQUIRY_REOPENED,
          EEnquiryEvent.ENQUIRY_REASSIGNED,
        ];
      case EEnquiryEventType.SCHOOL_TOUR:
        return [
          EEnquiryEvent.SCHOOL_TOUR_SCHEDULED,
          EEnquiryEvent.SCHOOL_TOUR_RESCHEDULE,
          EEnquiryEvent.SCHOOL_TOUR_CANCELLED,
          EEnquiryEvent.SCHOOL_TOUR_COMPLETED,
        ];
      case EEnquiryEventType.REGISTRATION:
        return [
          EEnquiryEvent.REGISTRATION_DETAILS_RECIEVED,
          EEnquiryEvent.REGISTRATION_FEE_RECEIVED,
          EEnquiryEvent.REGISTRATION_FEE_REQUEST_SENT,
        ];
      case EEnquiryEventType.COMPETENCY_TEST:
        return [
          EEnquiryEvent.COMPETENCY_TEST_SCHEDULED,
          EEnquiryEvent.COMPETENCY_TEST_RESCHEDULED,
          EEnquiryEvent.COMPETENCY_TEST_CANCELLED,
          EEnquiryEvent.COMPETENCY_TEST_PASSED,
          EEnquiryEvent.COMPETENCY_TEST_FAILED,
        ];
      case EEnquiryEventType.ADMISSION:
        return [
          EEnquiryEvent.ADMISSION_APPROVED,
          EEnquiryEvent.ADMISSION_COMPLETED,
          EEnquiryEvent.ADMISSION_REJECTED,
          EEnquiryEvent.PAYMENT_RECEIVED,
          EEnquiryEvent.SUBJECTS_SELECTED,
          EEnquiryEvent.FEES_ATTACHED,
          EEnquiryEvent.VAS_ADDED,
        ];
      case EEnquiryEventType.FOLLOW_UP:
        return [
          EEnquiryEvent.FOLLOW_UP_CALL,
          EEnquiryEvent.FOLLOW_UP_EMAIL,
          EEnquiryEvent.FOLLOW_UP_PHYSICAL_MEETING,
          EEnquiryEvent.FOLLOW_UP_VIRTUAL_MEETING,
        ];
    }
  }

  async getMergedEnquiry(enquiryDoc: Partial<EnquiryDocument & Document>) {
    const mergeEnquiryDoc = await this.enquiryRepository.aggregate([
      {
        $match: {
          parent_enquiry_number: {
            $exists: true,
            $ne: null,
            $eq: enquiryDoc.enquiry_number,
          },
        },
      },
    ]);
    return mergeEnquiryDoc;
  }

  async getMergedEnquiries(enquiryId: string) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );
    const mergedDoc = await this.getMergedEnquiry(enquiryDetails);
    const result = mergedDoc.map((data) => {
      const enquiryName = `${data.student_details.first_name} ${data.student_details.last_name} ( ${data.enquiry_number} ) <= ${enquiryDetails.student_details.first_name} ${enquiryDetails.student_details.last_name} ( ${enquiryDetails.enquiry_number} )`;
      return {
        ...data,
        enquiry_name: enquiryName,
      };
    });
    return result;
  }

  async getSimilarEnquiries(enquiryId: string, user_id?: number) {
    const enquiryDetails = await this.enquiryRepository.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(enquiryId),
        },
      },
      {
        $lookup: {
          from: 'enquiryType',
          localField: 'enquiry_type_id',
          foreignField: '_id',
          as: 'enquiry_type_details',
          pipeline: [
            { $project: { name: 1, stages: 1 } }
          ],
        },
      },
    ]);

    if (!enquiryDetails.length) {
      throw new HttpException('Enquiry not found', HttpStatus.NOT_FOUND);
    }

    const enquiry = enquiryDetails[0];
    const {
      _id,
      other_details,
      parent_details,
      enquiry_type_id,
      enquiry_date,
      status,
      enquiry_type_details,
      enquiry_stages,
      created_at,
    } = enquiry;

    const { stages: enquiryTypeStages, name: enquiryType } = enquiry_type_details[0];

    // ---------- FORM COMPLETION ----------
    let formCompletedPercentage = 0;

    enquiry_stages.forEach((enquiryStage) => {
      enquiryTypeStages.forEach((enquiryTypeStage) => {
        if (
          enquiryStage.stage_id.toString() === enquiryTypeStage.stage_id.toString() &&
          (
            enquiryStage.status === EEnquiryStageStatus.COMPLETED ||
            enquiryStage.status === EEnquiryStageStatus.PASSED ||
            enquiryStage.status === EEnquiryStageStatus.APPROVED
          )
        ) {
          formCompletedPercentage += enquiryTypeStage.weightage;
        }
      });
    });

    const response: any = {
      duplicate_count: 0,
      merged_count: 0,
      form_completed_percentage: formCompletedPercentage,
      enquiry_status: status,
      enquiry_type: enquiryType,
    };

    // ---------- DUPLICATE & MERGED ----------
    if (status === EEnquiryStatus.OPEN) {
      response.duplicate_count = await this.enquiryHelper.getDuplicateEnquiriesCount(enquiry);
      const merged = await this.getMergedEnquiry(enquiry);
      response.merged_count = merged?.length || 0;
    }

    // ---------- CURRENT ENQUIRY DETAILS ----------
    let parentType = other_details?.parent_type?.toLowerCase();
    let ce_name = null;
    let ce_email = null;

    if (parentType === "father") {
      ce_name = parent_details?.father_details?.first_name + parent_details?.father_details?.last_name;
      ce_email = parent_details?.father_details?.email;
    } else if (parentType === "mother") {
      ce_name = parent_details?.mother_details?.first_name + parent_details?.mother_details?.last_name;
      ce_email = parent_details?.mother_details?.email;
    } else if (parentType === "guardian") {
      ce_name = parent_details?.guardian_details?.first_name + parent_details?.guardian_details?.last_name;
      ce_email = parent_details?.guardian_details?.email;
    }

    response.current_enquiry_details = {
      enquirer_parent: parentType ? parentType.charAt(0).toUpperCase() + parentType.slice(1) : "N/A",
      enquiry_type_id,
      enquiry_name: this.enquiryHelper.getSimilarEnquiryName(enquiry),
      enquiry_id: _id,
      academic_year: enquiry.academic_year || null,
      enquirer_name: ce_name || null,
      enquirer_email: ce_email || null,
      enquiry_date: formatToTimeZone(created_at, 'YYYY-MM-DDTHH:mm:ss.sss', { timeZone: 'Asia/Kolkata' }),
    };

    // ---------- SIMILAR ENQUIRIES PIPELINE ----------
    const pipeline: any[] = [];

    // match by parent type global_id
    if (parentType === "father" && parent_details?.father_details?.global_id) {
      pipeline.push({
        $match: { 'parent_details.father_details.global_id': parent_details.father_details.global_id },
      });
    } else if (parentType === "mother" && parent_details?.mother_details?.global_id) {
      pipeline.push({
        $match: { 'parent_details.mother_details.global_id': parent_details.mother_details.global_id },
      });
    } else if (parentType === "guardian" && parent_details?.guardian_details?.global_id) {
      pipeline.push({
        $match: { 'parent_details.guardian_details.global_id': parent_details.guardian_details.global_id },
      });
    }

    // exclude current enquiry
    pipeline.push({
      $match: {
        _id: { $ne: _id },
        status: EEnquiryStatus.OPEN,
      },
    });

    // assigned user filtering
    if (user_id && pipeline[0]?.$match) {
      pipeline[0].$match['assigned_to_id'] = user_id;
    }

    pipeline.push({
      $lookup: {
        from: 'enquiryType',
        localField: 'enquiry_type_id',
        foreignField: '_id',
        as: 'enquiry_type_details',
        pipeline: [{ $project: { name: 1 } }],
      },
    });

    const similarEnquiries = await this.enquiryRepository.aggregate(pipeline);

    // ---------- FORMAT SIMILAR ENQUIRIES ----------
    response.similar_enquiries = similarEnquiries
      .map((enquiry: any) => {
        const pType = enquiry?.other_details?.parent_type?.toLowerCase();
        let name = null;
        let email = null;

        if (pType === "father") {
          name =
            enquiry?.parent_details?.father_details?.first_name +
            enquiry?.parent_details?.father_details?.last_name;
          email = enquiry?.parent_details?.father_details?.email;
        } else if (pType === "mother") {
          name =
            enquiry?.parent_details?.mother_details?.first_name +
            enquiry?.parent_details?.mother_details?.last_name;
          email = enquiry?.parent_details?.mother_details?.email;
        } else if (pType === "guardian") {
          name =
            enquiry?.parent_details?.guardian_details?.first_name +
            enquiry?.parent_details?.guardian_details?.last_name;
          email = enquiry?.parent_details?.guardian_details?.email;
        }

        return {
          enquiry_type_id: enquiry.enquiry_type_id,
          enquiry_name: this.enquiryHelper.getSimilarEnquiryName(enquiry),
          enquiry_id: enquiry._id,
          academic_year: enquiry?.academic_year || null,
          enquirer_parent: pType ? pType.charAt(0).toUpperCase() + pType.slice(1) : "N/A",
          enquirer_name: name || null,
          enquirer_email: email || null,
          enquiry_date: enquiry.enquiry_date,
        };
      })
      .filter(Boolean); // remove undefined rows

    return response;
  }

  async getEnquirerDetails(
    enquiryId: string,
    pageSize: number,
    pageNumber: number,
  ) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );
    if (!enquiryDetails) {
      throw new HttpException(
        'Enquiry details not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const enquirerDetails: Record<string, unknown> = {};
    const { father_details, mother_details, guardian_details } =
      enquiryDetails.parent_details;
    const pipeline = [];
    switch ((enquiryDetails.other_details as any).parent_type) {
      case EParentType.FATHER:
        pipeline.push({
          $match: {
            'parent_details.father_details.global_id': father_details.global_id,
          },
        });
        enquirerDetails['name'] =
          father_details.first_name + father_details.last_name;
        enquirerDetails['email'] = father_details.email;
        enquirerDetails['mobile'] = father_details.mobile;
        break;
      case EParentType.MOTHER:
        pipeline.push({
          $match: {
            'parent_details.mother_details.global_id': mother_details.global_id,
          },
        });
        enquirerDetails['name'] =
          mother_details.first_name + mother_details.last_name;
        enquirerDetails['email'] = mother_details.email;
        enquirerDetails['mobile'] = mother_details.mobile;
        break;
      case EParentType.GUARDIAN:
        pipeline.push({
          $match: {
            'parent_details.guardian_details.global_id':
              guardian_details.global_id,
          },
        });
        enquirerDetails['name'] =
          guardian_details.first_name + guardian_details.last_name;
        enquirerDetails['email'] = guardian_details.email;
        enquirerDetails['mobile'] = guardian_details.mobile;
        break;
    }

    pipeline.push(
      {
        $lookup: {
          from: 'enquiryStage',
          localField: 'enquiry_stages.stage_id',
          foreignField: '_id',
          as: 'stages',
        },
      },
      {
        $addFields: {
          completedStages: {
            $filter: {
              input: '$enquiry_stages',
              as: 'stage',
              cond: {
                $or: [
                  { $eq: ['$$stage.status', EEnquiryStageStatus.COMPLETED] },
                  { $eq: ['$$stage.status', EEnquiryStageStatus.PASSED] },
                  { $eq: ['$$stage.status', EEnquiryStageStatus.APPROVED] },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          lastCompletedStage: { $arrayElemAt: ['$completedStages', -1] },
        },
      },
      {
        $sort: {
          created_at: -1,
        },
      },
      {
        $project: {
          enquiry_id: '$_id',
          enquiry_for: '$other_details.enquiry_type',
          enquiry_number: '$enquiry_number',
          enquiry_date: 1,
          enquiry_type: '$other_details.enquiry_type',
          school_name: '$school_location.value',
          student_first_name: '$student_details.first_name',
          student_last_name: '$student_details.last_name',
          stages: '$enquiry_stages',
          status: '$status',
          lastCompletedStage: 1,
        },
      },
    );

    const enquiries = await this.enquiryRepository.aggregate(
      mongodbPaginationQuery(pipeline, { pageNumber, pageSize }),
    );
    const similarEnquires = enquiries[0].data.map((enquiry) => {
      return {
        enquiry_id: enquiry?.enquiry_id ?? 'N/A',
        enquiry_date: enquiry?.enquiry_date ?? 'N/A',
        enquiry_for: enquiry?.enquiry_for ?? 'N/A',
        enquiry_number: enquiry?.enquiry_number ?? 'N/A',
        school_name: enquiry?.school_name ?? 'N/A',
        student_name:
          (enquiry?.student_first_name ?? '') +
          (enquiry?.student_last_name ?? ''),
        stage_name: enquiry.stages
          ? (enquiry.stages.find(
            (stage) => stage.status === EEnquiryStageStatus.OPEN,
          )?.stage_name ??
            enquiry?.lastCompletedStage?.stage_name ??
            'N/A')
          : 'N/A',
        stage_status: enquiry.status ?? 'N/A',
      };
    });
    return {
      enquirerDetails,
      similarEnquiries: {
        ...enquiries[0],
        currentPage: pageNumber,
        pageSize: pageSize,
        data: similarEnquires,
      },
    };
  }

  async getEnquiryTransferDetails(enquiryId: string) {
    const enquiryDetails = await this.enquiryRepository.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(enquiryId),
        },
      },
      {
        $lookup: {
          from: 'enquiryType',
          localField: 'enquiry_type_id',
          foreignField: '_id',
          as: 'enquiry_type_details',
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          student_first_name: '$student_details.first_name',
          student_last_name: '$student_details.last_name',
          status: 1,
          school_location: '$school_location.value',
          enquiry_number: '$enquiry_number',
          enquiry_type: '$enquiry_type_details.name',
          parent_type: '$other_details.parent_type',
          parent_details: 1,
        },
      },
    ]);

    const { parent_details, parent_type, _id } = enquiryDetails[0];

    const similarEnquiries =
      await this.enquiryHelper.getSimilarEnquiriesByEnquirerGlobalId(
        parent_details,
        parent_type,
        _id,
      );

    delete enquiryDetails[0].parent_details;

    const result: any = {
      enquiryDetails: {
        ...enquiryDetails[0],
        enquiry_type: enquiryDetails[0].enquiry_type[0],
      },
      similarEnquiries: [],
    };
    if (similarEnquiries.length) {
      result.similarEnquiries = similarEnquiries.map((enquiry) => {
        return {
          enquiry_id: enquiry._id,
          enquiry_date: enquiry.enquiry_date,
          enquiry_number: enquiry.enquiry_number,
          enquiry_for: enquiry.other_details.enquiry_type,
          student_name:
            (enquiry?.student_details?.first_name ?? '') +
            ' ' +
            (enquiry?.student_details?.last_name ?? ''),
          stage_name: enquiry.stages
            ? enquiry.stages.find((stage) => stage.status === 'Open').stage_name
            : 'N/A',
          stage_status: enquiry.stages
            ? enquiry?.stages.find((stage) => stage.status === 'Open').status
            : 'N/A',
        };
      });
    }
    return result;
  }

  async transfer(
    payload: TransferEnquiryRequestDto,
    req: Request,
  ) {
    const { enquiryIds, school_location: schoolLocationDetails } = payload;
    const schoolDetails = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.SCHOOL}/${schoolLocationDetails.id}`,
    );
    const REHrisCode = getCcReHrisCodes().RE;
    if (!REHrisCode.length) {
      throw new BadRequestException('No employee');
    }

    const filter: (string | number)[][] = REHrisCode.map((data) => {
      return [
        'filters[$and][1][hr_hris_unique_role][HRIS_Unique_Role_Code][$in]',
        data,
      ];
    });

    const schoolCode = schoolDetails?.data?.attributes?.code;
    filter.push([
      'filters[$and][0][Base_Location][Base_Location][parent1_id][$eq]',
      schoolCode,
    ]);

    [
      EMPLOYEE_ACTIVITY_STATUS.ACTIVE,
      EMPLOYEE_ACTIVITY_STATUS.SERVING_NOTICE_PERIOD,
    ].forEach((status, index) => {
      filter.push([`filters[Employment_Status][id][$in][${index}]`, status]);
    });
    const response = await this.mdmService.fetchDataFromAPI(
      `/api/hr-employee-masters`,
      [...filter],
    );
    this.loggerService.log(
      `Response api/hr-employee-master :::: payload:: ${JSON.stringify(filter)} and response:: ${JSON.stringify(response)}`,
    );

    if (!response?.data?.length) {
      throw new HttpException(
        'Employee list not found against the given role',
        HttpStatus.NOT_FOUND,
      );
    }

    const employeeIds = response?.data.map((employeeData) => employeeData.id);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          assigned_to_id: {
            $in: employeeIds,
          },
        },
      },
      {
        $sort: {
          created_at: -1,
        },
      },
    ];

    const enquiryData = await this.enquiryRepository.aggregate(pipeline);
    const enquiryIdArr = enquiryIds.map((id) => new Types.ObjectId(id));
    const enquiryDataFromPayloadEnquiryIds =
      await this.enquiryRepository.aggregate([
        {
          $match: {
            _id: {
              $in: enquiryIdArr,
            },
          },
        },
      ]);
    if (enquiryDataFromPayloadEnquiryIds.length) {
      const isAnyRoundRobinAssignedIndex = enquiryData.findIndex(
        (enq) => enq.round_robin_assigned === RoundRobinAssignedStatus.YES,
      );
      this.loggerService.log(
        `Round robin assigned :: ${JSON.stringify(enquiryData[isAnyRoundRobinAssignedIndex])}`,
      );

      const maxEnquiry = enquiryDataFromPayloadEnquiryIds.length;
      let reMax = 0;
      if (isAnyRoundRobinAssignedIndex > -1) {
        reMax =
          employeeIds.findIndex(
            (e: number) =>
              e === enquiryData[isAnyRoundRobinAssignedIndex].assigned_to_id,
          ) + 1;
      }

      const enquiryDetails = await this.enquiryRepository.getByEnquiryNumber(req.body.enquiry_number);
      const result = await this.processNewFees(enquiryDetails, req.body, req);
      if (result?.status) {
        return result;
      }

      await Promise.all([
        ...(isAnyRoundRobinAssignedIndex > -1
          ? [
            this.enquiryRepository.updateById(
              enquiryData[isAnyRoundRobinAssignedIndex]._id,
              { round_robin_assigned: RoundRobinAssignedStatus.NO },
            ),
          ]
          : []),
        this.enquiryHelper.roundRobinAssign(
          enquiryDataFromPayloadEnquiryIds,
          reMax,
          maxEnquiry,
          response,
          schoolLocationDetails?.value,
        ),
        ...enquiryIds.map((enquiryId) => {
          return this.enquiryRepository.updateById(
            new Types.ObjectId(enquiryId),
            {
              school_location: {
                id: schoolLocationDetails.id,
                value: schoolLocationDetails.value,
              },
              school: payload.school_location,
              brand: payload.brand,
              academic_year: payload.academicYearId,
              board: payload.board,
              grade: payload.grade,
              course: payload.course,
              shift: payload.shift,
              stream: payload.stream,
              'student_details.grade': payload.grade,
              ...(payload.guestHostSchool
                ? { guest_student_details: { location: payload.guestHostSchool } }
                : {}),
            },
          );
        }),
      ]);
    }

    // const transferedEnquiries = await Promise.all(promises);
    // const transferAuditLogs = [];
    // transferedEnquiries.map((enquiry) => {
    //   transferAuditLogs.push(
    //     this.auditLogRepository.create({
    //       table_name: 'enquiry',
    //       request_body: schoolLocationDetails,
    //       response_body: enquiry,
    //       operation_name: 'updateTransferEnquiry',
    //       created_by: 1,
    //       url: 'marketing/enquiry/transfer',
    //       ip_address: req.ip,
    //       method: HTTP_METHODS.PATCH,
    //       source_service: this.configService.get<string>('SERVICE'),
    //       record_id: enquiry._id,
    //     }),
    //   );
    // });

    // await Promise.all(transferAuditLogs);

    // below function sends notification
    // enquiryDataFromPayloadEnquiryIds.forEach((enquiry) => {
    //   this.emailService.setEnquiryDetails(enquiry).sendNotification(
    //     EMAIL_TEMPLATE_SLUGS.ENQUIRY_TRANSFERED,
    //     {
    //       enq_no: enquiry.enquiry_number,
    //       e_signature: '+91 6003000700',
    //       link: 'https://www.vibgyorhigh.com/'
    //     },
    //     [
    //       this.enquiryHelper.getEnquirerDetails(enquiry, 'email')
    //         ?.email as string,
    //     ],
    //   );
    // })
    return;
  }

  async getEnquiryReassignDetails(enquiryId: string) {
    const enquiryDetails = await this.enquiryRepository.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(enquiryId),
        },
      },
      {
        $project: {
          _id: 1,
          parent_type: '$other_details.parent_type',
          parent_details: 1,
        },
      },
    ]);

    const { parent_details, parent_type, _id } = enquiryDetails[0];

    const similarEnquiries =
      await this.enquiryHelper.getSimilarEnquiriesByEnquirerGlobalId(
        parent_details,
        parent_type,
        _id,
      );

    delete enquiryDetails[0].parent_details;

    const result: any = { similarEnquiries: [] };
    if (similarEnquiries.length) {
      result.similarEnquiries = similarEnquiries.map((enquiry) => {
        return {
          enquiry_id: enquiry._id,
          enquiry_date: enquiry.enquiry_date,
          enquiry_number: enquiry.enquiry_number,
          enquiry_for: enquiry.other_details.enquiry_type,
          student_name:
            (enquiry?.student_details?.first_name ?? '') +
            ' ' +
            (enquiry?.student_details?.last_name ?? ''),
          stage_name: enquiry.stages
            ? enquiry.stages.find((stage) => stage.status === 'Open').stage_name
            : 'N/A',
          stage_status: enquiry.stages
            ? enquiry?.stages.find((stage) => stage.status === 'Open').status
            : 'N/A',
        };
      });
    }
    return result;
  }

  async reassign(
    enquiryIds: string[],
    reassignDetails: Record<string, any>,
    ipAddress: string,
  ) {
    const enquiryDoc = await this.enquiryRepository.getMany({
      _id: { $in: enquiryIds },
    });
    const promises = [];
    enquiryIds.forEach((enquiryId) => {
        const created_by_name = reassignDetails.assigned_to?.trim()?.split(' ');
        const firstName = created_by_name[0] || null;
        const lastName = created_by_name.length > 1 ? created_by_name[created_by_name.length - 1] : null;
        const parts = [firstName, lastName].filter(Boolean);

      promises.push(
        this.updateEnquiryData(enquiryId, {
          assigned_to: parts.length > 0 ? parts.join(' ') : null,
          assigned_to_id: reassignDetails.assigned_to_id,
        }),
      );
    });
    const reassignedEnquiries = await Promise.all(promises);

    const reassignAuditLogs = [];
    reassignedEnquiries.map((enquiry) => {
      const enquiryOld = enquiryDoc.find(
        (data) => data.enquiry_number === enquiry.enquiry_number,
      );
      reassignAuditLogs.push(
        this.auditLogRepository.create({
          table_name: 'enquiry',
          request_body: reassignDetails,
          response_body: reassignedEnquiries,
          operation_name: 'updateReassignEnquiry',
          created_by: reassignDetails.assigned_to_id,
          url: 'marketing/enquiry/reassign',
          ip_address: ipAddress,
          method: HTTP_METHODS.PATCH,
          source_service: this.configService.get<string>('SERVICE'),
          record_id: enquiry._id,
        }),
        this.enquiryLogService.createLog({
          enquiry_id: enquiry._id,
          event_type: EEnquiryEventType.REASSIGN,
          event_sub_type: EEnquiryEventSubType.ADMISSION_ACTION,
          event: EEnquiryEvent.ENQUIRY_REASSIGNED,
          created_by: `${enquiryOld.assigned_to}`,
          created_by_id: enquiryOld.assigned_to_id,
        }),
      );
    });

    await Promise.all(reassignAuditLogs);

    // const enqDetails = await this.enquiryRepository.getMany({
    //   _id: { $in: enquiryIds },
    // });

    // below function sends notification
    // enqDetails.forEach((enquiry) => {
    //   this.emailService.setEnquiryDetails(enquiry).sendNotification(
    //     EMAIL_TEMPLATE_SLUGS.ENQUIRY_REASSIGNED,
    //     {
    //       enq_no: enquiry.enquiry_number,
    //       e_signature: '+91 6003000700',
    //       link: 'https://www.vibgyorhigh.com/'
    //     },
    //     [
    //       this.enquiryHelper.getEnquirerDetails(enquiry, 'email')
    //         ?.email as string,
    //     ],
    //   );
    // })
  }

  // Nikhil
  async reopen(
    enquiryIds: string[],
    reopenDetails: Record<string, any>,
    ipAddress: string,
    action?: string,
  ) {


    // Fetch existing enquiry docs for audit comparison
    const enquiryDocs = await this.enquiryRepository.getMany({
      _id: { $in: enquiryIds },
    });

    const promises = [];
    // Update status to OPEN for each enquiry
    enquiryIds.forEach((enquiryId) => {
      promises.push(
        this.updateEnquiryData(enquiryId, {
          status: EEnquiryStatus.OPEN,
        }),
      );
    });

    const reopenedEnquiries = await Promise.all(promises);

    const reopenAuditLogs = [];
    reopenedEnquiries.forEach((enquiry) => {
      // Find old enquiry for logging user info etc
      const oldEnquiry = enquiryDocs.find(
        (doc) => doc.enquiry_number === enquiry.enquiry_number,
      );

      reopenAuditLogs.push(
        this.auditLogRepository.create({
          table_name: 'enquiry',
          request_body: { status: EEnquiryStatus.OPEN },
          response_body: enquiry,
          operation_name: 'reopenEnquiry',
          created_by: reopenDetails.user_id ?? oldEnquiry?.assigned_to_id ?? -1,
          url: 'marketing/enquiry/reopen',
          ip_address: ipAddress,
          method: HTTP_METHODS.PATCH,
          source_service: this.configService.get<string>('SERVICE'),
          record_id: enquiry._id,
        }),
        this.enquiryLogService.createLog({
          enquiry_id: enquiry._id,
          event_type: EEnquiryEventType.REOPEN,
          event_sub_type: EEnquiryEventSubType.ADMISSION_ACTION,
          event: EEnquiryEvent.ENQUIRY_REOPENED,
          created_by:
            reopenDetails.user_name ?? 'System',
          created_by_id:
            reopenDetails.user_id ?? -1,
          log_data: {
            ...reopenDetails,
            reopen_reason:
              action == 'Bulk re-opened'
                ? 'Bulk re-opened'
                : 'System re-opened',
          },
        }),
      );
    });

    await Promise.all(reopenAuditLogs);
  }

  async findExistingLeads({
    firstName,
    lastName,
    dob,
    enquiry_type,
  }: {
    firstName: string;
    lastName: string;
    dob: string;
    enquiry_type?: string;
  }) {
    const escapeRegex = (s: string) =>
      s?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') ?? '';

    const query: any = {
      // status: {
      //   $regex: `^${escapeRegex('Closed')}$`,
      //   $options: 'i',
      // },
      'other_details.enquiry_type': 'NewAdmission',
      'student_details.first_name': {
        $regex: `^${escapeRegex(firstName)}$`,
        $options: 'i',
      },
      'student_details.last_name': {
        $regex: `^${escapeRegex(lastName)}$`,
        $options: 'i',
      },
      'student_details.dob': dob,
    };
    if (enquiry_type) {
      query['other_details.enquiry_type'] = enquiry_type;
    }
    return await this.enquiryRepository.getMany(query);
  }


  async findDublicateIVTenquiry(
    enrollment,
    // enquiryNumber,
    enquiryType
  ) {
    // console.log("findDublicateIVTenquiry", enrollment, enquiryNumber, enquiryType);

    // if(!enrollment && !enquiryNumber && !enquiryType){

    // }
    let query = {
      'student_details.enrolment_number': enrollment,
      // 'enquiry_number': {$ne:enquiryNumber},
      'other_details.enquiry_type': enquiryType,
      "enquiry_stages": {
        "$elemMatch": {
          "stage_name": "Enquiry",
          "status": { $in: ['Completed', 'In Progress'] }
        }
      }
    }
    console.log("query", query);
    return await this.enquiryRepository.getMany(query);
  }

  async reassignEmployee(school_code: number, hris_code: string) {
    let roleCodes: string[] = [];

    const isSdoRoleCode = getSdoRoleCodes().includes(hris_code);
    const isCC = getCcReHrisCodes().CC.indexOf(hris_code) > -1 ? true : false;
    const isRE = getCcReHrisCodes().RE.indexOf(hris_code) > -1 ? true : false;

    if (isCC) {
      // If logged in user is CC, then get a list of CC employees of that school
      roleCodes = [...getCcReHrisCodes().CC];
    } else if (isRE || isSdoRoleCode) {
      // If logged in user is RE or SDO, then get a list of employess of RE and SDO role code employees of that school
      roleCodes = [...getCcReHrisCodes().RE, ...getSdoRoleCodes()];
    } else {
      // If logged in user is neither CC nor RE nor SDO then throw error
      throw new BadRequestException('No employee');
    }
    const filter: (string | number)[][] = roleCodes.map((data) => {
      return [
        'filters[$and][1][hr_hris_unique_role][HRIS_Unique_Role_Code][$in]',
        data,
      ];
    });

    // Get active and serving notice period employees
    [
      EMPLOYEE_ACTIVITY_STATUS.ACTIVE,
      EMPLOYEE_ACTIVITY_STATUS.SERVING_NOTICE_PERIOD,
    ].forEach((status, index) => {
      filter.push([`filters[Employment_Status][id][$in][${index}]`, status]);
    });

    const response = await this.mdmService.fetchDataFromAPI(
      `/api/hr-employee-masters`,
      [
        [
          'filters[$and][0][Base_Location][Base_Location][parent1_id][$eq]',
          school_code,
        ],
        ...filter,
      ],
    );

    let data = [];
    if (response.data) {
      data = response.data;
    }
    return data;
  }

  async globalSearchEnquiryListing(
    req: Request,
    pageNumber: number,
    pageSize: number,
    globalSearchText: string,
  ) {
    const result = await this.getEnquiryDetailsCC(
      req,
      pageNumber,
      pageSize,
      [],
      globalSearchText,
    );
    return result;
  }

  async checkIfEnquiryExists(
    enquiryId: string,
  ): Promise<Partial<EnquiryDocument & Document>> {
    const getEnquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );
    if (!getEnquiryDetails) {
      throw new HttpException('Details not found', HttpStatus.NOT_FOUND);
    }
    return getEnquiryDetails;
  }

  async getMergeEnquiryDetails(
    enquiryId: string,
    body?: GetMergeDto | PostMergeDto,
  ): Promise<{
    enquirerDetails: Record<string, any>;
    similarEnquiries: Record<string, any>[];
  }> {
    const enquiryDetails = await this.checkIfEnquiryExists(enquiryId);

    const enquirerDetails: Record<string, unknown> = {};

    switch ((enquiryDetails.other_details as any).parent_type) {
      case EParentType.FATHER:
        const { father_details } = enquiryDetails.parent_details;
        enquirerDetails['name'] =
          father_details.first_name + father_details.last_name;
        enquirerDetails['email'] = father_details.email;
        enquirerDetails['mobile'] = father_details.mobile;
        break;
      case EParentType.MOTHER:
        const { mother_details } = enquiryDetails.parent_details;
        enquirerDetails['name'] =
          mother_details.first_name + mother_details.last_name;
        enquirerDetails['email'] = mother_details.email;
        enquirerDetails['mobile'] = mother_details.mobile;
        break;
      case EParentType.GUARDIAN:
        const { guardian_details } = enquiryDetails.parent_details;
        enquirerDetails['name'] =
          guardian_details.first_name + guardian_details.last_name;
        enquirerDetails['email'] = guardian_details.email;
        enquirerDetails['mobile'] = guardian_details.mobile;
        break;
    }

    let isEnquiryEligibleForMerge = true;
    if (
      !enquirerDetails['name'] ||
      !enquirerDetails['email'] ||
      !enquirerDetails['mobile'] ||
      !enquiryDetails?.student_details?.first_name ||
      !enquiryDetails.student_details.last_name ||
      !enquiryDetails.student_details?.dob ||
      enquiryDetails.status !== EEnquiryStatus.OPEN
    ) {
      isEnquiryEligibleForMerge = false;
    }

    if (!isEnquiryEligibleForMerge) {
      return { enquirerDetails, similarEnquiries: [] };
    }

    const { student_details } = enquiryDetails;

    const pipeline = [
      {
        $match: {
          $or: [
            {
              $or: [
                {
                  $or: [
                    {
                      'parent_details.father_details.mobile':
                        enquirerDetails['mobile'],
                    },
                    {
                      'parent_details.father_details.email':
                        enquirerDetails['email'],
                    },
                  ],
                },
                {
                  $or: [
                    {
                      'parent_details.mother_details.mobile':
                        enquirerDetails['mobile'],
                    },
                    {
                      'parent_details.mother_details.email':
                        enquirerDetails['email'],
                    },
                  ],
                },
                {
                  $or: [
                    {
                      'parent_details.guardian_details.mobile':
                        enquirerDetails['mobile'],
                    },
                    {
                      'parent_details.guardian_details.email':
                        enquirerDetails['email'],
                    },
                  ],
                },
              ],
            },
            {
              $and: [
                { 'student_details.first_name': student_details.first_name },
                { 'student_details.last_name': student_details.last_name },
                { 'student_details.dob': student_details.dob },
              ],
            },
          ],
          status: EEnquiryStatus.OPEN,
          _id: { $ne: new Types.ObjectId(enquiryId) },
        },
      },
    ];

    if (body?.user_id) {
      pipeline[0]['$match']['assigned_to_id'] = +body.user_id;
    }
    const similarEnquiries = await this.enquiryRepository.aggregate(pipeline);

    if (!similarEnquiries.length) {
      return { enquirerDetails, similarEnquiries };
    }

    const enquiriesToBeMerged = [];
    similarEnquiries.forEach((enquiry) => {
      enquiriesToBeMerged.push({
        enquiry_id: enquiry._id,
        enquiry_date: moment(enquiry.enquiry_date).format('DD-MM-YYYY'),
        enquiry_number: enquiry.enquiry_number,
        enquiry_for: enquiry.other_details.enquiry_type,
        student_name:
          (enquiry.student_details.first_name ?? '') +
          (enquiry.student_details.last_name ?? ''),
        school_name: enquiry.school_location.value, // Should we bring this name from MDM ?
        stage:
          enquiry?.enquiry_stages?.find(
            (stage) => stage?.status === EEnquiryStageStatus.OPEN,
          )?.stage_name ?? 'N/A',
        status: enquiry.status,
      });
    });

    return { enquirerDetails, similarEnquiries: enquiriesToBeMerged };
  }

  async getDuplicateEnquiriesByEmailPhone(payload) {
    const match: any = {
      $and: [
        {
          $or: [
            { "parent_details.father_details.email": { $regex: new RegExp(`^${payload.email.trim()}$`, 'i') } },
            { "parent_details.father_details.mobile": payload.phone.trim() },
            { "parent_details.mother_details.email": {  $regex: new RegExp(`^${payload.email.trim()}$`, 'i') } },
            { "parent_details.mother_details.mobile": payload.phone.trim() },
            { "parent_details.guardian_details.email": { $regex: new RegExp(`^${payload.email.trim()}$`, 'i')} },
            { "parent_details.guardian_details.mobile": payload.phone.trim() },
          ],
        },
        {
          "other_details.enquiry_type": payload.enquiryType,
        },
      ],
    };

    if (payload?.enquiryId) {
      match.$and.push({
        _id:{$ne: new Types.ObjectId(payload.enquiryId)},
      });
    }

    const enquiryDetails = await this.enquiryRepository.aggregate([
      { $match: match },
      {
        $project: {
          enquiry_number: 1,
        },
      },
    ]);


    return enquiryDetails;
  }


  async mergeEnquiry(targetEnquiry: string, body: PostMergeDto): Promise<void> {
    const { enquiryIds } = body;

    const { similarEnquiries } = await this.getMergeEnquiryDetails(
      targetEnquiry,
      body,
    );

    if (!similarEnquiries.length && !enquiryIds.length) {
      throw new HttpException(
        'There are no valid enquiries to be merged with the target enquiry',
        HttpStatus.BAD_REQUEST,
      );
    }

    // check if enquiry ids given are matching under similar enquiries
    let isSourceEnquiryMergable = false;
    for (const enquiryId of enquiryIds) {
      const isSimilar = similarEnquiries.find(
        (enquiry) => enquiry.enquiry_id.toString() === enquiryId,
      );
      if (!isSimilar) {
        isSourceEnquiryMergable = false;
        break;
      }
      isSourceEnquiryMergable = true;
    }

    if (!isSourceEnquiryMergable) {
      throw new HttpException(
        'Source enquiry cannot be merged with the target enquiry',
        HttpStatus.BAD_REQUEST,
      );
    }
    const mongoIdEnquiry = enquiryIds.map((id) => new Types.ObjectId(id));

    const enquiryDetails: Partial<EnquiryDocument & Document>[] =
      await this.enquiryRepository.getManyWithId(
        {
          _id: {
            $in: [...mongoIdEnquiry, new Types.ObjectId(targetEnquiry)],
          },
        },
        {
          _id: 1,
          __v: 0,
          enquiry_form_id: 0,
          enquiry_type_id: 0,
          documents: 0,
          other_details: 0,
        },
      );

    // if (enquiryDetails.length !== 2) {
    //   throw new HttpException(
    //     'Enquiry details not found',
    //     HttpStatus.NOT_FOUND,
    //   );
    // }
    const target = enquiryDetails.find(
      (enquiry) => enquiry._id.toString() === targetEnquiry,
    );
    const targetEnquiryId: Types.ObjectId = target._id;
    delete target._id;

    const sourceEnquiryIds: Types.ObjectId[] = [];
    for (const sourceEnquiry of enquiryIds) {
      const source = enquiryDetails.find(
        (enquiry) => enquiry._id.toString() === sourceEnquiry,
      );
      sourceEnquiryIds.push(source._id);
      delete source._id;
    }
    const targetEnquiryDoc =
      await this.enquiryRepository.getById(targetEnquiryId);
    // const updateResult = await this.enquiryRepository.updateOne(
    //   { _id: targetEnquiryId },
    //   {
    //     parent_enquiry_number: targetEnquiryDoc.enquiry_number,
    //   },
    // );

    // if (!updateResult.modifiedCount) {
    //   throw new HttpException(
    //     'Something went wrong while merging',
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
    for (const sourceEnquiryId of sourceEnquiryIds) {
      await Promise.all([
        this.enquiryRepository.updateById(sourceEnquiryId, {
          status: EEnquiryStatus.CLOSED,
          parent_enquiry_number: targetEnquiryDoc.enquiry_number,
        }),
        this.enquiryLogService.createLog({
          enquiry_id: sourceEnquiryId,
          event_type: EEnquiryEventType.ENQUIRY,
          event_sub_type: EEnquiryEventSubType.ENQUIRY_ACTION,
          event: `${EEnquiryEvent.ENQUIRY_MERGED} ${targetEnquiryDoc._id}`,
          created_by: 'user',
          log_data: {
            sourceEnquiryId: sourceEnquiryId,
            targetEnquiryId: targetEnquiryId,
            message: 'Enquiry merged',
          },
          created_by_id: 1,
        }),
        this.enquiryLogService.createLog({
          enquiry_id: sourceEnquiryId,
          event_type: EEnquiryEventType.ENQUIRY,
          event_sub_type: EEnquiryEventSubType.ENQUIRY_ACTION,
          event: EEnquiryEvent.ENQUIRY_CLOSED,
          log_data: {
            sourceEnquiryId: sourceEnquiryId,
            targetEnquiryId: targetEnquiryId,
            message: 'Enquiry closed by merging',
          },
          created_by: 'user',
          created_by_id: 1,
        }),
      ]);
    }
    return;
  }

  async deleteUploadedDocument(
    enquiryId: string,
    documentId: number,
  ): Promise<void> {
    const enquiry = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );
    if (!enquiry) {
      throw new HttpException('Enquiry not found', HttpStatus.NOT_FOUND);
    }

    const { documents } = enquiry;

    const updatedDocuments = documents.map((document) => {
      if (document.document_id === documentId) {
        document.file = null;
        document.is_deleted = true;
        document.is_verified = false;
      }
      return document;
    });

    await this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
      documents: updatedDocuments,
    });
    return;
  }

  async verifyUploadedDocument(
    enquiryId: string,
    documentId: number,
    verify: boolean,
  ): Promise<void> {
    const enquiry = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );
    if (!enquiry) {
      throw new HttpException('Enquiry not found', HttpStatus.NOT_FOUND);
    }

    const { documents } = enquiry;

    const document = documents.find(
      (document) => document.document_id === documentId,
    );

    if (document.is_deleted) {
      throw new HttpException(
        'Cannot verify or unverify a deleted document',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!document.file) {
      throw new HttpException(
        'Cannot verify or unverify as file not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedDocuments = documents.map((document) => {
      if (document.document_id === documentId) {
        document.is_verified = verify;
      }
      return document;
    });

    await this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
      documents: updatedDocuments,
    });
    return;
  }

  async getEnquiryDetailsForFinance(req: Request, enquiryId: string) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );
    if (!enquiryDetails) {
      throw new HttpException(
        'Enquiry details not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const schoolDoc = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.SCHOOL}/${enquiryDetails.school_location.id}`,
    );

    const {
      student_details,
      academic_year,
      enquiry_number,
      school_location,
      other_details,
      brand,
      board,
    } = enquiryDetails;

    const academicYearDetails = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.ACADEMIC_YEAR}/${academic_year?.id}`,
    );

    const searchSchoolResponse = await this.axiosService
      .setBaseUrl(this.configService.get<string>('ADMIN_PANEL_URL'))
      .setUrl(ADMIN_PANEL_URL.SEARCH_SCHOOL_LIST)
      .setMethod(EHttpCallMethods.POST)
      .setHeaders({
        Authorization: req.headers.authorization,
      } as AxiosRequestHeaders)
      .setBody({
        academic_year_id: [
          +academicYearDetails?.data?.attributes?.short_name_two_digit,
        ],
        school_id: [school_location?.id],
        brand_id: [brand?.id],
        board_id: [board?.id],
        grade_id: [student_details?.grade?.id],
        pageSize: 1,
        page: 1,
      })
      .sendRequest();
    const enquiryResponse = new Object();
    enquiryResponse['enquiry_id'] = enquiryId;
    enquiryResponse['student_name'] =
      (student_details?.first_name ?? '') +
      ' ' +
      (student_details?.last_name ?? '');
    enquiryResponse['enquiry_number'] = enquiry_number ? enquiry_number : null;
    enquiryResponse['school'] = school_location?.value
      ? school_location.value
      : null;
    enquiryResponse['school_id'] = school_location?.id
      ? school_location.id
      : null;
    enquiryResponse['stream'] = (enquiryDetails as any)?.stream?.value
      ? (enquiryDetails as any)?.stream?.value
      : null;
    enquiryResponse['stream_id'] = (enquiryDetails as any)?.stream?.id
      ? (enquiryDetails as any)?.stream?.id
      : null;
    enquiryResponse['brand'] = (enquiryDetails as any)?.brand?.value
      ? (enquiryDetails as any)?.brand?.value
      : null;
    enquiryResponse['brand_id'] = (enquiryDetails as any)?.brand?.id
      ? (enquiryDetails as any)?.brand?.id
      : null;
    enquiryResponse['board'] = (enquiryDetails as any)?.board?.value
      ? (enquiryDetails as any)?.board?.value
      : null;
    enquiryResponse['board_id'] = (enquiryDetails as any)?.board?.id
      ? (enquiryDetails as any)?.board?.id
      : null;
    enquiryResponse['course'] = (enquiryDetails as any)?.course?.value
      ? (enquiryDetails as any)?.course?.value
      : null;
    enquiryResponse['course_id'] = (enquiryDetails as any)?.course?.id
      ? (enquiryDetails as any)?.course?.id
      : null;
    enquiryResponse['grade'] = student_details?.grade?.value
      ? student_details?.grade?.value
      : null;
    enquiryResponse['grade_id'] = student_details?.grade?.id
      ? student_details?.grade?.id
      : null;
    enquiryResponse['shift'] = (enquiryDetails as any)?.shift?.value
      ? (enquiryDetails as any)?.shift?.value
      : null;
    enquiryResponse['shift_id'] = (enquiryDetails as any)?.shift?.id
      ? (enquiryDetails as any)?.shift?.id
      : null;
    enquiryResponse['academic_year'] = academic_year?.value
      ? academic_year.value
      : null;
    enquiryResponse['academic_year_id'] = academic_year?.id
      ? academic_year.id
      : null;
    enquiryResponse['concession_tags'] = other_details?.student_slug
      ? other_details?.student_slug
      : null;

    enquiryResponse['school_parent_id'] = schoolDoc?.data?.attributes
      ?.school_parent_id
      ? schoolDoc?.data?.attributes?.school_parent_id
      : null;

    enquiryResponse['lob_id'] =
      searchSchoolResponse?.data?.data?.data[0]?.lob_id;
    switch ((enquiryDetails.other_details as any).parent_type) {
      case EParentType.FATHER:
        const { father_details } = enquiryDetails.parent_details;
        enquiryResponse['guardian_name'] =
          father_details.first_name + ' ' + father_details.last_name;
        enquiryResponse['guardian_mobile'] = father_details.mobile;
        break;
      case EParentType.MOTHER:
        const { mother_details } = enquiryDetails.parent_details;
        enquiryResponse['guardian_name'] =
          mother_details.first_name + ' ' + mother_details.last_name;
        enquiryResponse['guardian_mobile'] = mother_details.mobile;
        break;
      case EParentType.GUARDIAN:
        const { guardian_details } = enquiryDetails.parent_details;
        enquiryResponse['guardian_name'] =
          guardian_details.first_name + ' ' + guardian_details.last_name;
        enquiryResponse['guardian_mobile'] = guardian_details.mobile;
        break;
    }

    return enquiryResponse;
  }

  async searchEnquiriesForFinance(searchPayload: {
    search: string;
    school_id: number[];
  }) {
    const { search, school_id } = searchPayload;
    const pipeline: PipelineStage[] = [
      {
        $match: {
          $or: [
            buildFilter('enquiry_number', 'contains', search),
            buildFilter('student_details.first_name', 'contains', search),
            buildFilter('student_details.last_name', 'contains', search),
            buildFilter(
              'parent_details.father_details.mobile',
              'contains',
              search,
            ),
            buildFilter(
              'parent_details.mother_details.mobile',
              'contains',
              search,
            ),
            buildFilter(
              'parent_details.guardian_details.mobile',
              'contains',
              search,
            ),
          ],
          ...(school_id.length
            ? {
              'school_location.id': {
                $in: school_id,
              },
            }
            : {}),
        },
      },
      {
        $lookup: {
          from: 'admission',
          localField: '_id',
          foreignField: 'enquiry_id',
          as: 'admissionDetails',
        },
      },
      {
        $addFields: {
          enquiryNumber: {
            $ifNull: ['$enquiry_number', null],
          },
        },
      },
      {
        $match: {
          $or: [
            {
              admissionDetails: { $size: 0 },
            },
            {
              $and: [
                {
                  admissionDetails: { $size: 1 },
                },
                {
                  'admissionDetails.student_id': { $eq: null },
                },
              ],
            },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          enquiry_id: '$_id',
          enquiry_number: '$enquiryNumber',
          student_first_name: '$student_details.first_name',
          student_last_name: '$student_details.last_name',
          school_location_value: '$school_location.value'
        },
      },
    ];

    console.log('Pipeline ---> ', JSON.stringify(pipeline));

    const enquiryList = await this.enquiryRepository.aggregate(pipeline);
    return enquiryList?.length
      ? enquiryList.map((enquiry) => {
        return {
          id: enquiry.enquiry_id,
          display_name:
            (enquiry?.student_first_name ?? '') +
            ' ' +
            (enquiry?.student_last_name ?? '') +
            ' - ' +
            enquiry.enquiry_number + '('+ (enquiry.school_location_value ?? '')  + ')',
          enr_no: enquiry.enquiry_number,
        };
      })
      : [];
  }

  async calculateEligibleGrade(
    academicYearId: number,
    schoolId: number,
    dob: string,
  ) {
    const [academicYearDetails, schoolDetails] = await Promise.all([
      this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.ACADEMIC_YEAR}/${academicYearId}`,
      ),
      this.mdmService.fetchDataFromAPI(`${MDM_API_URLS.SCHOOL}/${schoolId}`),
    ]);

    const academicYear = academicYearDetails?.data?.attributes?.short_name;
    const schoolStateId = schoolDetails?.data?.attributes?.state_id;

    if (!academicYear) {
      throw new HttpException(
        'Incorrect academic year ID',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!schoolStateId) {
      throw new HttpException('Incorrect school ID', HttpStatus.BAD_REQUEST);
    }

    const stateDetails = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.STATE}/${schoolStateId}`,
    );

    const state = stateDetails?.data?.attributes?.name;

    if (!state) {
      throw new HttpException('State detail not found', HttpStatus.BAD_REQUEST);
    }

    const mapping = STATE_AGE_MAPPING.find((mapping) => {
      return mapping.state.toLowerCase() === state.toLowerCase();
    });

    if (!mapping) {
      return { eligibleGrade: 'N/A' };
    }

    const endDate =
      '20' + academicYear.split('-')[0] + '-' + mapping.eligibleAsOf;

    const { years, months, days } = this.enquiryHelper.calculateAge(
      dob,
      endDate,
    );

    let eligibleGrade = 'N/A';

    for (let i = 0; i < mapping.gradeAgeMapping.length; i++) {
      const {
        years: eligibleYear,
        months: eligibleMonth,
        days: eligibleDays,
      } = mapping.gradeAgeMapping[i].age;
      if (years === eligibleYear) {
        if (months === eligibleMonth) {
          if (days >= eligibleDays) {
            eligibleGrade = mapping.gradeAgeMapping[i].grade;
            break;
          } else {
            eligibleGrade = mapping.gradeAgeMapping[i - 1].grade;
            break;
          }
        } else if (months > eligibleMonth) {
          eligibleGrade = mapping.gradeAgeMapping[i].grade;
          break;
        } else {
          eligibleGrade = mapping.gradeAgeMapping[i + 1].grade;
          break;
        }
      }
    }
    return { eligibleGrade };
  }

  async updatePaymentData(paymentData: Record<string, any>, req: Request) {
    const {
      enquiry_id,
      payment_type,
      enquiry_number,
      amount,
      mode_of_payment,
      payment_date_time,
    } = paymentData;

    const enquiryDetails = await this.enquiryRepository.getOne({
      _id: new Types.ObjectId(enquiry_id as string),
      enquiry_number: enquiry_number,
    });

    if (!enquiryDetails) {
      throw new HttpException(
        'Enquiry details not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (payment_type === EPaymentType.REGISTRATION) {
      const tPlusFiveDate = new Date();
      tPlusFiveDate.setDate(new Date().getDate() + 5);
      tPlusFiveDate.setHours(23, 59, 59, 999);

      await Promise.all([
        this.enquiryRepository.updateById(
          new Types.ObjectId(enquiry_id as string),
          {
            registration_fees_paid: true,
            registration_payment_details: {
              amount: amount,
              mode_of_payment: mode_of_payment,
              payment_date_time: payment_date_time,
            },
          },
        ),
        this.enquiryLogService.createLog({
          enquiry_id: enquiryDetails._id,
          event_type: EEnquiryEventType.REGISTRATION,
          event_sub_type: EEnquiryEventSubType.REGISTRATION_ACTION,
          event: EEnquiryEvent.REGISTRATION_FEE_RECEIVED,
          log_data: {
            registration_payment_details: {
              amount: amount,
              mode_of_payment: mode_of_payment,
              payment_date_time: payment_date_time,
            },
          },
          created_by: 'System',
          created_by_id: 1,
        }),
        // TODO: This call must be removed after implementing kit number logic in production
        process.env.NODE_ENV === 'production'
          ? this.enquiryStageUpdateService.moveToNextStage(
            enquiry_id,
            'Academic Kit Selling',
            req,
          )
          : () => Promise.resolve(true),
      ]);
      const { school_location } = enquiryDetails;
      //TODO: Make the below block of code non env specific once the kit number logic is implemented in production
      if (process.env.NODE_ENV !== 'production') {
        const kitNumberResponse = await this.mdmService.postDataToAPI(
          MDM_API_URLS.GENERATE_KIT_NUMBER,
          { school_id: school_location.id },
        );
        const kitNumber = (kitNumberResponse as any)?.data?.number;
        await this.enquiryRepository.updateById(
          new Types.ObjectId(enquiry_id),
          { generated_kit_number: kitNumber },
        );
      }
      return true;
    } else if (
      payment_type === EPaymentType.ADMISSION ||
      payment_type === EPaymentType.CONSOLIDATED ||
      payment_type === EPaymentType.PSA ||
      payment_type === EPaymentType.KIDS_CLUB
    ) {
      const paymentDetails = {
        enrollment_number: paymentData?.enrollment_number ?? null,
        gr_number: paymentData?.gr_number ?? null,
        amount: amount,
        mode_of_payment: mode_of_payment,
        payment_date_time: payment_date_time,
      };

      const tPlusFiveDate = new Date();
      tPlusFiveDate.setDate(new Date().getDate() + 5);
      tPlusFiveDate.setHours(23, 59, 59, 999);

      // const isAdmissionFeeReceivedLog = await this.enquiryLogRepository.getOne({
      //   enquiry_id: enquiryDetails._id,
      //   event: EEnquiryEvent.ADMISSION_FEE_RECEIVED,
      // });

      const isEnrGenerated = await this.admissionRepository.getOne({
        enquiry_id: enquiryDetails._id,
      });

      if (isEnrGenerated.enrolment_number) {
        this.loggerService.log(`Enrollment number already exists !!`);
        this.loggerService.log(`Not proceeding to insert student details !!`);
        return true;
      }


      // if (isAdmissionFeeReceivedLog) {
      //   this.loggerService.log(`Admission fee receive log already exists !!`);
      //   this.loggerService.log(`Not proceeding to insert student details !!`);
      //   return true;
      // }

      try {
        // Purposely placing the create log outside of Promise.all to handle the race condition
        await this.enquiryLogService.createLog({
          enquiry_id: enquiryDetails._id,
          event_type: EEnquiryEventType.ADMISSION,
          event_sub_type: EEnquiryEventSubType.ADMISSION_ACTION,
          event: EEnquiryEvent.ADMISSION_FEE_RECEIVED,
          log_data: {
            admission_payment_details: paymentDetails,
          },
          created_by: 'System',
          created_by_id: 1,
        });

        await Promise.all([
          this.admissionService.updateAdmissionPaymentStatus(
            enquiry_id as string,
            paymentDetails,
          ),
          this.enquiryStageUpdateService.moveToNextStage(
            enquiry_id,
            'Payment',
            req,
          ),
          this.myTaskService.createMyTask({
            enquiry_id: enquiry_id,
            created_for_stage: ETaskEntityType.ADMITTED_OR_PROVISIONAL_APPROVAL,
            task_creation_count: 1,
            valid_from: new Date(),
            valid_till: tPlusFiveDate,
            assigned_to_id: enquiryDetails.assigned_to_id,
          }),
        ]);
        return true;
      } catch (err) {
        this.loggerService.log(
          `Error occured while processing the admission fee !!`,
        );
        // await this.enquiryLogRepository.hardDeleteById(
        //   isAdmissionFeeReceivedLog._id,
        // );
        throw err;
      }
    }
    return false;
  }

  async updateEnquiryStatus(
    enquiryId: string,
    status: EEnquiryStatus,
    metadata: Record<string, any> = null,
  ): Promise<void> {
    switch (status) {
      case EEnquiryStatus.CLOSED:
        const enquiry = await this.enquiryRepository.getById(
          new Types.ObjectId(enquiryId),
        );
        await Promise.all([
          this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
            status: EEnquiryStatus.CLOSED,
          }),
          this.enquiryLogService.createLog({
            enquiry_id: new Types.ObjectId(enquiryId),
            event_type: EEnquiryEventType.ENQUIRY,
            event_sub_type: EEnquiryEventSubType.ENQUIRY_ACTION,
            event: EEnquiryEvent.ENQUIRY_CLOSED,
            log_data: metadata,
            created_by: 'User',
            created_by_id: 1,
          }),
        ]);

        // below function sends notification
        // this.emailService.setEnquiryDetails(enquiry).sendNotification(
        //   EMAIL_TEMPLATE_SLUGS.ENQUIRY_CLOSED,
        //   {
        //     enq_no: enquiry.enquiry_number,
        //     e_signature: '+91 6003000700',
        //     link: 'https://www.vibgyorhigh.com/'
        //   },
        //   [
        //     this.enquiryHelper.getEnquirerDetails(enquiry, 'email')
        //       ?.email as string,
        //   ],
        // );

        break;
      case EEnquiryStatus.ON_HOLD:
        break;
      case EEnquiryStatus.OPEN:
        break;
    }
    return;
  }

  async triggerBulkDetailApi(
    workflow_ids: string,
    token: string,
    crossPlatformRequest: boolean,
  ) {
    return this.axiosService
      .setBaseUrl(`${this.configService.get<string>('ADMIN_PANEL_URL')}`)
      .setMethod(EHttpCallMethods.POST)
      .setHeaders({ Authorization: token } as AxiosRequestHeaders)
      .setUrl(ADMIN_PANEL_URL.GET_WORKFLOW_BULK_DEATIL)
      .setBody({ workflowIds: [workflow_ids] })
      .isCrossPlatformRequest(crossPlatformRequest)
      .sendRequest();
  }

  async updateAdmissionStatus(admisionDto: UpdateAdmissionDto, req: Request) {
    const isAppReq = isAppRequest(req);
    const workflowLogDoc = await this.triggerBulkDetailApi(
      admisionDto.workflow_id,
      req.headers.authorization,
      isAppReq,
    );
    if (!workflowLogDoc?.data?.data) {
      throw new NotFoundException(
        `logs not found for workflow id :: ${admisionDto.workflow_id}`,
      );
    }
    const [data] = workflowLogDoc.data.data;

    const enquiryId = new Types.ObjectId(data.module_id as string);
    const enquiryDetails = await this.enquiryRepository.getById(enquiryId);
    if (enquiryDetails?.other_details?.enquiry_type === EEnquiryType.IVT) {
    }
    const status = AdmissionStatus[admisionDto.status];
    const stage_name = 'Admission Status';

    const result = await this.enquiryRepository.updateOne(
      { _id: enquiryId },
      { $set: { 'enquiry_stages.$[elem].status': status } },
      {
        arrayFilters: [{ 'elem.stage_name': stage_name }],
        new: true,
      },
    );

    await Promise.all([
      this.admissionRepository.updateByEnquiryId(enquiryId, {
        admission_approval_status:
          EAdmissionApprovalStatus[AdmissionStatus[admisionDto.status]],
      }),
      ...(enquiryDetails?.other_details?.enquiry_type === EEnquiryType.IVT ||
        enquiryDetails?.other_details?.enquiry_type === EEnquiryType.READMISSION
        ? [
          this.admissionRepository.create({
            enquiry_id: enquiryId,
            admission_approval_status: status,
          }),
        ]
        : []),
      this.enquiryLogService.createLog({
        enquiry_id: enquiryId,
        event_type: EEnquiryEventType.ADMISSION,
        event_sub_type: EEnquiryEventSubType.ADMISSION_ACTION,
        event:
          status === EAdmissionApprovalStatus.APPROVED
            ? EEnquiryEvent.ADMISSION_APPROVED
            : EEnquiryEvent.ADMISSION_REJECTED,
        log_data: {
          enquiry_id: enquiryId,
          admission_approval_status: status,
        },
        created_by: 'System',
        created_by_id: 1,
      }),
    ]);
    return result;
  }
  async generateTermsAndConditionPdf(
    enquiryId: string,
    schoolId: number,
    download: boolean = false,
  ) {
    const bucketName = this.configService.get<string>('BUCKET_NAME');
    const enquiryDoc = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );
    if (!enquiryDoc) {
      throw new NotFoundException('Enquiry not found!');
    }
    const schoolResponse = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.SCHOOL}/${schoolId}`,
    );
    if (!schoolResponse?.data?.attributes?.term_and_conditions) {
      throw new NotFoundException('terms and Condition is not there');
    }
    const template = applyTemplate(
      schoolResponse.data.attributes.term_and_conditions,
      {
        student_name: `${enquiryDoc?.student_details?.first_name} ${enquiryDoc?.student_details?.last_name}`,
        school_name: `${enquiryDoc?.school_location?.value}`,
      },
    );

    const buffer = await this.pdfService.createPdf(template);

    const filenamefile: Express.Multer.File =
      await this.fileService.createFileFromBuffer(
        buffer,
        'termsAndCondition.pdf',
        'application/pdf',
      );
    await this.setFileUploadStorage();
    const response = await this.storageService.uploadFile(filenamefile);
    const signedUrl = await this.storageService.getSignedUrl(
      bucketName,
      response,
      download,
    );
    return { url: signedUrl };
  }

  async acceptTermsAndCondition(enquiryId: string) {
    const enquiryDoc = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );
    if (!enquiryDoc) {
      throw new NotFoundException('Enquiry not found!');
    }
    await this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
      'other_details.are_terms_and_condition_accepted': true,
    });
    return;
  }

  //TODO: Remove this wrapper in future. This wrapper is a temporary solution for resolving the circular dependency error
  async moveToNextStageWrapper(
    enquiryId: string,
    currentStage: string,
    req: Request,
  ) {
    return await this.enquiryStageUpdateService.moveToNextStage(
      enquiryId,
      currentStage,
      req,
    );
  }

  // report export To Csv
  async enquiryDetailsReport(jobId = null) {
    const pipeline = [
      {
        $sort: { created_at: -1 },
      },
      {
        $lookup: {
          from: 'enquiryType',
          localField: 'enquiry_type_id',
          foreignField: '_id',
          as: 'enquiry_type_details',
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$enquiry_type_details',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'admission',
          localField: '_id',
          foreignField: 'enquiry_id',
          as: 'admissionDetails',
        },
      },
      {
        $lookup: {
          from: 'followUps',
          localField: '_id',
          foreignField: 'enquiry_id',
          as: 'lastFollowUps',
          pipeline: [
            {
              $sort: {
                _id: -1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'enquiryLogs',
          localField: '_id',
          foreignField: 'enquiry_id',
          as: 'enquiryLogs',
          pipeline: [
            {
              $match: {
                event: {
                  $in: [
                    EEnquiryEvent.REGISTRATION_FEE_RECEIVED,
                    EEnquiryEvent.SCHOOL_TOUR_SCHEDULED,
                    EEnquiryEvent.SCHOOL_TOUR_RESCHEDULE,
                    EEnquiryEvent.SCHOOL_TOUR_COMPLETED,
                    EEnquiryEvent.REGISTRATION_FEE_RECEIVED,
                    EEnquiryEvent.ENQUIRY_CLOSED,
                    EEnquiryEvent.ENQUIRY_REOPENED,
                    EEnquiryEvent.ENQUIRY_CREATED,  // Add this line
                  ],
                },
              },
            },
            {
              $sort: {
                _id: -1,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          school_name: '$school_location.value',
          school_id: '$school_location.id',
          enquiry_number: '$enquiry_number',
          enquiry_date: '$enquiry_date',
          student_first_name: '$student_details.first_name',
          student_last_name: '$student_details.last_name',
          enquiry_stages: 1,
          enquiry_status: {
            $cond: {
              if: {
                $eq: ['$status', EEnquiryStatus.ADMITTED],
              },
              then: EEnquiryStatus.CLOSED,
              else: '$status',
            },
          },
          // current_stage: {
          //   $cond: {
          //     if: {
          //       $eq: ['$lastCompletedStageIndex', 4],
          //     },
          //     then: {
          //       $cond: {
          //         if: {
          //           $eq: ['$nextStage.status', EEnquiryStageStatus.REJECTED],
          //         },
          //         then: 'Admission Cancelled',
          //         else: {
          //           $cond: {
          //             if: {
          //               $eq: [
          //                 '$nextStage.status',
          //                 EEnquiryStageStatus.APPROVED,
          //               ],
          //             },
          //             then: 'Admission Approved',
          //             else: '$nextStage.stage_name',
          //           },
          //         },
          //       },
          //     },
          //     else: '$nextStage.stage_name',
          //   },
          // },
          board: '$board.value',
          grade: '$student_details.grade.value',
          course: '$course.value',
          stream: '$stream.value',
          shift: '$shift.value',
          created_by: '$created_by.user_name',
          current_owner: '$assigned_to',
          enquiry_type: '$enquiry_type_details.name',
          enquiry_category: '$enquiry_category.value',
          academic_year: '$academic_year.value',
          sibling_details: '$sibling_details',
          enquiry_mode: '$enquiry_mode.value',
          enquiry_source_type: '$enquiry_source_type.value',
          enquiry_source: '$enquiry_source.value',
          enquiry_sub_source: '$enquiry_sub_source.value',
          enquirer_sso_details: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: ['$other_details.parent_type', EParentType.FATHER],
                  },
                  then: {
                    username: {
                      $ifNull: [
                        '$parent_details.father_details.sso_username',
                        null,
                      ],
                    },
                    password: {
                      $ifNull: [
                        '$parent_details.father_details.sso_password',
                        null,
                      ],
                    },
                  },
                },
                {
                  case: {
                    $eq: ['$other_details.parent_type', EParentType.MOTHER],
                  },
                  then: {
                    username: {
                      $ifNull: [
                        '$parent_details.mother_details.sso_username',
                        null,
                      ],
                    },
                    password: {
                      $ifNull: [
                        '$parent_details.mother_details.sso_password',
                        null,
                      ],
                    },
                  },
                },
                {
                  case: {
                    $eq: ['$other_details.parent_type', EParentType.GUARDIAN],
                  },
                  then: {
                    username: {
                      $ifNull: [
                        '$parent_details.guardian_details.sso_username',
                        null,
                      ],
                    },
                    password: {
                      $ifNull: [
                        '$parent_details.guardian_details.sso_password',
                        null,
                      ],
                    },
                  },
                },
              ],
              default: null,
            },
          },
          corporate_tie_up: {
            $cond: {
              if: {
                $eq: ['$enquiry_sub_source.value', 'Corporate Tie-Up'],
              },
              then: 'Yes',
              else: 'No',
            },
          },
          pre_school_tie_up: {
            $cond: {
              if: {
                $eq: ['$enquiry_sub_source.value', 'Pre School Tie-Up'],
              },
              then: 'Yes',
              else: 'No',
            },
          },
          parent_referral: {
            $cond: {
              if: {
                $eq: ['$enquiry_sub_source.value', 'Parent Referral'],
              },
              then: 'Yes',
              else: 'No',
            },
          },
          employee_referral: {
            $cond: {
              if: {
                $eq: ['$enquiry_sub_source.value', 'Employee Referral'],
              },
              then: 'Yes',
              else: 'No',
            },
          },
          school_location: '$school_location.value',
          parent_type: '$other_details.parent_type',
          created_at: '$created_at',
          admission_date: {
            $cond: {
              if: {
                $ifNull: ['$cancelled_admission_date', false],
              },
              then: {
                $dateToString: {
                  format: '%d-%m-%Y',
                  date: '$cancelled_admission_date',
                },
              },
              else: {
                $cond: {
                  if: {
                    $gt: [{ $size: '$admissionDetails' }, 0],
                  },
                  then: {
                    $dateToString: {
                      format: '%d-%m-%Y',
                      date: {
                        $arrayElemAt: ['$admissionDetails.admitted_at', 0],
                      },
                    },
                  },
                  else: null,
                },
              },
            },
          },
          next_follow_up_date: '$next_follow_up_at',
          next_follow_up: {
            $cond: {
              if: {
                $and: [
                  { $eq: ['$enquiry_mode.value', 'Digital (website)'] },
                  { $eq: [{ $size: '$lastFollowUps' }, 0] },
                ],
              },
              then: {
                $dateToString: {
                  format: '%d-%m-%Y',
                  date: '$created_at',
                },
              },
              else: {
                $cond: {
                  if: {
                    $and: [
                      { $gt: [{ $size: '$lastFollowUps' }, 0] },
                      {
                        $ne: [
                          { $arrayElemAt: ['$lastFollowUps.date', 0] },
                          null,
                        ],
                      },
                    ],
                  },
                  then: {
                    $dateToString: {
                      format: '%d-%m-%Y',
                      date: {
                        $dateFromString: {
                          dateString: {
                            $arrayElemAt: ['$lastFollowUps.date', 0],
                          },
                        },
                      },
                    },
                  },
                  else: null,
                },
              },
            },
          },
          query: {
            $ifNull: ['$other_details.query', null],
          },
          last_follow_up_date: {
            $cond: {
              if: { $gt: [{ $size: '$lastFollowUps' }, 0] },
              then: {
                $dateToString: {
                  format: '%d-%m-%Y',
                  date: { $arrayElemAt: ['$lastFollowUps.created_at', 0] },
                },
              },
              else: null,
            },
          },
          last_follow_up_remark: {
            $cond: {
              if: { $gt: [{ $size: '$lastFollowUps' }, 0] },
              then: { $arrayElemAt: ['$lastFollowUps.remarks', 0] },
              else: null,
            },
          },
          school_tour_scheduled_date: {
            $cond: {
              if: {
                $gt: [{ $size: '$enquiryLogs' }, 0],
              },
              then: {
                $let: {
                  vars: {
                    scheduledSchoolTourLog: {
                      $filter: {
                        input: '$enquiryLogs',
                        as: 'log',
                        cond: {
                          $in: [
                            '$$log.event',
                            [
                              EEnquiryEvent.SCHOOL_TOUR_SCHEDULED,
                              EEnquiryEvent.SCHOOL_TOUR_RESCHEDULE,
                            ],
                          ],
                        },
                      },
                    },
                  },
                  in: {
                    $ifNull: [
                      {
                        $arrayElemAt: [
                          '$$scheduledSchoolTourLog.log_data.date',
                          0,
                        ],
                      },
                      null,
                    ],
                  },
                },
              },
              else: null,
            },
          },
          walkin_date: {
            $let: {
              vars: {
                schoolTourLogs: {
                  $filter: {
                    input: { $ifNull: ['$enquiryLogs', []] },
                    as: 'log',
                    cond: {
                      $eq: ['$$log.event', 'School tour completed'],
                    },
                  },
                },
                kitSellingLogs: {
                  $filter: {
                    input: { $ifNull: ['$enquiryLogs', []] },
                    as: 'log',
                    cond: {
                      $eq: ['$$log.event', 'Registration fee received'],
                    },
                  },
                },
                enquiryCreatedLogs: {
                  $filter: {
                    input: { $ifNull: ['$enquiryLogs', []] },
                    as: 'log',
                    cond: {
                      $eq: ['$$log.event', 'Enquiry created'],
                    },
                  },
                },
              },
              in: {
                $cond: [
                  { $eq: ['$other_details.enquiry_type', 'readmission_10_11'] },
                  {
                    $cond: [
                      { $gt: [{ $size: '$$enquiryCreatedLogs' }, 0] },
                      {
                        $dateToString: {
                          format: '%d-%m-%Y',
                          date: {
                            $arrayElemAt: ['$$enquiryCreatedLogs.created_at', 0],
                          },
                        },
                      },
                      'NA',
                    ],
                  },
                  {
                    $cond: [
                      { $gt: [{ $size: '$$kitSellingLogs' }, 0] },
                      {
                        $dateToString: {
                          format: '%d-%m-%Y',
                          date: {
                            $arrayElemAt: ['$$kitSellingLogs.created_at', 0],
                          },
                        },
                      },
                      {
                        $cond: [
                          { $gt: [{ $size: '$$schoolTourLogs' }, 0] },
                          {
                            $dateToString: {
                              format: '%d-%m-%Y',
                              date: {
                                $arrayElemAt: ['$$schoolTourLogs.created_at', 0],
                              },
                            },
                          },
                          'NA',
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
          kit_sold_date: {
            $cond: {
              if: {
                $ifNull: ['$kit_sold_date', false],
              },
              then: {
                $dateToString: {
                  format: '%d-%m-%Y',
                  date: {
                    $convert: {
                      input: '$kit_sold_date',
                      to: 'date',
                      onError: null,
                      onNull: null,
                    },
                  },
                },
              },
              else: {
                $let: {
                  vars: {
                    registrationFeeReceivedLog: {
                      $filter: {
                        input: '$enquiryLogs',
                        as: 'log',
                        cond: {
                          $eq: [
                            '$$log.event',
                            EEnquiryEvent.REGISTRATION_FEE_RECEIVED,
                          ],
                        },
                      },
                    },
                  },
                  in: {
                    $cond: {
                      if: {
                        $ifNull: ['$$registrationFeeReceivedLog', false],
                      },
                      then: {
                        $dateToString: {
                          format: '%d-%m-%Y',
                          date: {
                            $arrayElemAt: [
                              '$$registrationFeeReceivedLog.created_at',
                              0,
                            ],
                          },
                        },
                      },
                      else: null,
                    },
                  },
                },
              },
            },
          },
          dropped_date: {
            $cond: {
              if: { $ifNull: ['$drop_date', false] },
              then: {
                $dateToString: {
                  format: '%d-%m-%Y',
                  date: {
                    $convert: {
                      input: '$drop_date',
                      to: 'date',
                      onError: null,
                      onNull: null,
                    },
                  },
                },
              },
              else: {
                $let: {
                  vars: {
                    enquiryClosedLog: {
                      $filter: {
                        input: '$enquiryLogs',
                        as: 'log',
                        cond: {
                          $eq: ['$$log.event', EEnquiryEvent.ENQUIRY_CLOSED],
                        },
                      },
                    },
                  },
                  in: {
                    $cond: {
                      if: { $gt: [{ $size: '$$enquiryClosedLog' }, 0] },
                      then: {
                        $dateToString: {
                          format: '%d-%m-%Y',
                          date: {
                            $convert: {
                              input: {
                                $arrayElemAt: [
                                  '$$enquiryClosedLog.created_at',
                                  0,
                                ],
                              },
                              to: 'date',
                              onError: null,
                              onNull: null,
                            },
                          },
                        },
                      },
                      else: null,
                    },
                  },
                },
              },
            },
          },
          leadReopen_date: {
            $let: {
              vars: {
                leadReopenLog: {
                  $filter: {
                    input: { $ifNull: ['$enquiryLogs', []] },
                    as: 'log',
                    cond: {
                      $eq: ['$$log.event', 'Enquiry reopened'],
                    },
                  },
                },
              },
              in: {
                $cond: {
                  if: {
                    $gt: [{ $size: '$$leadReopenLog' }, 0],
                  },
                  then: {
                    $dateToString: {
                      format: '%d-%m-%Y',
                      date: {
                        $arrayElemAt: ['$$leadReopenLog.created_at', 0],
                      },
                    },
                  },
                  else: null,
                },
              },
            },
          },
          createdAtFormatted: {
            $let: {
              vars: {
                parts: {
                  $dateToParts: {
                    date: '$created_at',
                    timezone: 'Asia/Kolkata',
                  },
                },
              },
              in: {
                $concat: [
                  // Day with leading zero
                  {
                    $cond: [
                      { $lt: ['$$parts.day', 10] },
                      { $concat: ['0', { $toString: '$$parts.day' }] },
                      { $toString: '$$parts.day' },
                    ],
                  },
                  '-',
                  // Month with leading zero
                  {
                    $cond: [
                      { $lt: ['$$parts.month', 10] },
                      { $concat: ['0', { $toString: '$$parts.month' }] },
                      { $toString: '$$parts.month' },
                    ],
                  },
                  '-',
                  { $toString: '$$parts.year' },
                  ' ',
                  // Hour in 12-hour format
                  {
                    $toString: {
                      $cond: [
                        { $eq: [{ $mod: ['$$parts.hour', 12] }, 0] },
                        12,
                        { $mod: ['$$parts.hour', 12] },
                      ],
                    },
                  },
                  ':',
                  // Minutes with leading zero
                  {
                    $cond: [
                      { $lt: ['$$parts.minute', 10] },
                      { $concat: ['0', { $toString: '$$parts.minute' }] },
                      { $toString: '$$parts.minute' },
                    ],
                  },
                  ' ',
                  // AM/PM
                  {
                    $cond: [{ $lt: ['$$parts.hour', 12] }, 'AM', 'PM'],
                  },
                ],
              },
            },
          },
        },
      },
    ];

    const enquiryDetails = await this.enquiryRepository.aggregate(pipeline);
    if (!enquiryDetails.length) {
      throw new HttpException(
        'Enquiries not found for the provided academic year Id',
        HttpStatus.NOT_FOUND,
      );
    }

    const schoolIds = [];
    const enquiries = enquiryDetails.map((e: any) => {
      if (
        !schoolIds.includes(e.school_id) &&
        ![false, null, undefined, ''].includes(e.school_id)
      )
        schoolIds.push(e.school_id);
      let followUpdate = e?.next_follow_up;
      if (!e?.next_follow_up && e?.next_follow_up_date) {
        if (typeof e?.next_follow_up_date === 'string') {
          followUpdate =
            e?.next_follow_up_date.split('T')?.length > 0
              ? e?.next_follow_up_date
                .split('T')[0]
                .split('-')
                .reverse()
                .join('-')
              : null;
        } else if (typeof e?.next_follow_up_date === 'object') {
          followUpdate =
            e?.next_follow_up_date.toISOString().split('T')?.length > 0
              ? e?.next_follow_up_date
                .toISOString()
                .split('T')[0]
                .split('-')
                .reverse()
                .join('-')
              : null;
        }
      }
      return {
        'School Id': e?.school_id ?? 'NA',
        'Enquiry No': e?.enquiry_number ?? 'NA',
        'Lead Generation Date': e.enquiry_date
          ? moment(e.enquiry_date).format('DD-MM-YYYY')
          : 'NA',
        'Student First Name': e?.student_first_name ?? 'NA',
        'Student Last Name': e?.student_last_name ?? 'NA',
        Board: e?.board ?? 'NA',
        Grade: e?.grade ?? 'NA',
        Division: e?.division ?? 'NA',
        Course: e?.course ?? 'NA',
        Stream: e?.stream ?? 'NA',
        Shift: e?.shift ?? 'NA',
        'Mandatory Profile % Updated': 'NA',
        'Profile % Updated': 'NA',
        'Enquiry Initiator': e?.created_by ?? 'NA',
        'Current Owner': e?.current_owner ?? 'NA',
        'Enquiry For': e?.enquiry_type ?? 'NA',
        'Enquiry for Academic Year': e?.academic_year ?? 'NA',
        'Is sibling': e?.sibling_details?.length ? 'YES' : 'NO',
        'Enquiry Status': e?.enquiry_status ?? 'NA',
        // 'Current Stage': e?.current_stage ?? 'NA',
        'Current Stage':
          this.enquiryHelper.getCurrentEnquiryStage(e?.enquiry_stages) ?? 'NA',
        'Mode of Contact': e?.enquiry_mode ?? 'NA',
        'Source Type': e?.enquiry_source_type ?? 'NA',
        'Enquiry Source': e?.enquiry_source ?? 'NA',
        'Enquiry Sub-Source': e?.enquiry_sub_source ?? 'NA',
        'Enquirer SSO Username': e?.enquirer_sso_details?.username ?? 'NA',
        'Enquirer SSO Password': e?.enquirer_sso_details?.password ?? 'NA',
        'Next Follow Up': followUpdate ?? 'NA',
        'Corporate Tie-ups': e?.corporate_tie_up ?? 'NA',
        'Pre school Tie-ups': e?.pre_school_tie_up ?? 'NA',
        'Parent Referral': e?.parent_referral ?? 'NA',
        'Employee Referral': e?.employee_referral ?? 'NA',
        Query: e?.query ?? 'NA',
        'Lead Reopened date': e?.leadReopen_date ?? 'NA',
        'Last Follow up Date': e?.last_follow_up_date ?? 'NA',
        'Last Follow up Remark': e?.last_follow_up_remark ?? 'NA',
        'School Tour Appointment Date': e?.school_tour_scheduled_date ?? 'NA',
        'Walk-In Date': e?.walkin_date ?? 'NA',
        'Admission Date': e?.admission_date ?? 'NA',
        'Kit Sold Date': e?.kist_sold_date ?? 'NA',
        'Dropped Date': e?.dropped_date ?? 'NA',
        'Created At': e?.createdAtFormatted ?? 'NA',
      };
    });

    const schoolDetails = await this.mdmService.postDataToAPI(
      MDM_API_URLS.SEARCH_SCHOOL,
      {
        operator: `school_id In (${schoolIds.toString()})`,
      },
    );

    const schoolDataIds = schoolDetails?.data?.schools?.map(
      (school) => school.school_id,
    );
    console.log('schoolDataIds', new Set(schoolDataIds));
    const count = 0;
    const updatedRecords = [];
    if (schoolDetails?.data?.schools?.length) {
      updatedRecords.push(
        ...enquiries.map((enquiry) => {
          const schoolData = schoolDetails.data.schools.find(
            (school) =>
              school.school_id === enquiry['School Id'] &&
              school.grade_name === enquiry.Grade,
          );
          const updatedRecord = {
            'Business Vertical': schoolData?.lob_p2_description ?? 'NA',
            'Business Sub Vertical': schoolData?.lob_p1_description ?? 'NA',
            'Business Sub Sub Vertical': schoolData?.lob_description ?? 'NA',
            Cluster: schoolData?.cluster_name ?? 'NA',
            ...enquiry,
          };
          delete enquiry['School Id'];
          return updatedRecord;
        }),
      );
      console.log('count of clusters:', count);
    } else {
      updatedRecords.push(
        ...enquiries.map((enquiry) => {
          const updatedRecord = {
            'Business Vertical': 'NA',
            'Business Sub Vertical': 'NA',
            'Business Sub Sub Vertical': 'NA',
            Cluster: 'NA',
            ...enquiry,
          };
          delete enquiry['School Id'];
          return updatedRecord;
        }),
      );
    }

    const fields = [
      'Business Vertical',
      'Business Sub Vertical',
      'Business Sub Sub Vertical',
      'Cluster',
      'Enquiry No',
      'Lead Generation Date',
      'Student First Name',
      'Student Last Name',
      'Board',
      'Grade',
      'Division',
      'Course',
      'Stream',
      'Shift',
      'Mandatory Profile % Updated',
      'Profile % Updated',
      'Enquiry Initiator',
      'Current Owner',
      'Enquiry For',
      'Enquiry for Academic Year',
      'Is sibling',
      'Enquiry Status',
      'Current Stage',
      'Mode of Contact',
      'Source Type',
      'Enquiry Source',
      'Enquiry Sub-Source',
      'Enquirer SSO Username',
      'Enquirer SSO Password',
      'Next Follow Up',
      'Corporate Tie-ups',
      'Pre school Tie-ups',
      'Parent Referral',
      'Employee Referral',
      'Query',
      'Lead Reopened date',
      'Last Follow up Date',
      'Last Follow up Remark',
      'School Tour Appointment Date',
      'Walk-In Date',
      'Admission Date',
      'Kit Sold Date',
      'Dropped Date',
      'Created At',
    ];

    const date = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
    });
    const [month, day, year] = date.split(',')[0].split('/');
    const filename = `Enquiry-Details-${day}-${month}-${year}-${date.split(',')[1].trimStart().split(' ')[0].split(':').join('')}`;

    const generatedCSV: any = await this.csvService.generateCsv(
      updatedRecords,
      fields,
      filename,
    );

    const file: Express.Multer.File =
      await this.fileService.createFileFromBuffer(
        Buffer.from(generatedCSV.csv),
        filename,
        'text/csv',
      );
    await this.setFileUploadStorage();
    const uploadedFileName = await this.storageService.uploadFile(
      file,
      filename,
    );
    const bucketName = this.configService.get<string>('BUCKET_NAME');

    if (!uploadedFileName) {
      throw new HttpException(
        'Something went wrong while uploading file!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const signedUrl = await this.storageService.getSignedUrl(
      bucketName,
      uploadedFileName,
      false,
    );

    if (jobId) {
      await this.jobShadulerService.updateJob(jobId, {
        jobId: jobId,
        user: 'System',
        event: 'Enquiry details report',
        jobData: {
          url: signedUrl,
          fileName: uploadedFileName,
        },
      });
    }
    return {
      url: signedUrl,
      fileName: uploadedFileName,
    };
  }
  parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('-');
    return new Date(`${year}-${month}-${day}`);
  };
  //! daily enquiry report - SANJEEV MAJHI
  async dailyEnquiryReport(data) {
    const pipeline = [
      {
        $lookup: {
          from: 'enquiryLogs',
          localField: '_id',
          foreignField: 'enquiry_id',
          as: 'enquiryLogs',
          pipeline: [
            {
              $match: {
                event: {
                  $in: [
                    EEnquiryEvent.SCHOOL_TOUR_SCHEDULED,
                    EEnquiryEvent.SCHOOL_TOUR_RESCHEDULE,
                    EEnquiryEvent.SCHOOL_TOUR_COMPLETED,
                  ],
                },
              },
            },
            {
              $sort: {
                _id: -1,
              },
            },
          ],
        },
      },
      {
        $match: {
          "enquiryLogs.log_data": { $exists: true },
          status: "Open",
          enquiryLogs: {
            $elemMatch: {
              event: {
                $in: [
                  EEnquiryEvent.SCHOOL_TOUR_SCHEDULED,
                  EEnquiryEvent.SCHOOL_TOUR_RESCHEDULE
                ]
              }
            }
          }
        },
      },
      {
        $project: {
          school_id: "$school_location.id",
          school: "$school_location.value",
          enquiry_number: "$enquiry_number",
          enquiry_name: {
            $cond: {
              if: { $eq: ["$other_details.parent_type", "Father"] },
              then: {
                $trim: {
                  input: {
                    $concat: [
                      { $ifNull: ["$parent_details.father_details.first_name", ""] },
                      " ",
                      { $ifNull: ["$parent_details.father_details.last_name", ""] },
                    ],
                  },
                },
              },
              else: {
                $trim: {
                  input: {
                    $concat: [
                      { $ifNull: ["$parent_details.mother_details.first_name", ""] },
                      " ",
                      { $ifNull: ["$parent_details.mother_details.last_name", ""] },
                    ],
                  },
                },
              },
            },
          },
          student_name: {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ["$student_details.first_name", ""] },
                  " ",
                  { $ifNull: ["$student_details.last_name", ""] },
                ],
              },
            },
          },
          academic_year: "$academic_year.value",
          contact_number: {
            $cond: {
              if: { $eq: ["$other_details.parent_type", "Father"] },
              then: "$parent_details.father_details.mobile",
              else: "$parent_details.mother_details.mobile",
            },
          },
          appointment_date: {
            $cond: {
              if: {
                $gt: [{ $size: '$enquiryLogs' }, 0],
              },
              then: {
                $let: {
                  vars: {
                    scheduledSchoolTourLog: {
                      $filter: {
                        input: '$enquiryLogs',
                        as: 'log',
                        cond: {
                          $in: [
                            '$$log.event',
                            [
                              EEnquiryEvent.SCHOOL_TOUR_SCHEDULED,
                              EEnquiryEvent.SCHOOL_TOUR_RESCHEDULE,
                            ],
                          ],
                        },
                      },
                    },
                  },
                  in: {
                    $ifNull: [
                      {
                        $arrayElemAt: [
                          '$$scheduledSchoolTourLog.log_data.date',
                          0,
                        ],
                      },
                      null,
                    ],
                  },
                },
              },
              else: null,
            },
          },

          time_slot: {
            $let: {
              vars: {
                scheduledLogs: {
                  $filter: {
                    input: "$enquiryLogs",
                    as: "log",
                    cond: {
                      $in: [
                        "$$log.event",
                        [
                          "School tour scheduled",
                          EEnquiryEvent.SCHOOL_TOUR_RESCHEDULE,
                        ],
                      ],
                    },
                  },
                },
              },
              in: {
                $cond: {
                  if: { $gt: [{ $size: "$$scheduledLogs" }, 0] },
                  then: {
                    $let: {
                      vars: {
                        lastScheduledLog: { $arrayElemAt: ["$$scheduledLogs", -1] }
                      },
                      in: "$$lastScheduledLog.log_data.time"
                    }
                  },
                  else: null,
                },
              },
            },
          },
          appointment_scheduled_by: {
            $let: {
              vars: {
                scheduledLog: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$enquiryLogs",
                        as: "log",
                        cond: {
                          $in: [
                            "$$log.event",
                            [
                              EEnquiryEvent.SCHOOL_TOUR_SCHEDULED,
                              EEnquiryEvent.SCHOOL_TOUR_RESCHEDULE, // ✅ Added
                            ],
                          ],
                        },
                      },
                    },
                    -1, // ✅ Get the last scheduled/rescheduled log
                  ],
                },
              },
              in: {
                $cond: {
                  if: { $ne: ["$$scheduledLog", null] },
                  then: "$$scheduledLog.created_by",
                  else: null,
                },
              },
            },
          },
          appointment_assigned_to: "$assigned_to",
          enquiry_stages: "$enquiry_stages",
          appointment_status: {
            $let: {
              vars: {
                // Get the last event to determine current status
                lastEvent: {
                  $arrayElemAt: ["$enquiryLogs.event", -1]
                },
                hasScheduled: {
                  $anyElementTrue: {
                    $map: {
                      input: "$enquiryLogs",
                      as: "log",
                      in: {
                        $in: [
                          "$$log.event",
                          ["School tour scheduled", EEnquiryEvent.SCHOOL_TOUR_RESCHEDULE]
                        ]
                      },
                    },
                  },
                },
                hasCompleted: {
                  $anyElementTrue: {
                    $map: {
                      input: "$enquiryLogs",
                      as: "log",
                      in: { $eq: ["$$log.event", "School tour completed"] },
                    },
                  },
                },
              },
              in: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$$lastEvent", "School tour cancelled"] },
                      then: "Cancelled"
                    },
                    {
                      case: "$$hasCompleted",
                      then: "Met",
                    },
                    {
                      case: "$$hasScheduled",
                      then: "Booked",
                    },
                  ],
                  default: "Not Scheduled",
                },
              },
            },
          },
        },
      },
    ];

    const { start_date, end_date } = data;
    if (start_date && end_date) {
      const start = this.parseDate(start_date);
      const end = this.parseDate(end_date);
      pipeline.push(
        {
          $match: {
            $expr: {
              $and: [
                {
                  $gte: [
                    {
                      $dateFromString: {
                        dateString: "$appointment_date",
                        format: "%d-%m-%Y",
                        onError: null,
                        onNull: null
                      }
                    },
                    start
                  ]
                },
                {
                  $lte: [
                    {
                      $dateFromString: {
                        dateString: "$appointment_date",
                        format: "%d-%m-%Y",
                        onError: null,
                        onNull: null
                      }
                    },
                    end
                  ]
                }
              ]
            }
          }
        } as any
      );
    }
    const enquiryDetails = await this.enquiryRepository.aggregate(pipeline);


    if (!enquiryDetails.length) {
      throw new HttpException(
        'Enquiries not found for the provided academic year id',
        HttpStatus.NOT_FOUND,
      );
    }

    const schoolIds = [
      ...new Set(
        enquiryDetails
          .map((e: any) => e.school?.id || e.school_id || null)
          .filter(Boolean)
      ),
    ];

    const schoolDetails = await this.mdmService.postDataToAPI(
      MDM_API_URLS.SEARCH_SCHOOL,
      {
        operator: `school_id In (${schoolIds.toString()})`,
      },
    );

    const schoolClusterMap = {};
    schoolDetails?.data.schools?.forEach((school: any) => {
      schoolClusterMap[school.school_id] = school?.cluster_name || 'NA';
    });

    // Format the data for CSV
    const formattedEnquiries = enquiryDetails.map((e: any) => {
      // Date is already in DD-MM-YYYY format from the database
      // No need to format it again
      // const formattedAppointmentDate = e.appointment_date[0] || 'NA';
      const cluster = schoolClusterMap[e.school_id] || 'NA';

      return {
        'Cluster': cluster,
        'School': e.school ?? 'NA',
        'Enquiry No': e.enquiry_number ?? 'NA',
        'Enquiry Name': e.enquiry_name || 'NA',
        'Student Name': e.student_name || 'NA',
        'Academic Year': e.academic_year ?? 'NA',
        'Contact No': e.contact_number ?? 'NA',
        'Appointment Date': e.appointment_date,
        'Time Slot': e.time_slot ?? 'NA',
        'Appointment Scheduled By': e.appointment_scheduled_by ?? 'NA',
        'Appointment Assigned To': e.appointment_assigned_to ?? 'NA',
        'Enquiry Stage': this.enquiryHelper.getCurrentEnquiryStage(e?.enquiry_stages) ?? 'NA',
        'Appointment Status': e.appointment_status ?? 'NA'
      };
    });

    // CSV fields order
    const fields = [
      'Cluster',
      'School',
      'Enquiry No',
      'Enquiry Name',
      'Student Name',
      'Academic Year',
      'Contact No',
      'Appointment Date',
      'Time Slot',
      'Appointment Scheduled By',
      'Appointment Assigned To',
      'Enquiry Stage',
      'Appointment Status'
    ];

    const date = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
    });
    const [month, day, year] = date.split(',')[0].split('/');
    const filename = `Daily-Enquiry-Report-${day}-${month}-${year}-${date
      .split(',')[1]
      .trimStart()
      .split(' ')[0]
      .split(':')
      .join('')}`;

    const generatedCSV: any = await this.csvService.generateCsv(
      formattedEnquiries,
      fields,
      filename,
    );

    const file: Express.Multer.File =
      await this.fileService.createFileFromBuffer(
        Buffer.from(generatedCSV.csv),
        filename,
        'text/csv',
      );

    await this.setFileUploadStorage();
    const uploadedFileName = await this.storageService.uploadFile(
      file,
      filename,
    );

    const bucketName = this.configService.get<string>('BUCKET_NAME');

    if (!uploadedFileName) {
      throw new HttpException(
        'Something went wrong while uploading file!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const signedUrl = await this.storageService.getSignedUrl(
      bucketName,
      uploadedFileName,
      false,
    );

    return {
      url: signedUrl,
      fileName: uploadedFileName,
    };
  }

  //! source wise conversion report - SANJEEV MAJHI
  async sourceWiseConversionReport(data) {
    const {
      start_date,
      end_date,
      filter_by = 'All',
      group_by = ['cluster', 'school', 'grade', 'source', 'sub_source'],
    } = data;

    // Build match conditions
    const matchConditions: any = {};

    // Use moment for consistent date parsing
    const parsedStartDate = start_date
      ? moment(start_date, 'DD-MM-YYYY').toDate()
      : null;
    const parsedEndDate = end_date
      ? moment(end_date, 'DD-MM-YYYY').endOf('day').toDate()
      : null;

    // Only add date filter if both dates are provided
    if (parsedStartDate && parsedEndDate) {
      matchConditions.enquiry_date = {
        $gte: parsedStartDate,
        $lte: parsedEndDate,
      };
    }

    // Apply filter_by logic (CC Only, School Only, All)
    if (filter_by === 'CC Only') {
      matchConditions['enquiry_mode.value'] = {
        $in: [
          'Phone Call',
          'Phone Call (IVR) -Toll free',
          'Phone Call -School',
        ],
      };
    } else if (filter_by === 'School Only') {
      matchConditions['enquiry_mode.value'] = {
        $in: ['Walkin', 'Walkin (VMS)'],
      };
    }

    const pipeline: any[] = [
      // 1️⃣ MATCH FILTERS
      {
        $match: Object.keys(matchConditions).length > 0 ? matchConditions : {},
      },
      {
        $lookup: {
          from: 'enquiryLogs',
          localField: '_id',
          foreignField: 'enquiry_id',
          as: 'enquiryLogs',
          pipeline: [
            {
              $sort: {
                _id: -1,
              },
            },
          ],
        },
      },
      // 2️⃣ ADD COMPUTED FIELDS FOR STAGE TRACKING AND DATA STANDARDIZATION
      {
        $addFields: {
          // Standardize source - comprehensive normalization
          normalized_source: {
            $cond: [
              {
                $or: [
                  { $eq: ['$enquiry_source.value', null] },
                  { $eq: ['$enquiry_source.value', ''] },
                  { $eq: [{ $trim: { input: { $ifNull: ['$enquiry_source.value', ''] } } }, 'N/A'] },
                  { $eq: [{ $trim: { input: { $ifNull: ['$enquiry_source.value', ''] } } }, 'NA'] },
                  { $eq: [{ $trim: { input: { $ifNull: ['$enquiry_source.value', ''] } } }, ''] },
                ],
              },
              'NA',
              {
                $trim: {
                  input: {
                    // Step 1: Replace multiple spaces with single space
                    $replaceAll: {
                      input: {
                        $replaceAll: {
                          input: {
                            $replaceAll: {
                              input: {
                                // Step 2: Normalize spaces around forward slash (/ to /)
                                $replaceAll: {
                                  input: {
                                    $replaceAll: {
                                      input: {
                                        $replaceAll: {
                                          input: { $ifNull: ['$enquiry_source.value', 'NA'] },
                                          find: ' / ',
                                          replacement: '/',
                                        },
                                      },
                                      find: ' /',
                                      replacement: '/',
                                    },
                                  },
                                  find: '/ ',
                                  replacement: '/',
                                },
                              },
                              find: '   ',
                              replacement: ' ',
                            },
                          },
                          find: '  ',
                          replacement: ' ',
                        },
                      },
                      find: '  ',
                      replacement: ' ',
                    },
                  },
                },
              },
            ],
          },
          
          // Standardize sub-source - comprehensive normalization
          normalized_sub_source: {
            $cond: [
              {
                $or: [
                  { $eq: ['$enquiry_sub_source.value', null] },
                  { $eq: ['$enquiry_sub_source.value', ''] },
                  { $eq: [{ $trim: { input: { $ifNull: ['$enquiry_sub_source.value', ''] } } }, 'N/A'] },
                  { $eq: [{ $trim: { input: { $ifNull: ['$enquiry_sub_source.value', ''] } } }, 'NA'] },
                  { $eq: [{ $trim: { input: { $ifNull: ['$enquiry_sub_source.value', ''] } } }, ''] },
                ],
              },
              'NA',
              {
                $trim: {
                  input: {
                    // Step 1: Replace multiple spaces with single space
                    $replaceAll: {
                      input: {
                        $replaceAll: {
                          input: {
                            $replaceAll: {
                              input: {
                                // Step 2: Normalize spaces around forward slash (/ to /)
                                $replaceAll: {
                                  input: {
                                    $replaceAll: {
                                      input: {
                                        $replaceAll: {
                                          input: { $ifNull: ['$enquiry_sub_source.value', 'NA'] },
                                          find: ' / ',
                                          replacement: '/',
                                        },
                                      },
                                      find: ' /',
                                      replacement: '/',
                                    },
                                  },
                                  find: '/ ',
                                  replacement: '/',
                                },
                              },
                              find: '   ',
                              replacement: ' ',
                            },
                          },
                          find: '  ',
                          replacement: ' ',
                        },
                      },
                      find: '  ',
                      replacement: ' ',
                    },
                  },
                },
              },
            ],
          },
          
          // Standardize grade names (Grade 2 vs Grade II, etc.)
          normalized_grade: {
            $cond: [
              {
                $or: [
                  { $eq: ['$student_details.grade.value', null] },
                  { $eq: ['$student_details.grade.value', ''] },
                  { $eq: [{ $trim: { input: { $ifNull: ['$student_details.grade.value', ''] } } }, ''] },
                ],
              },
              'NA',
              {
                $trim: {
                  input: {
                    $replaceAll: {
                      input: {
                        $replaceAll: {
                          input: {
                            $replaceAll: {
                              input: {
                                $replaceAll: {
                                  input: {
                                    $replaceAll: {
                                      input: {
                                        $replaceAll: {
                                          input: {
                                            $replaceAll: {
                                              input: {
                                                $replaceAll: {
                                                  input: {
                                                    $replaceAll: {
                                                      input: {
                                                        $replaceAll: {
                                                          input: { $ifNull: ['$student_details.grade.value', 'NA'] },
                                                          find: 'Grade X',
                                                          replacement: 'Grade 10',
                                                        },
                                                      },
                                                      find: 'Grade IX',
                                                      replacement: 'Grade 9',
                                                    },
                                                  },
                                                  find: 'Grade VIII',
                                                  replacement: 'Grade 8',
                                                },
                                              },
                                              find: 'Grade VII',
                                              replacement: 'Grade 7',
                                            },
                                          },
                                          find: 'Grade VI',
                                          replacement: 'Grade 6',
                                        },
                                      },
                                      find: 'Grade V',
                                      replacement: 'Grade 5',
                                    },
                                  },
                                  find: 'Grade IV',
                                  replacement: 'Grade 4',
                                },
                              },
                              find: 'Grade III',
                              replacement: 'Grade 3',
                            },
                          },
                          find: 'Grade II',
                          replacement: 'Grade 2',
                        },
                      },
                      find: 'Grade I',
                      replacement: 'Grade 1',
                    },
                  },
                },
              },
            ],
          },
          
          // RL - Any enquiry that has at least started the enquiry process
          has_enquiry_stage: {
            $anyElementTrue: {
              $map: {
                input: '$enquiry_stages',
                as: 'stage',
                in: {
                  $and: [
                    { $eq: ['$$stage.stage_name', 'Enquiry'] },
                    {
                      $or: [
                        { $eq: ['$$stage.status', 'Completed'] },
                        { $eq: ['$$stage.status', 'In Progress'] },
                      ],
                    },
                  ],
                },
              },
            },
          },
          
          // Appointment - School visit stage in progress or completed
          has_appointment: {
            $anyElementTrue: {
              $map: {
                input: '$enquiry_stages',
                as: 'stage',
                in: {
                  $and: [
                    { $eq: ['$$stage.stage_name', 'School visit'] },
                    {
                      $or: [
                        { $eq: ['$$stage.status', 'Completed'] },
                        { $eq: ['$$stage.status', 'In Progress'] },
                      ],
                    },
                  ],
                },
              },
            },
          },
          
          // Walk-in - School visit OR Academic Kit Selling completed
          has_walkin: {
            $anyElementTrue: {
              $map: {
                input: '$enquiry_stages',
                as: 'stage',
                in: {
                  $and: [
                    {
                      $or: [
                        { $eq: ['$$stage.stage_name', 'School visit'] },
                        { $eq: ['$$stage.stage_name', 'Academic Kit Selling'] },
                      ],
                    },
                    { $eq: ['$$stage.status', 'Completed'] },
                  ],
                },
              },
            },
          },
          
          // Admission - Admitted or Provisional Approval stage
          has_admission_stage: {
            $anyElementTrue: {
              $map: {
                input: '$enquiry_stages',
                as: 'stage',
                in: {
                  $and: [
                    {
                      $eq: [
                        '$$stage.stage_name',
                        'Admitted or Provisional Approval',
                      ],
                    },
                    {
                      $or: [
                        { $eq: ['$$stage.status', 'Provisional Admission'] },
                        { $eq: ['$$stage.status', 'Admitted'] },
                      ],
                    },
                  ],
                },
              },
            },
          },
          
          // Get the most recent enquiry log status for Lead Close Status check
          latest_log_status: {
            $let: {
              vars: {
                closedLog: {
                  $filter: {
                    input: { $ifNull: ['$enquiryLogs', []] },
                    as: 'log',
                    cond: {
                      $and: [
                        { $eq: ['$$log.event', 'Enquiry closed'] },
                        { $ne: ['$$log.log_data.status', null] },
                        { $ne: ['$$log.log_data.status', ''] }
                      ]
                    },
                  },
                },
              },
              in: {
                $cond: {
                  if: { $gt: [{ $size: '$$closedLog' }, 0] },
                  then: {
                    $arrayElemAt: ['$$closedLog.log_data.status', 0],
                  },
                  else: null,
                },
              },
            },
          },
          
          // Check if student first name is missing or NA (including single character names like 'A')
          missing_first_name: {
            $or: [
              { $eq: ['$student_details.first_name', ''] },
              { $eq: ['$student_details.first_name', null] },
              { $eq: ['$student_details.first_name', 'NA'] },
              { $eq: ['$student_details.first_name', 'N/A'] },
              { $lte: [{ $strLenCP: { $ifNull: ['$student_details.first_name', ''] } }, 1] },
            ],
          },
          
          // Check if student last name is missing or NA (including placeholder names like 'AAA')
          missing_last_name: {
            $or: [
              { $eq: ['$student_details.last_name', ''] },
              { $eq: ['$student_details.last_name', null] },
              { $eq: ['$student_details.last_name', 'NA'] },
              { $eq: ['$student_details.last_name', 'N/A'] },
              { $eq: ['$student_details.last_name', 'AAA'] },
            ],
          },
        },
      },
      
      // 2.5️⃣ ADD FINAL RL and QL FLAGS
      {
        $addFields: {
          // RL = All enquiries that reached "Enquiry" stage
          is_rl: {
            $or: [
              {
                $eq: [
                  { $arrayElemAt: ['$enquiry_stages.status', 0] },
                  'In Progress',
                ],
              },
              {
                $eq: [
                  { $arrayElemAt: ['$enquiry_stages.status', 0] },
                  'Completed',
                ],
              },
            ],
          },
          
          // QL = RL MINUS exclusions based on Lead Close Status AND missing student names
          is_ql: {
            $and: [
              // Must be an RL
              {
                $or: [
                  {
                    $eq: [
                      { $arrayElemAt: ['$enquiry_stages.status', 0] },
                      'In Progress',
                    ],
                  },
                  {
                    $eq: [
                      { $arrayElemAt: ['$enquiry_stages.status', 0] },
                      'Completed',
                    ],
                  },
                ],
              },
              // Exclude based on Lead Close Status
              {
                $not: {
                  $in: [
                    '$latest_log_status',
                    ['Spam', 'Duplicate', 'Admission Denied'],
                  ],
                },
              },
              // Exclude if BOTH first name AND last name are missing/NA/invalid when status is Open
              {
                $not: {
                  $and: [
                    { $ne: ['$status', 'Closed'] },
                    '$missing_first_name',
                    '$missing_last_name',
                  ],
                },
              },
            ],
          },
        },
      },
      
      // 3️⃣ GROUP BY DIMENSIONS (Based on group_by array) - Using normalized fields
      {
        $group: {
          _id: this.buildGroupByExpressionNormalized(group_by),
          school_id: { $first: '$school_location.id' },
          
          // RL = All enquiries that reached "Enquiry" stage
          total_raw_leads: {
            $sum: { $cond: ['$is_rl', 1, 0] },
          },
          
          // QL = RL minus exclusions
          total_qualified_leads: {
            $sum: { $cond: ['$is_ql', 1, 0] },
          },
          
          // Appointment = School visit stage reached
          total_appointment: {
            $sum: { $cond: ['$has_appointment', 1, 0] },
          },
          
          // Walk-in = School visit OR Academic Kit Selling completed
          total_walkin: {
            $sum: { $cond: ['$has_walkin', 1, 0] },
          },
          
          // Admission
          total_admission: {
            $sum: { $cond: ['$has_admission_stage', 1, 0] },
          },
        },
      },
      
      // 4️⃣ PROJECT WITH CALCULATIONS
      {
        $project: {
          _id: 0,
          school_id: 1,
          school: { $ifNull: ['$_id.school', 'NA'] },
          grade: { $ifNull: ['$_id.grade', 'NA'] },
          source: { $ifNull: ['$_id.source', 'NA'] },
          sub_source: { $ifNull: ['$_id.sub_source', 'NA'] },
          
          // Metrics
          RL: '$total_raw_leads',
          QL: '$total_qualified_leads',
          Appt: '$total_appointment',
          Walkin: '$total_walkin',
          Admission: '$total_admission',
          
          // Conversion percentages (as decimals for proper Excel formatting)
          rl_to_ql_percent: {
            $cond: [
              { $gt: ['$total_raw_leads', 0] },
              {
                $divide: ['$total_qualified_leads', '$total_raw_leads'],
              },
              0,
            ],
          },
          ql_to_appt_percent: {
            $cond: [
              { $gt: ['$total_qualified_leads', 0] },
              {
                $divide: ['$total_appointment', '$total_qualified_leads'],
              },
              0,
            ],
          },
          appt_to_walkin_percent: {
            $cond: [
              { $gt: ['$total_appointment', 0] },
              {
                $divide: ['$total_walkin', '$total_appointment'],
              },
              0,
            ],
          },
          walkin_to_admission_percent: {
            $cond: [
              { $gt: ['$total_walkin', 0] },
              {
                $divide: ['$total_admission', '$total_walkin'],
              },
              null,
            ],
          },
          rl_to_walkin_percent: {
            $cond: [
              { $gt: ['$total_raw_leads', 0] },
              {
                $divide: ['$total_walkin', '$total_raw_leads'],
              },
              0,
            ],
          },
          rl_to_admission_percent: {
            $cond: [
              { $gt: ['$total_raw_leads', 0] },
              {
                $divide: ['$total_admission', '$total_raw_leads'],
              },
              0,
            ],
          },
          ql_to_walkin_percent: {
            $cond: [
              { $gt: ['$total_qualified_leads', 0] },
              {
                $divide: ['$total_walkin', '$total_qualified_leads'],
              },
              0,
            ],
          },
          ql_to_admission_percent: {
            $cond: [
              { $gt: ['$total_qualified_leads', 0] },
              {
                $divide: ['$total_admission', '$total_qualified_leads'],
              },
              0,
            ],
          },
        },
      },
      
      // 5️⃣ SORT (Dynamic based on group_by)
      {
        $sort: this.buildSortExpression(group_by),
      },
    ];

    console.log('pipeline--->', JSON.stringify(pipeline));
    const reportData = await this.enquiryRepository.aggregate(pipeline);
    console.log('reportData--->', reportData[0]);

    if (!reportData.length) {
      throw new HttpException(
        'No data found for the provided filters',
        HttpStatus.NOT_FOUND,
      );
    }

    const totals = {
      RL: reportData.reduce((sum, row) => sum + (row.RL || 0), 0),
      QL: reportData.reduce((sum, row) => sum + (row.QL || 0), 0),
      Appt: reportData.reduce((sum, row) => sum + (row.Appt || 0), 0),
      Walkin: reportData.reduce((sum, row) => sum + (row.Walkin || 0), 0),
      Admission: reportData.reduce((sum, row) => sum + (row.Admission || 0), 0),
    };

    const totalPercentages = {
      rl_to_ql: totals.RL > 0 ? (totals.QL / totals.RL) : 0,
      ql_to_appt: totals.QL > 0 ? (totals.Appt / totals.QL) : 0,
      appt_to_walkin: totals.Appt > 0 ? (totals.Walkin / totals.Appt) : 0,
      walkin_to_admission: totals.Walkin > 0 ? (totals.Admission / totals.Walkin) : null,
      rl_to_admission: totals.RL > 0 ? (totals.Admission / totals.RL) : 0,
      rl_to_walkin: totals.RL > 0 ? (totals.Walkin / totals.RL) : 0,
      ql_to_admission: totals.QL > 0 ? (totals.Admission / totals.QL) : 0,
      ql_to_walkin: totals.QL > 0 ? (totals.Walkin / totals.QL) : 0,
    };

    // Create the Total row
    const totalRow: any = {};
    
    // Add dimension columns based on group_by array
    if (group_by.includes('cluster')) {
      totalRow['Cluster'] = 'Total';
    }
    if (group_by.includes('school')) {
      totalRow['School'] = '';
    }
    if (group_by.includes('grade')) {
      totalRow['Grade'] = '';
    }
    if (group_by.includes('source')) {
      totalRow['Source'] = '';
    }
    if (group_by.includes('sub_source')) {
      totalRow['Sub-Source'] = '';
    }

    // Add total metrics
    totalRow['RL'] = totals.RL;
    totalRow['QL'] = totals.QL;
    totalRow['Appt'] = totals.Appt;
    totalRow['Walkin'] = totals.Walkin;
    totalRow['Admission'] = totals.Admission;

    // Add total conversion percentages (as decimals for proper % formatting in Excel)
    totalRow['RL to QL %'] = totalPercentages.rl_to_ql;
    totalRow['QL to Appt %'] = totalPercentages.ql_to_appt;
    totalRow['Appt to Walkin%'] = totalPercentages.appt_to_walkin;
    totalRow['Walkin to Admission %'] = totalPercentages.walkin_to_admission;
    totalRow['RL to Admission %'] = totalPercentages.rl_to_admission;
    totalRow['RL to Walkin%'] = totalPercentages.rl_to_walkin;
    totalRow['QL to Admission%'] = totalPercentages.ql_to_admission;
    totalRow['QL to Walkin%'] = totalPercentages.ql_to_walkin;

    // Fetch cluster information from MDM service if cluster is in group_by
    const schoolClusterMap = {};
    if (group_by.includes('cluster')) {
      const schoolIds = [
        ...new Set(reportData.map((e: any) => e.school_id).filter(Boolean)),
      ];
      if (schoolIds.length > 0) {
        try {
          const schoolDetails = await this.mdmService.postDataToAPI(
            MDM_API_URLS.SEARCH_SCHOOL,
            { operator: `school_id In (${schoolIds.toString()})` },
          );

          const mdmSchools: any[] = schoolDetails?.data?.schools ?? [];

          mdmSchools.forEach((school: any) => {
            schoolClusterMap[school.school_id] = school?.cluster_name || 'NA';
          });
        } catch (error) {
          console.error('Error fetching cluster data:', error);
        }
      }
    }

    // Format data for CSV based on visible columns (group_by)
    const formattedData = reportData.map((row: any) => {
      const formattedRow: any = {};
      
      // Add columns based on group_by array (these are the VISIBLE columns)
      if (group_by.includes('cluster')) {
        formattedRow['Cluster'] = schoolClusterMap[row.school_id] || 'NA';
      }
      if (group_by.includes('school')) {
        formattedRow['School'] = row.school || 'NA';
      }
      if (group_by.includes('grade')) {
        formattedRow['Grade'] = row.grade || 'NA';
      }
      if (group_by.includes('source')) {
        formattedRow['Source'] = row.source || 'NA';
      }
      if (group_by.includes('sub_source')) {
        formattedRow['Sub-Source'] = row.sub_source || 'NA';
      }

      // Add metrics (always visible)
      formattedRow['RL'] = row.RL || 0;
      formattedRow['QL'] = row.QL || 0;
      formattedRow['Appt'] = row.Appt || 0;
      formattedRow['Walkin'] = row.Walkin || 0;
      formattedRow['Admission'] = row.Admission || 0;

      // Add conversion percentages (as decimals for Excel % formatting)
      formattedRow['RL to QL %'] = row.rl_to_ql_percent || 0;
      formattedRow['QL to Appt %'] = row.ql_to_appt_percent || 0;
      formattedRow['Appt to Walkin%'] = row.appt_to_walkin_percent || 0;
      formattedRow['Walkin to Admission %'] = row.walkin_to_admission_percent;
      formattedRow['RL to Admission %'] = row.rl_to_admission_percent || 0;
      formattedRow['RL to Walkin%'] = row.rl_to_walkin_percent || 0;
      formattedRow['QL to Admission%'] = row.ql_to_admission_percent || 0;
      formattedRow['QL to Walkin%'] = row.ql_to_walkin_percent || 0;

      return formattedRow;
    });

    formattedData.unshift(totalRow);

    // Build CSV fields based on group_by (visible columns only)
    const fields = [];
    if (group_by.includes('cluster')) fields.push('Cluster');
    if (group_by.includes('school')) fields.push('School');
    if (group_by.includes('grade')) fields.push('Grade');
    if (group_by.includes('source')) fields.push('Source');
    if (group_by.includes('sub_source')) fields.push('Sub-Source');

    // Add metric fields (always visible)
    fields.push(
      'RL',
      'QL',
      'Appt',
      'Walkin',
      'Admission',
      'RL to QL %',
      'QL to Appt %',
      'Appt to Walkin%',
      'Walkin to Admission %',
      'RL to Admission %',
      'RL to Walkin%',
      'QL to Admission%',
      'QL to Walkin%',
    );

    // Generate filename with timestamp - Updated format: SourceWise-Conversion-Report
    const date = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
    });
    const [month, day, year] = date.split(',')[0].split('/');
    const timestamp = date
      .split(',')[1]
      .trimStart()
      .split(' ')[0]
      .split(':')
      .join('');
    const filename = `SourceWise-Conversion-Report-${day}-${month}-${year}-${timestamp}`;

    // Generate CSV with percentage formatting
    const generatedCSV: any = await this.csvService.generateCsvWithPercentages(
      formattedData,
      fields,
      filename,
      [
        'RL to QL %',
        'QL to Appt %',
        'Appt to Walkin%',
        'Walkin to Admission %',
        'RL to Admission %',
        'RL to Walkin%',
        'QL to Admission%',
        'QL to Walkin%',
      ]
    );

    // Create file from buffer
    const file: Express.Multer.File =
      await this.fileService.createFileFromBuffer(
        Buffer.from(generatedCSV.csv),
        filename,
        'text/csv',
      );

    // Upload to storage
    await this.setFileUploadStorage();
    const uploadedFileName = await this.storageService.uploadFile(
      file,
      filename,
    );
    const bucketName = this.configService.get<string>('BUCKET_NAME');

    if (!uploadedFileName) {
      throw new HttpException(
        'Something went wrong while uploading file!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Generate signed URL
    const signedUrl = await this.storageService.getSignedUrl(
      bucketName,
      uploadedFileName,
      false,
    );

    return {
      url: signedUrl,
      fileName: uploadedFileName,
      totalRecords: reportData.length,
      filters_applied: {
        date_range:
          start_date && end_date ? `${start_date} to ${end_date}` : 'All dates',
        filter_by,
        visible_columns: group_by,
      },
      summary: {
        total_rl: reportData.reduce((sum, row) => sum + (row.RL || 0), 0),
        total_ql: reportData.reduce((sum, row) => sum + (row.QL || 0), 0),
        total_appointments: reportData.reduce(
          (sum, row) => sum + (row.Appt || 0),
          0,
        ),
        total_admissions: reportData.reduce(
          (sum, row) => sum + (row.Admission || 0),
          0,
        ),
      },
    };
  }

  // Helper method to build normalized group by expression
  private buildGroupByExpressionNormalized(group_by: string[]) {
    const groupExpr: any = {};
    
    if (group_by.includes('cluster')) {
      groupExpr.cluster = '$school_location.cluster';
    }
    if (group_by.includes('school')) {
      groupExpr.school = '$school_location.value';
    }
    if (group_by.includes('grade')) {
      groupExpr.grade = '$normalized_grade'; // Use normalized grade
    }
    if (group_by.includes('source')) {
      groupExpr.source = '$normalized_source'; // Use normalized source
    }
    if (group_by.includes('sub_source')) {
      groupExpr.sub_source = '$normalized_sub_source'; // Use normalized sub_source
    }
    
    return groupExpr;
  }


  // Helper: Build dynamic group by expression
  private buildGroupByExpression(group_by: string[]) {
    const groupExpression: any = {};

    // Group by school if cluster or school is in group_by
    if (group_by.includes('cluster') || group_by.includes('school')) {
      groupExpression.school = "$school_location.value";
    }

    if (group_by.includes('grade')) {
      groupExpression.grade = "$student_details.grade.value";
    }

    if (group_by.includes('source')) {
      groupExpression.source = "$enquiry_source.value";
    }

    if (group_by.includes('sub_source')) {
      groupExpression.sub_source = "$enquiry_sub_source.value";
    }

    // If no grouping specified, default to school
    if (Object.keys(groupExpression).length === 0) {
      groupExpression.school = "$school_location.value";
    }

    return groupExpression;
  }

  // Helper: Build dynamic sort expression
  private buildSortExpression(group_by: string[]) {
    const sortExpression: any = {};

    if (group_by.includes('school')) sortExpression.school = 1;
    if (group_by.includes('grade')) sortExpression.grade = 1;
    if (group_by.includes('source')) sortExpression.source = 1;
    if (group_by.includes('sub_source')) sortExpression.sub_source = 1;

    // Default sort
    if (Object.keys(sortExpression).length === 0) {
      sortExpression.school = 1;
    }

    return sortExpression;
  }

  // report export To Csv for admission Enquiry
  async admissionEnquiryReport(jobId = null) {
    const pipeline = [
      {
        $lookup: {
          from: 'enquiryType',
          localField: 'enquiry_type_id',
          foreignField: '_id',
          as: 'enquiry_type_details',
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'admission',
          localField: '_id',
          foreignField: 'enquiry_id',
          as: 'admissionDetails',
        },
      },
      {
        $lookup: {
          from: 'followUps',
          localField: '_id',
          foreignField: 'enquiry_id',
          as: 'lastFollowUps',
          pipeline: [
            {
              $sort: {
                _id: -1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'enquiryLogs',
          localField: '_id',
          foreignField: 'enquiry_id',
          as: 'enquiryLogs',
          pipeline: [
            {
              $match: {
                event: {
                  $in: [
                    EEnquiryEvent.REGISTRATION_FEE_RECEIVED,
                    EEnquiryEvent.SCHOOL_TOUR_SCHEDULED,
                    EEnquiryEvent.SCHOOL_TOUR_RESCHEDULE,
                    EEnquiryEvent.SCHOOL_TOUR_COMPLETED,
                    EEnquiryEvent.COMPETENCY_TEST_SCHEDULED,
                    EEnquiryEvent.COMPETENCY_TEST_RESCHEDULED,
                    EEnquiryEvent.ADMISSION_APPROVED,
                    EEnquiryEvent.ENQUIRY_CLOSED,
                    EEnquiryEvent.ENQUIRY_REOPENED,
                  ],
                },
              },
            },
            {
              $sort: {
                _id: -1,
              },
            },
          ],
        },
      },

      // reopenLogs lookup (safe project to prefer created_by.user_name)
      {
        $lookup: {
          from: 'enquiryLogs',
          let: { enquiryId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$enquiry_id', '$$enquiryId'] } } },
            { $match: { event: EEnquiryEvent.ENQUIRY_REOPENED } },
            { $sort: { created_at: -1 } },
            { $limit: 1 },
            {
              $project: {
                _id: 0,
                reopened_at: '$created_at',
                // prefer created_by.user_name when available, otherwise fallback to created_by
                reopened_by: {
                  $ifNull: ['$created_by.user_name', '$created_by'],
                },
              },
            },
          ],
          as: 'reopenLogs',
        },
      },

      // addFields for reopen fields (safe usage with $ifNull)
      {
        $addFields: {
          lead_reopened: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ['$reopenLogs', []] } }, 0] },
              'Yes',
              'No',
            ],
          },
          reopen_date: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ['$reopenLogs', []] } }, 0] },
              {
                $dateToString: {
                  format: '%d-%m-%Y',
                  date: {
                    $arrayElemAt: [
                      { $ifNull: ['$reopenLogs.reopened_at', []] },
                      0,
                    ],
                  },
                },
              },
              'NA',
            ],
          },
          reopened_by: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ['$reopenLogs', []] } }, 0] },
              {
                $arrayElemAt: [{ $ifNull: ['$reopenLogs.reopened_by', []] }, 0],
              },
              'NA',
            ],
          },
        },
      },

      // nextFollowUpDate: use safe $size and safe $arrayElemAt
      {
        $addFields: {
          nextFollowUpDate: {
            $cond: {
              if: {
                $and: [
                  { $eq: ['$enquiry_mode.value', 'Digital (website)'] },
                  { $eq: [{ $size: { $ifNull: ['$lastFollowUps', []] } }, 0] },
                ],
              },
              then: '$created_at',
              else: {
                $cond: {
                  if: {
                    $gt: [{ $size: { $ifNull: ['$lastFollowUps', []] } }, 0],
                  },
                  then: {
                    $dateFromString: {
                      dateString: {
                        $arrayElemAt: [
                          { $ifNull: ['$lastFollowUps.date', []] },
                          0,
                        ],
                      },
                    },
                  },
                  else: null,
                },
              },
            },
          },
        },
      },

      // overdue and document_status (safe filter input)
      {
        $addFields: {
          overdue_days_of_follow_up: {
            $cond: {
              if: { $ne: ['$nextFollowUpDate', null] },
              then: {
                $max: [
                  {
                    $dateDiff: {
                      startDate: '$nextFollowUpDate',
                      endDate: '$$NOW',
                      unit: 'day',
                    },
                  },
                  0,
                ],
              },
              else: null,
            },
          },
          document_status: {
            $cond: {
              if: {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: { $ifNull: ['$documents', []] },
                        as: 'doc',
                        cond: {
                          $and: [
                            { $eq: ['$$doc.file', null] },
                            { $eq: ['$$doc.is_mandatory', 1] },
                          ],
                        },
                      },
                    },
                  },
                  0,
                ],
              },
              then: 'Pending',
              else: 'Submitted',
            },
          },
        },
      },

      // final project (with many $ifNull guards inside $let/$filter/$arrayElemAt)
      {
        $project: {
          _id: 1,
          school_name: '$school_location.value',
          school_id: '$school_location.id',
          enquiry_number: '$enquiry_number',
          enquiry_date: '$enquiry_date',
          student_first_name: '$student_details.first_name',
          student_last_name: '$student_details.last_name',
          enquiry_stages: 1,
          board: '$board.value',
          grade: '$student_details.grade.value',
          course: '$course.value',
          stream: '$stream.value',
          shift: '$shift.value',
          created_by: '$created_by.user_name',
          current_owner: '$assigned_to',
          enquiry_type: '$enquiry_type_details.name',
          enquiry_category: '$enquiry_category.value',
          academic_year: '$academic_year.value',
          sibling_details: '$sibling_details',
          enquiry_mode: '$enquiry_mode.value',
          enquiry_source_type: '$enquiry_source_type.value',
          enquiry_source: '$enquiry_source.value',
          enquiry_sub_source: '$enquiry_sub_source.value',
          school_location: '$school_location.value',
          parent_type: '$other_details.parent_type',
          created_at: '$created_at',
          school_tour_scheduled_date: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ['$enquiryLogs', []] } }, 0] },
              then: {
                $let: {
                  vars: {
                    scheduledSchoolTourLog: {
                      $filter: {
                        input: { $ifNull: ['$enquiryLogs', []] },
                        as: 'log',
                        cond: {
                          $in: [
                            '$$log.event',
                            [
                              EEnquiryEvent.SCHOOL_TOUR_SCHEDULED,
                              EEnquiryEvent.SCHOOL_TOUR_RESCHEDULE,
                            ],
                          ],
                        },
                      },
                    },
                  },
                  in: {
                    $ifNull: [
                      {
                        $arrayElemAt: [
                          {
                            $ifNull: [
                              '$$scheduledSchoolTourLog.log_data.date',
                              [],
                            ],
                          },
                          0,
                        ],
                      },
                      null,
                    ],
                  },
                },
              },
              else: null,
            },
          },
          // Replace the empty walkin_date: {} in your $project stage with this logic:
          walkin_date: {
            $let: {
              vars: {
                schoolTourLogs: {
                  $filter: {
                    input: { $ifNull: ['$enquiryLogs', []] },
                    as: 'log',
                    cond: {
                      $eq: ['$$log.event', 'School tour completed'],
                    },
                  },
                },
                kitSellingLogs: {
                  $filter: {
                    input: { $ifNull: ['$enquiryLogs', []] },
                    as: 'log',
                    cond: {
                      $eq: ['$$log.event', 'Registration fee received'],
                    },
                  },
                },
                enquiryCreatedLogs: {
                  $filter: {
                    input: { $ifNull: ['$enquiryLogs', []] },
                    as: 'log',
                    cond: {
                      $eq: ['$$log.event', 'Enquiry created'],
                    },
                  },
                },
              },
              in: {
                $cond: [
                  { $eq: ['$other_details.enquiry_type', 'readmission_10_11'] },
                  {
                    $cond: [
                      { $gt: [{ $size: '$$enquiryCreatedLogs' }, 0] },
                      {
                        $dateToString: {
                          format: '%d-%m-%Y',
                          date: {
                            $arrayElemAt: ['$$enquiryCreatedLogs.created_at', 0],
                          },
                        },
                      },
                      'NA',
                    ],
                  },
                  {
                    $cond: [
                      { $gt: [{ $size: '$$schoolTourLogs' }, 0] },
                      {
                        $dateToString: {
                          format: '%d-%m-%Y',
                          date: {
                            $arrayElemAt: ['$$schoolTourLogs.created_at', 0],
                          },
                        },
                      },
                      {
                        $cond: [
                          { $gt: [{ $size: '$$kitSellingLogs' }, 0] },
                          {
                            $dateToString: {
                              format: '%d-%m-%Y',
                              date: {
                                $arrayElemAt: ['$$kitSellingLogs.created_at', 0],
                              },
                            },
                          },
                          'NA',
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
          enquiry_status: {
            $cond: {
              if: { $eq: ['$status', EEnquiryStatus.ADMITTED] },
              then: EEnquiryStatus.CLOSED,
              else: '$status',
            },
          },

          enrolment_number: {
            $cond: {
              if: {
                $gt: [{ $size: { $ifNull: ['$admissionDetails', []] } }, 0],
              },
              then: {
                $let: {
                  vars: {
                    admissionRecordWithEnrolmentNumber: {
                      $filter: {
                        input: { $ifNull: ['$admissionDetails', []] },
                        as: 'record',
                        cond: {
                          $and: [
                            { $ne: ['$$record.enrolment_number', null] },
                            { $ne: ['$$record.student_id', null] },
                          ],
                        },
                      },
                    },
                  },
                  in: {
                    $cond: {
                      if: { $gt: ['$$admissionRecordWithEnrolmentNumber', 0] },
                      then: {
                        $arrayElemAt: [
                          {
                            $ifNull: [
                              '$$admissionRecordWithEnrolmentNumber.enrolment_number',
                              [],
                            ],
                          },
                          0,
                        ],
                      },
                      else: null,
                    },
                  },
                },
              },
              else: null,
            },
          },

          father_name: {
            $concat: [
              { $ifNull: ['$parent_details.father_details.first_name', ''] },
              ' ',
              { $ifNull: ['$parent_details.father_details.last_name', ''] },
            ],
          },
          mother_name: {
            $concat: [
              { $ifNull: ['$parent_details.mother_details.first_name', ''] },
              ' ',
              { $ifNull: ['$parent_details.mother_details.last_name', ''] },
            ],
          },
          father_mobile_number: '$parent_details.father_details.mobile',
          mother_mobile_number: '$parent_details.mother_details.mobile',
          father_email_id: '$parent_details.father_details.email',
          mother_email_id: '$parent_details.mother_details.email',

          enquirer_sso_details: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: ['$other_details.parent_type', EParentType.FATHER],
                  },
                  then: {
                    username: {
                      $ifNull: [
                        '$parent_details.father_details.sso_username',
                        null,
                      ],
                    },
                    password: {
                      $ifNull: [
                        '$parent_details.father_details.sso_password',
                        null,
                      ],
                    },
                  },
                },
                {
                  case: {
                    $eq: ['$other_details.parent_type', EParentType.MOTHER],
                  },
                  then: {
                    username: {
                      $ifNull: [
                        '$parent_details.mother_details.sso_username',
                        null,
                      ],
                    },
                    password: {
                      $ifNull: [
                        '$parent_details.mother_details.sso_password',
                        null,
                      ],
                    },
                  },
                },
                {
                  case: {
                    $eq: ['$other_details.parent_type', EParentType.GUARDIAN],
                  },
                  then: {
                    username: {
                      $ifNull: [
                        '$parent_details.guardian_details.sso_username',
                        null,
                      ],
                    },
                    password: {
                      $ifNull: [
                        '$parent_details.guardian_details.sso_password',
                        null,
                      ],
                    },
                  },
                },
              ],
              default: null,
            },
          },

          document_status: '$document_status',
          next_follow_up_at: '$next_follow_up_at',

          next_follow_up_date: {
            $cond: {
              if: { $ne: ['$nextFollowUpDate', null] },
              then: {
                $dateToString: {
                  format: '%d-%m-%Y',
                  date: '$nextFollowUpDate',
                },
              },
              else: null,
            },
          },

          next_follow_up_date_overdue_days: '$overdue_days_of_follow_up',

          admission_date: {
            $cond: {
              if: { $ifNull: ['$cancelled_admission_date', false] },
              then: {
                $dateToString: {
                  format: '%d-%m-%Y',
                  date: '$cancelled_admission_date',
                },
              },
              else: {
                $cond: {
                  if: {
                    $gt: [{ $size: { $ifNull: ['$admissionDetails', []] } }, 0],
                  },
                  then: {
                    $dateToString: {
                      format: '%d-%m-%Y',
                      date: {
                        $arrayElemAt: [
                          { $ifNull: ['$admissionDetails.admitted_at', []] },
                          0,
                        ],
                      },
                    },
                  },
                  else: null,
                },
              },
            },
          },

          date_of_registration: {
            $cond: {
              if: { $ne: ['$registered_at', null] },
              then: {
                $dateToString: {
                  format: '%d-%m-%Y',
                  date: '$registered_at',
                },
              },
              else: null,
            },
          },

          date_of_interaction: {
            $cond: {
              if: {
                $and: [
                  { $gt: [{ $size: { $ifNull: ['$enquiryLogs', []] } }, 0] },
                  {
                    $in: [
                      '$student_details.grade.value',
                      ['Playschool', 'Nursery', 'Jr.KG', 'Sr.KG'],
                    ],
                  },
                ],
              },
              then: {
                $let: {
                  vars: {
                    competencyTestLog: {
                      $filter: {
                        input: { $ifNull: ['$enquiryLogs', []] },
                        as: 'log',
                        cond: {
                          $in: [
                            '$$log.event',
                            [
                              EEnquiryEvent.COMPETENCY_TEST_SCHEDULED,
                              EEnquiryEvent.COMPETENCY_TEST_RESCHEDULED,
                            ],
                          ],
                        },
                      },
                    },
                  },
                  in: {
                    $arrayElemAt: [
                      { $ifNull: ['$$competencyTestLog.log_data.date', []] },
                      0,
                    ],
                  },
                },
              },
              else: null,
            },
          },

          competency_test_date: {
            $cond: {
              if: {
                $and: [
                  { $gt: [{ $size: { $ifNull: ['$enquiryLogs', []] } }, 0] },
                  {
                    $not: {
                      $in: [
                        '$student_details.grade.value',
                        ['Playschool', 'Nursery', 'Jr.KG', 'Sr.KG'],
                      ],
                    },
                  },
                ],
              },
              then: {
                $let: {
                  vars: {
                    competencyTestLog: {
                      $filter: {
                        input: { $ifNull: ['$enquiryLogs', []] },
                        as: 'log',
                        cond: {
                          $in: [
                            '$$log.event',
                            [
                              EEnquiryEvent.COMPETENCY_TEST_SCHEDULED,
                              EEnquiryEvent.COMPETENCY_TEST_RESCHEDULED,
                            ],
                          ],
                        },
                      },
                    },
                  },
                  in: {
                    $arrayElemAt: [
                      { $ifNull: ['$$competencyTestLog.log_data.date', []] },
                      0,
                    ],
                  },
                },
              },
              else: null,
            },
          },

          admission_approved_date: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ['$enquiryLogs', []] } }, 0] },
              then: {
                $let: {
                  vars: {
                    admissionApprovedLog: {
                      $filter: {
                        input: { $ifNull: ['$enquiryLogs', []] },
                        as: 'log',
                        cond: {
                          $eq: [
                            '$$log.event',
                            EEnquiryEvent.ADMISSION_APPROVED,
                          ],
                        },
                      },
                    },
                  },
                  in: {
                    $dateToString: {
                      format: '%d-%m-%Y',
                      date: {
                        $arrayElemAt: [
                          {
                            $ifNull: ['$$admissionApprovedLog.created_at', []],
                          },
                          0,
                        ],
                      },
                    },
                  },
                },
              },
              else: null,
            },
          },

          enquiry_closed_date: {
            $cond: {
              if: { $ifNull: ['$drop_date', false] },
              then: {
                $dateToString: {
                  format: '%d-%m-%Y',
                  date: {
                    $convert: {
                      input: '$drop_date',
                      to: 'date',
                      onError: null,
                      onNull: null,
                    },
                  },
                },
              },
              else: {
                $let: {
                  vars: {
                    enquiryClosedLog: {
                      $filter: {
                        input: { $ifNull: ['$enquiryLogs', []] },
                        as: 'log',
                        cond: {
                          $eq: ['$$log.event', EEnquiryEvent.ENQUIRY_CLOSED],
                        },
                      },
                    },
                  },
                  in: {
                    $cond: {
                      if: { $ifNull: ['$$enquiryClosedLog', false] },
                      then: {
                        $dateToString: {
                          format: '%d-%m-%Y',
                          date: {
                            $arrayElemAt: [
                              {
                                $ifNull: ['$$enquiryClosedLog.created_at', []],
                              },
                              0,
                            ],
                          },
                        },
                      },
                      else: null,
                    },
                  },
                },
              },
            },
          },

          enquiry_closed_remark: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ['$enquiryLogs', []] } }, 0] },
              then: {
                $let: {
                  vars: {
                    enquiryClosedLog: {
                      $filter: {
                        input: { $ifNull: ['$enquiryLogs', []] },
                        as: 'log',
                        cond: {
                          $eq: ['$$log.event', EEnquiryEvent.ENQUIRY_CLOSED],
                        },
                      },
                    },
                  },
                  in: {
                    $arrayElemAt: [
                      { $ifNull: ['$$enquiryClosedLog.log_data.message', []] },
                      0,
                    ],
                  },
                },
              },
              else: null,
            },
          },

          student_id: {
            $cond: {
              if: {
                $gt: [{ $size: { $ifNull: ['$admissionDetails', []] } }, 0],
              },
              then: {
                $arrayElemAt: [
                  { $ifNull: ['$admissionDetails.student_id', []] },
                  0,
                ],
              },
              else: null,
            },
          },

          kit_sold_date: {
            $cond: {
              if: { $ifNull: ['$kit_sold_date', false] },
              then: {
                $dateToString: {
                  format: '%d-%m-%Y',
                  date: {
                    $convert: {
                      input: '$kit_sold_date',
                      to: 'date',
                      onError: null,
                      onNull: null,
                    },
                  },
                },
              },
              else: {
                $let: {
                  vars: {
                    registrationFeeReceivedLog: {
                      $filter: {
                        input: { $ifNull: ['$enquiryLogs', []] },
                        as: 'log',
                        cond: {
                          $eq: ['$$log.event', 'Registration fee received'],
                        },
                      },
                    },
                  },
                  in: {
                    $cond: {
                      if: { $ifNull: ['$$registrationFeeReceivedLog', false] },
                      then: {
                        $dateToString: {
                          format: '%d-%m-%Y',
                          date: {
                            $arrayElemAt: [
                              {
                                $ifNull: [
                                  '$$registrationFeeReceivedLog.created_at',
                                  [],
                                ],
                              },
                              0,
                            ],
                          },
                        },
                      },
                      else: null,
                    },
                  },
                },
              },
            },
          },
          leadReopen_date: {
            $let: {
              vars: {
                leadReopenLog: {
                  $filter: {
                    input: { $ifNull: ['$enquiryLogs', []] },
                    as: 'log',
                    cond: {
                      $eq: ['$$log.event', 'Enquiry reopened'],
                    },
                  },
                },
              },
              in: {
                $cond: {
                  if: {
                    $gt: [{ $size: '$$leadReopenLog' }, 0],
                  },
                  then: {
                    $dateToString: {
                      format: '%d-%m-%Y',
                      date: {
                        $arrayElemAt: ['$$leadReopenLog.created_at', 0],
                      },
                    },
                  },
                  else: null,
                },
              },
            },
          },
          utm_source: '$other_details.utm_source',
          utm_medium: '$other_details.utm_medium',
          utm_campaign: '$other_details.utm_campaign',
          gcl_id: '$other_details.gcl_id',

          // expose reopen fields in projection
          lead_reopened: 1,
          reopen_date: 1,
          reopened_by: 1,
          reopen_log_data: {
            $let: {
              vars: {
                leadReopenLog: {
                  $filter: {
                    input: { $ifNull: ['$enquiryLogs', []] },
                    as: 'log',
                    cond: { $eq: ['$$log.event', 'Enquiry reopened'] },
                  },
                },
              },
              in: {
                $cond: {
                  if: { $gt: [{ $size: '$$leadReopenLog' }, 0] },
                  then: { $arrayElemAt: ['$$leadReopenLog.log_data', 0] },
                  else: null,
                },
              },
            },
          },
          createdAtFormatted: {
            $let: {
              vars: {
                parts: {
                  $dateToParts: {
                    date: '$created_at',
                    timezone: 'Asia/Kolkata',
                  },
                },
              },
              in: {
                $concat: [
                  {
                    $cond: [
                      { $lt: ['$$parts.day', 10] },
                      { $concat: ['0', { $toString: '$$parts.day' }] },
                      { $toString: '$$parts.day' },
                    ],
                  },
                  '-',
                  {
                    $cond: [
                      { $lt: ['$$parts.month', 10] },
                      { $concat: ['0', { $toString: '$$parts.month' }] },
                      { $toString: '$$parts.month' },
                    ],
                  },
                  '-',
                  { $toString: '$$parts.year' },
                  ' ',
                  {
                    $toString: {
                      $cond: [
                        { $eq: [{ $mod: ['$$parts.hour', 12] }, 0] },
                        12,
                        { $mod: ['$$parts.hour', 12] },
                      ],
                    },
                  },
                  ':',
                  {
                    $cond: [
                      { $lt: ['$$parts.minute', 10] },
                      { $concat: ['0', { $toString: '$$parts.minute' }] },
                      { $toString: '$$parts.minute' },
                    ],
                  },
                  ' ',
                  { $cond: [{ $lt: ['$$parts.hour', 12] }, 'AM', 'PM'] },
                ],
              },
            },
          },
          lead_close_status: {
            $let: {
              vars: {
                enquiryClosedLog: {
                  $filter: {
                    input: { $ifNull: ['$enquiryLogs', []] },
                    as: 'log',
                    cond: {
                      $eq: ['$$log.event', EEnquiryEvent.ENQUIRY_CLOSED],
                    },
                  },
                },
              },
              in: {
                $cond: {
                  if: { $gt: [{ $size: '$$enquiryClosedLog' }, 0] },
                  then: {
                    $arrayElemAt: ['$$enquiryClosedLog.log_data.status', 0],
                  },
                  else: null,
                },
              },
            },
          },
        },
      },
      {
        $sort: { created_at: -1 },
      },
    ];

    const enquiryDetails = await this.enquiryRepository.aggregate(pipeline);

    if (!enquiryDetails.length) {
      throw new HttpException(
        'Enquiries not found for the provided academic year id',
        HttpStatus.NOT_FOUND,
      );
    }

    const schoolIds = [];
    const enquiries = enquiryDetails.map((e: any) => {
      if (
        !schoolIds.includes(e.school_id) &&
        ![false, null, undefined, ''].includes(e.school_id)
      )
        schoolIds.push(e.school_id);

      let followUpdate = e?.next_follow_up_date;
      let followUpdateOverdueDays = e?.next_follow_up_date_overdue_days;
      if (!e?.next_follow_up && e?.next_follow_up_at) {
        if (typeof e?.next_follow_up_at === 'string') {
          followUpdate =
            e?.next_follow_up_at.split('T')?.length > 0
              ? e?.next_follow_up_at
                .split('T')[0]
                .split('-')
                .reverse()
                .join('-')
              : null;
        } else if (typeof e?.next_follow_up_at === 'object') {
          followUpdate =
            e?.next_follow_up_at.toISOString().split('T')?.length > 0
              ? e?.next_follow_up_at
                .toISOString()
                .split('T')[0]
                .split('-')
                .reverse()
                .join('-')
              : null;
        }
      }
      if (!e?.followUpdateOverdueDays && e?.next_follow_up_at) {
        const today = new Date();
        const inputDate =
          typeof e?.next_follow_up_at === 'string'
            ? new Date(e?.next_follow_up_at)
            : e?.next_follow_up_at;
        if (inputDate.getTime() < today.getTime()) {
          const diffInMs = today.getTime() - inputDate.getTime();
          const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
          followUpdateOverdueDays = diffInDays;
        } else {
          followUpdateOverdueDays = 0;
        }
      }

      return {
        'School Id': e?.school_id ?? 'NA',
        'Enquiry No': e?.enquiry_number ?? 'NA',
        'Lead Generation Date': moment(e.enquiry_date).format('DD-MM-YYYY'),
        'Student First Name': e?.student_first_name ?? 'NA',
        'Student Last Name': e?.student_last_name ?? 'NA',
        Board: e?.board ?? 'NA',
        Grade: e?.grade ?? 'NA',
        // Division: e?.division ?? 'NA',
        Course: e?.course ?? 'NA',
        Stream: e?.stream ?? 'NA',
        Shift: e?.shift ?? 'NA',
        // 'Mandatory Profile % Updated': 'NA',
        // 'Profile % Updated': 'NA',
        'Enquiry Initiator': e?.created_by ?? 'NA',
        'Current Owner': e?.current_owner ?? 'NA',
        'Enquiry For': e?.enquiry_type[0] ?? 'NA',
        'Enquiry for Academic Year': e?.academic_year ?? 'NA',
        'Mode of Contact': e?.enquiry_mode ?? 'NA',
        'Source Type': e?.enquiry_source_type ?? 'NA',
        'Enquiry Source': e?.enquiry_source ?? 'NA',
        'Enquiry Sub-Source': e?.enquiry_sub_source ?? 'NA',
        'Enquiry Status': e?.enquiry_status ?? 'NA',
        'Current Stage':
          this.enquiryHelper.getCurrentEnquiryStage(e?.enquiry_stages) ?? 'NA',
        'Enrolment Number': e?.enrolment_number ?? 'NA',
        'Student Id': e?.student_id ?? 'NA',
        'Father Name': e?.father_name ?? 'NA',
        'Father Mobile No': e?.father_mobile_number ?? 'NA',
        'Father Email Id': e?.father_email_id ?? 'NA',
        'Mother Name': e?.mother_name ?? 'NA',
        'Mother Mobile No': e?.mother_mobile_number ?? 'NA',
        'Mother Email Id': e?.mother_email_id ?? 'NA',
        'Enquirer SSO Username': e?.enquirer_sso_details?.username ?? 'NA',
        'Enquirer SSO Password': e?.enquirer_sso_details?.password ?? 'NA',
        'Date of Walkin': e?.walkin_date ?? 'NA',
        'Date of Discovery': e?.school_tour_scheduled_date ?? 'NA',
        'Kit Sold Date': e?.kit_sold_date ?? 'NA',
        'Lead Reopened date': e?.leadReopen_date ?? 'NA',
        'Date of Registration': e?.date_of_registration ?? 'NA',
        'Date of Interaction': e?.date_of_interaction ?? 'NA',
        'Date of Test': e?.competency_test_date ?? 'NA',
        'Date of Admission Offered': e?.admission_approved_date ?? 'NA',
        'Date of Admission ': e?.admission_date ?? 'NA',
        'Dropped date': e?.enquiry_closed_date ?? 'NA',
        'Reason of dropped': e?.enquiry_closed_remark ?? 'NA',
        'Next Follow up action': 'NA',
        'Next Follow up date': followUpdate ?? 'NA',
        'Next Follow up overdue days': followUpdateOverdueDays ?? 'NA',
        'Document Status': e?.document_status ?? 'NA',
        'UTM Source': e?.utm_source ?? 'NA',
        'UTM Medium': e?.utm_medium ?? 'NA',
        'UTM Campaign': e?.utm_campaign ?? 'NA',
        'GCL ID': e?.gcl_id ?? 'NA',
        // New fields
        'Lead Close Status': e?.lead_close_status ?? 'NA',
        'Lead Re-opened': e?.lead_reopened ?? 'No',
        'Re-open Date': e?.reopen_date ?? 'NA',
        'Re-opened By': e?.reopened_by ?? 'NA',
        'Re-open Reason': e?.reopen_log_data?.reopen_reason
          ? e.reopen_log_data.reopen_reason
          : (e?.reopen_log_data?.value ?? 'NA'),
        'Created At': e?.createdAtFormatted ?? 'NA',
      };
    });

    const schoolDetails = await this.mdmService.postDataToAPI(
      MDM_API_URLS.SEARCH_SCHOOL,
      {
        operator: `school_id In (${schoolIds.toString()})`,
      },
    );

    const schoolDataIds = schoolDetails.data.schools.map(
      (school) => school.school_id,
    );

    const updatedRecords = [];
    if (schoolDetails?.data?.schools?.length) {
      updatedRecords.push(
        ...enquiries.map((enquiry) => {
          const schoolData = schoolDetails.data.schools.find(
            (school) =>
              school.school_id === enquiry['School Id'] &&
              school.grade_name === enquiry.Grade,
          );
          const updatedRecord = {
            'Business Vertical': schoolData?.lob_p2_description ?? 'NA',
            'Business Sub Vertical': schoolData?.lob_p1_description ?? 'NA',
            'Business Sub Sub Vertical': schoolData?.lob_description ?? 'NA',
            Cluster: schoolData?.cluster_name ?? 'NA',
            ...enquiry,
          };
          delete enquiry['School Id'];
          return updatedRecord;
        }),
      );
    } else {
      updatedRecords.push(
        ...enquiries.map((enquiry) => {
          const updatedRecord = {
            'Business Vertical': 'NA',
            'Business Sub Vertical': 'NA',
            'Business Sub Sub Vertical': 'NA',
            Cluster: 'NA',
            ...enquiry,
          };
          delete enquiry['School Id'];
          return updatedRecord;
        }),
      );
    }

    const fields = [
      'Business Vertical',
      'Business Sub Vertical',
      'Business Sub Sub Vertical',
      'Cluster',
      'Enquiry No',
      'Lead Generation Date',
      'Student First Name',
      'Student Last Name',
      'Board',
      'Grade',
      // 'Division',
      'Course',
      'Stream',
      'Shift',
      // 'Mandatory Profile % Updated',
      // 'Profile % Updated',
      'Enquiry Initiator',
      'Current Owner',
      'Enquiry For',
      'Enquiry for Academic Year',
      'Mode of Contact',
      'Source Type',
      'Enquiry Source',
      'Enquiry Sub-Source',
      'Enquiry Status',
      'Current Stage',
      'Enrolment Number',
      'Student Id',
      'Father Name',
      'Father Mobile No',
      'Father Email Id',
      'Mother Name',
      'Mother Mobile No',
      'Mother Email Id',
      'Enquirer SSO Username',
      'Enquirer SSO Password',
      'Date of Walkin',
      'Date of Discovery',
      'Date of Registration',
      'Kit Sold Date',
      'Lead Reopened date',
      'Date of Interaction',
      'Date of Test',
      'Date of Admission Offered',
      'Date of Admission ',
      'Dropped date',
      'Reason of dropped',
      'Next Follow up action',
      'Next Follow up date',
      'Next Follow up overdue days',
      'Document Status',
      'UTM Source',
      'UTM Medium',
      'UTM Campaign',
      'GCL ID',
      // New columns,
      'Lead Close Status',
      'Lead Re-opened',
      'Re-open Date',
      'Re-opened By',
      'Re-open Reason',
      'Created At',
    ];

    const date = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
    });

    const [month, day, year] = date.split(',')[0].split('/');
    const filename = `Enquiry-to-Admission-${day}-${month}-${year}-${date
      .split(',')[1]
      .trimStart()
      .split(' ')[0]
      .split(':')
      .join('')}`;

    const generatedCSV: any = await this.csvService.generateCsv(
      updatedRecords,
      fields,
      filename,
    );

    const file: Express.Multer.File =
      await this.fileService.createFileFromBuffer(
        Buffer.from(generatedCSV.csv),
        filename,
        'text/csv',
      );

    await this.setFileUploadStorage();
    const uploadedFileName = await this.storageService.uploadFile(
      file,
      filename,
    );

    const bucketName = this.configService.get<string>('BUCKET_NAME');

    if (!uploadedFileName) {
      throw new HttpException(
        'Something went wrong while uploading file!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const signedUrl = await this.storageService.getSignedUrl(
      bucketName,
      uploadedFileName,
      false,
    );

    if (jobId) {
      await this.jobShadulerService.updateJob(jobId, {
        jobId: jobId,
        user: 'System',
        event: 'admission details report',
        jobData: {
          url: signedUrl,
          fileName: uploadedFileName,
        },
      });
    }

    return {
      url: signedUrl,
      fileName: uploadedFileName,
    };
  }

  async triggerTermsAndConditionEmail(enquiryId: string): Promise<void> {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );
    await this.emailService.setEnquiryDetails(enquiryDetails).sendNotification(
      EMAIL_TEMPLATE_SLUGS.TERMS_AND_CONDITIONS,
      {
        action_url: FRONTEND_STANDALONE_PAGES_URL.TERMS_AND_CONDITIONS(
          enquiryId,
          enquiryDetails.school_location.id,
        ),
      },
      [
        this.enquiryHelper.getEnquirerDetails(enquiryDetails, 'email')
          ?.email as string,
      ],
    );
    await this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
      'other_details.terms_and_conditions_email_sent': true,
    });
    return;
  }

  async addKitNumber(enquiryId: string, kitNumber: string): Promise<boolean> {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );
    if (!enquiryDetails) {
      throw new HttpException(
        'Enquiry details not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const { kit_number } = enquiryDetails;

    if (!kit_number) {
      await this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
        kit_number: kitNumber,
      });
      return true;
    }
    this.loggerService.log(`Kit number already exists`);
    return false;
  }

  async uploadFile(document: Express.Multer.File): Promise<{ path: string }> {
    await this.setFileUploadStorage();
    const uploadedFileName = await this.storageService.uploadFile(document);
    if (!uploadedFileName) {
      throw new HttpException(
        'Something went wrong while uploading file!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { path: uploadedFileName };
  }

  async getUploadedFileUrl({ path, isDownloadable }): Promise<{ url: string }> {
    const { bucketName } = await this.setFileUploadStorage();
    const uploadedFileUrl = await this.storageService.getSignedUrl(
      bucketName,
      path,
      isDownloadable,
    );
    if (!uploadedFileUrl) {
      throw new HttpException(
        'Something went wrong while getting file URL!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { url: uploadedFileUrl };
  }

  async handlePaymentDetails(paymentData: Record<string, any>, req: Request) {
    const { enquiry_id, payment_type } = paymentData;

    if (this.configService.get('NODE_ENV') === 'development') {
      await this.updatePaymentData(paymentData, req);
      return;
    }

    if (payment_type === EPaymentType.REGISTRATION) {
      await this.updatePaymentData(paymentData, req);
      return;
    } else if (
      payment_type === EPaymentType.ADMISSION ||
      payment_type === EPaymentType.CONSOLIDATED ||
      payment_type === EPaymentType.PSA ||
      payment_type === EPaymentType.KIDS_CLUB ||
      payment_type === EPaymentType.TRANSPORT
    ) {
      this.loggerService.log(
        `[AdmissionFee Queue][Publish][EnquiryId : ${enquiry_id}][Payload: ${JSON.stringify(paymentData)}]`,
      );
      await this.admissionFeeQueue.add('admissionFeePaymentDetails', {
        ...paymentData,
        url: req.url,
        headers: req.headers,
      });
      this.loggerService.log(
        `[AdmissionFee Queue][Publish][EnquiryId : ${enquiry_id}][Payload: ${JSON.stringify(paymentData)}][Data published]`,
      );
      return;
    }
    return;
  }

  async updateIvtEnquiryStatus(
    enquiryId: string,
    payload: UpdateIvtEnquiryStatusDto,
  ) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );
    const admissionDetails = await this.admissionRepository.getByEnquiryId(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException(
        'Enquiry details not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const checkProcessrequest = await this.mdmService.fetchDataFromAPI(`${MDM_API_URLS.PROCESS_REQUEST}?filters[student_id][$eq]=${payload?.student_id}&filters[request_type][$eq]=${'admission_10_11_request'}&filters[is_processed][$eq]=true`);

    const { enquiry_stages, documents, other_details, academic_year } = enquiryDetails;

    const admissionType = this.enquiryHelper.getAdmissionType(documents);
    enquiry_stages[enquiry_stages.length - 1].status = admissionType;

    if (other_details?.enquiry_type === EEnquiryType.ADMISSION_10_11) {
      if (admissionDetails?.draft_student_id && checkProcessrequest.length > 0) {
        await this.admissionRepository.updateByEnquiryId(
          new Types.ObjectId(enquiryId),
          {
            student_id: payload?.student_id
          },
        );
        await this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
          enquiry_stages: enquiry_stages,
        });
        const {
          subject_details,
          draft_student_id,
        } = await this.admissionRepository.getOne({
          enquiry_id: enquiryId,
        });
        this.loggerService.log(
          `Proceeding to call create student subject as student id is ${draft_student_id}`,
        );
        const year = academic_year?.value?.split('-')[1].trim();
        const studentId = payload?.student_id
        const submitStudentMappingDataPromises = [];
        subject_details.forEach((subject) => {
          submitStudentMappingDataPromises.push(
            this.mdmService.postDataToAPI(
              MDM_API_URLS.SUBMIT_SUBJECT_DETAILS,
              {
                data: {
                  subject_id: subject.subject_id,
                  student_id: studentId,
                  academic_year: year,
                  selected_on: moment(new Date()).format('YYYY-MM-DD'),
                  selected_for: `${+academic_year.value.split('-')[0] + 1}-01-01`,
                  grade_id: 11,
                },
              },
            ),
          );
        });
        return;
      }
      await Promise.all([
        this.admissionRepository.updateByEnquiryId(
          new Types.ObjectId(enquiryId),
          {
            draft_student_id: payload?.student_id,
            enrolment_number: payload?.enrolment_number,
            ...(payload?.gr_number ? { gr_number: payload?.gr_number } : {}),
          },
        )
      ]);
      return;
    }

    await Promise.all([
      this.admissionRepository.updateByEnquiryId(
        new Types.ObjectId(enquiryId),
        {
          student_id: payload?.student_id,
          enrolment_number: payload?.enrolment_number,
          ...(payload?.gr_number ? { gr_number: payload?.gr_number } : {}),
        },
      ),
      this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
        enquiry_stages: enquiry_stages,
      }),
    ]);
    return;
  }


  async getEnquirybyStudentId(payload: any) {
    const studentId = payload?.studentId;
    let requestType = payload?.requestType;
    const admissionDetail: any = await this.admissionRepository.getMany({ student_id: studentId });
    for (let i = 0; i < admissionDetail?.length; i++) {
      const enquirydata = await this.enquiryRepository.getById(new Types.ObjectId(admissionDetail[i]?.enquiry_id));
      if (requestType == enquirydata.other_details.enquiry_type) {
        return enquirydata;
      }
    }
    return 'no data';
  }

  // async handleDublicateEnquiry(req: any) {
  //   const requestBody = req.body?.data;
  //   this.loggerService.log(
  //     `Create enquiry API called with request body: ${JSON.stringify(requestBody)}`,
  //   );

  //   const {
  //     'student_details.first_name': firstName,
  //     'student_details.last_name': lastName,
  //     'student_details.dob': dob,
  //     'academic_year.id': academicYearId,
  //   } = requestBody;

  //   // Check for existing leads (plural now)
  //   const existingLeads = await this.findExistingLeads({
  //     firstName,
  //     lastName,
  //     dob
  //   });

  //   if (existingLeads?.length > 0) {
  //     // Filter all leads in the same academic year
  //     const digitalLeads = existingLeads.filter(
  //       (lead) => lead?.academic_year?.id == academicYearId,
  //     );

  //     if (digitalLeads.length > 0) {
  //       // Sort by enquiry_date (latest first)
  //       const sortedDigitalLeads = digitalLeads.sort(
  //         (a, b) =>
  //           new Date(b.enquiry_date).getTime() -
  //           new Date(a.enquiry_date).getTime(),
  //       );

  //       const latestLead = sortedDigitalLeads[0];
  //       const oldLeads = sortedDigitalLeads.slice(1);

  //       // Reopen only the latest lead
  //       await this.reopen(
  //         [latestLead._id.toString()],
  //         {
  //           reopen_reason: 'Auto-reopened due to new digital enquiry match',
  //           reopened_by: 'System',
  //         },
  //         req.ip,
  //       );

  //       // Close older digital leads with same name, dob, same academic year
  //       const leadsToClose = existingLeads.filter(
  //         (lead) =>
  //           lead._id.toString() !== latestLead._id.toString() && // exclude latest
  //           lead?.enquiry_mode?.id == 1 &&
  //           lead?.academic_year?.id == academicYearId &&
  //           lead?.name === latestLead.name &&
  //           lead?.dob === latestLead.dob,
  //       );

  //       for (const lead of leadsToClose) {
  //         await this.updateEnquiryStatus(
  //           lead._id,
  //           EEnquiryStatus.CLOSED,
  //           {
  //             close_reason:
  //               'Auto-closed because a newer matching digital enquiry exists',
  //             closed_by: 'system',
  //             closed_from_ip: req.ip,
  //           },
  //         );
  //       }

  //       // return this.responseService.sendResponse(
  //       //   res,
  //       //   HttpStatus.OK,
  //       //   latestLead,
  //       //   `Previous lead re-opened. Please prioritize follow-up. Enquiry no. - ${latestLead.enquiry_number}`,
  //       // );
  //     }

  //     // Handle different year leads separately
  //     const differentYearLeads = existingLeads.filter(
  //       (lead) => lead?.academic_year?.id != academicYearId,
  //     );

  //     if (differentYearLeads.length > 0) {
  //       for (const lead of differentYearLeads) {
  //         await this.updateEnquiryStatus(
  //           lead._id,
  //           EEnquiryStatus.CLOSED,
  //           {
  //             close_reason:
  //               'Auto-closed due to new enquiry in different academic year',
  //             closed_by: 'system',
  //             closed_from_ip: req.ip,
  //           },
  //         );
  //       }
  //     }
  //   }

  // }
  async checkReopenNeeded(requestBody: any) {

    const {
      'student_details.first_name': firstName,
      'student_details.last_name': lastName,
      'student_details.dob': dob,
      'academic_year.id': academicYearId,
      enquiry_type: enquiry_type,
    } = requestBody;

    let existingLeads = await this.findExistingLeads({
      firstName,
      lastName,
      dob,
      enquiry_type,
    });

    // 1. Check admitted
    let findStudentUrl;
    if (enquiry_type == 'readmission_10_11') {
      findStudentUrl = `?filters[first_name][$eqi]=${firstName}&filters[last_name][$eqi]=${lastName}&filters[dob]=${dob}&filters[status]=0`;
    } else {
      findStudentUrl = `?filters[first_name][$eqi]=${firstName}&filters[last_name][$eqi]=${lastName}&filters[dob]=${dob}`;
    }
    const mdmStudent = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.STUDENTS}/${findStudentUrl}`,
    );
    const checkIfAdmitted = existingLeads?.find(
      (lead) =>
        lead?.enquiry_stages?.[lead?.enquiry_stages.length - 1]?.status ===
        EEnquiryStageStatus?.PROVISIONAL_ADMISSION,
    );
    if (checkIfAdmitted || mdmStudent?.data?.length > 0) {
      const admissionData = await this.admissionRepository.getByEnquiryId(
        new Types.ObjectId(checkIfAdmitted?._id),
      );
      await Promise.all(
        existingLeads.slice(1).map((lead) =>
          this.enquiryRepository.updateById(new Types.ObjectId(lead._id), {
            status: EEnquiryStatus.CLOSED,
          }),
        ),
      );

      let message = '';
      switch (enquiry_type) {
        case EEnquiryType.ADMISSION_10_11:
          message = 'Unactive Vibgyor Student'
          break;
        case EEnquiryType.NEW_ADMISSION:
          message = 'Student already admitted'
          break;
        default:
          break;
      }

      return {
        message: message,
        data: [
          {
            id: admissionData?.enrolment_number || mdmStudent?.data[0]?.attributes?.crt_enr_on,
            url: `student-listing/student-detail-view/${admissionData?.student_id || mdmStudent?.data?.[0]?.id}`,
            status: 'Admitted',
          },
        ],
      };
    }
    if (!existingLeads?.length) {
      return;
    }

    const higherStageEnquiry = await this.enquiryHelper.getHighestStageEnquiry(existingLeads, academicYearId);

    // 2. Check for same academic year lead
    const checkSameAY = existingLeads.find(
      (lead) => lead?.academic_year?.id == academicYearId,
    );
    if (checkSameAY) {
      await Promise.all(
        existingLeads?.map((lead) => {
          if (lead._id.toString() === higherStageEnquiry?._id.toString()) {
            return; // skip this lead
          }
          if (lead?.status === EEnquiryStatus.OPEN) {
            return Promise.all([
              this.enquiryRepository.updateById(
                new Types.ObjectId(lead?._id),
                { status: EEnquiryStatus.CLOSED }
              ),
              this.enquiryLogService.createLog({
                enquiry_id: new Types.ObjectId(lead._id),
                event_type: EEnquiryEventType.ENQUIRY,
                event_sub_type: EEnquiryEventSubType.ENQUIRY_ACTION,
                event: EEnquiryEvent.ENQUIRY_CLOSED,
                log_data: {
                  status: 'Duplicate',
                  message: 'Duplicated enquiry found',
                },
                created_by: 'system',
                created_by_id: 0,
              }),
            ]);
          }
        })
      );
      if (higherStageEnquiry?.status === EEnquiryStatus.CLOSED) {
        await this.enquiryRepository.updateById(
          new Types.ObjectId(higherStageEnquiry._id),
          {
            status: EEnquiryStatus.OPEN,
          },
        );
        await this.enquiryLogService.createLog({
          enquiry_id: new Types.ObjectId(higherStageEnquiry._id),
          event_type: EEnquiryEventType.ENQUIRY,
          event_sub_type: EEnquiryEventSubType.ENQUIRY_ACTION,
          event: EEnquiryEvent.ENQUIRY_REOPENED,
          log_data: {
            status: 'Duplicate',
            message: 'Current enquiry ReOpend',
          },
          created_by: 'system',
          created_by_id: 0,
        });
      }

      existingLeads = await this.findExistingLeads({
        firstName,
        lastName,
        dob,
        enquiry_type,
      });
      let message = '';
      let enquiryNo = [];
      if (requestBody?.enquiry_id == higherStageEnquiry?._id) {
        existingLeads = existingLeads.filter((lead) => {
          return lead._id != requestBody.enquiry_id;
        });
        message = 'Duplicate Enquiry Found, Continue With New';
        enquiryNo = existingLeads
          .map((lead) => ({
            id: lead.enquiry_number,
            url: `enquiries/view/${lead._id}`,
            status: lead.status,
          }))
          .reverse();
      } else {
        message = 'Enquiry Already Exists';
        enquiryNo = [{
          id: higherStageEnquiry.enquiry_number,
          url: `enquiries/view/${higherStageEnquiry._id}`,
          status: 'Open',
        }]
      }
      return {
        message: message,
        data: enquiryNo,
      };
    } else {
      if (requestBody?.enquiry_id) {
        let lead = existingLeads?.find(lead => lead._id.toString() === requestBody?.enquiry_id?.toString());
        if (lead?.status === EEnquiryStatus.CLOSED) {
          await this.enquiryRepository.updateById(
            new Types.ObjectId(requestBody?.enquiry_id),
            {
              status: EEnquiryStatus.OPEN,
            },
          );
          await this.enquiryLogService.createLog({
            enquiry_id: new Types.ObjectId(requestBody._id),
            event_type: EEnquiryEventType.ENQUIRY,
            event_sub_type: EEnquiryEventSubType.ENQUIRY_ACTION,
            event: EEnquiryEvent.ENQUIRY_REOPENED,
            log_data: {
              status: 'Duplicate',
              message: 'Current enquiry ReOpend',
            },
            created_by: 'system',
            created_by_id: 0,
          });
        }
      }
      // if (!openLead) {return;}
      await Promise.all(
        existingLeads?.map((lead) => {
          if (lead._id.toString() === requestBody?.enquiry_id?.toString()) {
            return; // skip this lead
          }
          if (lead?.status === EEnquiryStatus.OPEN) {
            return Promise.all([
              this.enquiryRepository.updateById(
                new Types.ObjectId(lead?._id),
                { status: EEnquiryStatus.CLOSED }
              ),
              this.enquiryLogService.createLog({
                enquiry_id: new Types.ObjectId(lead._id),
                event_type: EEnquiryEventType.ENQUIRY,
                event_sub_type: EEnquiryEventSubType.ENQUIRY_ACTION,
                event: EEnquiryEvent.ENQUIRY_CLOSED,
                log_data: {
                  status: 'Duplicate',
                  message: 'Duplicated enquiry found',
                },
                created_by: 'system',
                created_by_id: 0,
              }),
            ]);
          }
        })
      );
      existingLeads = await this.findExistingLeads({
        firstName,
        lastName,
        dob,
        enquiry_type,
      });
      if (requestBody?.enquiry_id) {
        existingLeads = existingLeads.filter((lead) => {
          return lead._id != requestBody.enquiry_id;
        });
      }
      const enquiryNo = existingLeads
        .map((lead) => ({
          id: lead.enquiry_number,
          url: `enquiries/view/${lead._id}`,
          status: lead.status,
        }))
        .reverse();
      return {
        message: 'Duplicate Enquiry Found, Continue With New',
        data: enquiryNo,
      };
    }
  }
  //! Source Conversion Report - Abhishek
  async sourceWiseInquiryStatusReport_BA(filters: any = null): Promise<any[]> {
    // Build initial matchConditions if filters provided
    const matchConditions: any = {};

    if (filters) {
      const { start_date, end_date, filter_by } = filters;

      // Use moment for consistent date parsing (same as admissionEnquiryReport)
      const startDt = start_date ? moment(start_date, 'DD-MM-YYYY').toDate() : null;
      const endDt = end_date ? moment(end_date, 'DD-MM-YYYY').endOf('day').toDate() : null;

      // Attach Date filter
      if (startDt || endDt) {
        matchConditions.enquiry_date = {};
        if (startDt) matchConditions.enquiry_date.$gte = startDt;
        if (endDt) matchConditions.enquiry_date.$lte = endDt;
      }

      // Apply filter_by logic (CC Only, School Only, All)
      if (filter_by === 'CC Only') {
        matchConditions['enquiry_mode.value'] = {
          $in: ['Phone Call', 'Phone Call (IVR) -Toll free', 'Phone Call -School'],
        };
      } else if (filter_by === 'School Only') {
        matchConditions['enquiry_mode.value'] = {
          $in: ['Walkin', 'Walkin (VMS)'],
        };
      }

      // Helper to convert to numbers if possible, else keep strings
      const buildIn = (arr?: string[]) => {
        if (!arr || !arr.length) return null;
        const vals = arr.map((s) => {
          const n = Number(s);
          return Number.isNaN(n) ? s : n;
        });
        return Array.from(new Set(vals));
      };

      // Strict matching using fields present in your document sample
      if (filters.school && filters.school.length) {
        const v = buildIn(filters.school);
        matchConditions['school_location.id'] = { $in: v };
      }

      if (filters.course && filters.course.length) {
        const v = buildIn(filters.course);
        matchConditions['course.id'] = { $in: v };
      }

      if (filters.board && filters.board.length) {
        const v = buildIn(filters.board);
        matchConditions['board.id'] = { $in: v };
      }

      if (filters.grade && filters.grade.length) {
        const v = buildIn(filters.grade);
        matchConditions['student_details.grade.id'] = { $in: v };
      }

      if (filters.stream && filters.stream.length) {
        const v = buildIn(filters.stream);
        matchConditions['stream.id'] = { $in: v };
      }

      if (filters.source && filters.source.length) {
        const v = buildIn(filters.source);
        matchConditions['enquiry_source.id'] = { $in: v };
      }

      if (filters.subSource && filters.subSource.length) {
        const v = buildIn(filters.subSource);
        matchConditions['enquiry_sub_source.id'] = { $in: v };
      }
    }

    // Build aggregation pipeline (lookups + flags + grouping + percentage)
    const pipeline: any[] = [];

    // If matchConditions has keys, push $match stage as the first stage
    if (Object.keys(matchConditions).length) {
      pipeline.push({ $match: matchConditions });
    }

    pipeline.push(
      // Admission lookup
      {
        $lookup: {
          from: 'admission',
          localField: '_id',
          foreignField: 'enquiry_id',
          as: 'admissionDetails',
        },
      },

      // EnquiryLogs lookup - using comprehensive event filtering from admissionEnquiryReport
      {
        $lookup: {
          from: 'enquiryLogs',
          localField: '_id',
          foreignField: 'enquiry_id',
          as: 'enquiryLogs',
          pipeline: [
            {
              $match: {
                event: {
                  $in: [
                    EEnquiryEvent.REGISTRATION_FEE_RECEIVED,
                    EEnquiryEvent.SCHOOL_TOUR_SCHEDULED,
                    EEnquiryEvent.SCHOOL_TOUR_RESCHEDULE,
                    EEnquiryEvent.SCHOOL_TOUR_COMPLETED,
                    EEnquiryEvent.COMPETENCY_TEST_SCHEDULED,
                    EEnquiryEvent.COMPETENCY_TEST_RESCHEDULED,
                    EEnquiryEvent.ADMISSION_APPROVED,
                    EEnquiryEvent.ENQUIRY_CLOSED,
                    EEnquiryEvent.ENQUIRY_REOPENED,
                    EEnquiryEvent.ADMISSION_FEE_RECEIVED,
                    EEnquiryEvent.ADMISSION_COMPLETED,
                    EEnquiryEvent.REGISTRATION_DETAILS_RECIEVED,
                    EEnquiryEvent.PAYMENT_RECEIVED,
                  ],
                },
              },
            },
            {
              $sort: {
                _id: -1,
              },
            },
            {
              $project: {
                event: 1,
                created_at: 1,
                log_data: 1,
              },
            },
          ],
        },
      },

      // Enrichment flags + dimension fields with safe $ifNull guards
      {
        $addFields: {
          school_id: '$school_location.id',
          cluster: { $ifNull: ['$school_location.cluster_name', null] },
          school: { $ifNull: ['$school_location.value', 'NA'] },
          course: { $ifNull: ['$course.value', 'NA'] },
          board: { $ifNull: ['$board.value', 'NA'] },
          grade: { $ifNull: ['$student_details.grade.value', 'NA'] },
          stream: { $ifNull: ['$stream.value', 'NA'] },
          source: { $ifNull: ['$enquiry_source.value', 'NA'] },
          subSource: { $ifNull: ['$enquiry_sub_source.value', 'NA'] },

          // Status flags - using improved walkin detection logic from admissionEnquiryReport
          hasWalkin: {
            $cond: [
              {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: { $ifNull: ['$enquiryLogs', []] },
                        as: 'log',
                        cond: {
                          $in: [
                            '$$log.event',
                            [
                              EEnquiryEvent.SCHOOL_TOUR_COMPLETED,
                              EEnquiryEvent.REGISTRATION_FEE_RECEIVED,
                            ],
                          ],
                        },
                      },
                    },
                  },
                  0,
                ],
              },
              1,
              0,
            ],
          },

          hasKitSold: {
            $cond: [
              {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: { $ifNull: ['$enquiryLogs', []] },
                        as: 'log',
                        cond: {
                          $eq: ['$$log.event', EEnquiryEvent.REGISTRATION_FEE_RECEIVED],
                        },
                      },
                    },
                  },
                  0,
                ],
              },
              1,
              0,
            ],
          },

          hasRegistration: {
            $cond: [
              {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: { $ifNull: ['$enquiryLogs', []] },
                        as: 'log',
                        cond: {
                          $in: [
                            '$$log.event',
                            [
                              EEnquiryEvent.REGISTRATION_FEE_RECEIVED,
                              EEnquiryEvent.REGISTRATION_DETAILS_RECIEVED,
                              EEnquiryEvent.PAYMENT_RECEIVED,
                            ],
                          ],
                        },
                      },
                    },
                  },
                  0,
                ],
              },
              1,
              0,
            ],
          },

          hasAdmission: {
            $cond: [
              {
                $or: [
                  {
                    $gt: [{ $size: { $ifNull: ['$admissionDetails', []] } }, 0],
                  },
                  {
                    $gt: [
                      {
                        $size: {
                          $filter: {
                            input: { $ifNull: ['$enquiryLogs', []] },
                            as: 'log',
                            cond: {
                              $in: [
                                '$$log.event',
                                [
                                  EEnquiryEvent.ADMISSION_FEE_RECEIVED,
                                  EEnquiryEvent.ADMISSION_COMPLETED,
                                  EEnquiryEvent.ADMISSION_APPROVED,
                                ],
                              ],
                            },
                          },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
              1,
              0,
            ],
          },

          isClosed: {
            $cond: [{ $eq: ['$status', EEnquiryStatus.CLOSED] }, 1, 0],
          },
        },
      },

      // Group by visible dimensions
      {
        $group: {
          _id: {
            school_id: '$school_id',
            school: '$school',
            course: '$course',
            board: '$board',
            grade: '$grade',
            stream: '$stream',
            source: '$source',
            subSource: '$subSource',
          },
          totalInquiry: { $sum: 1 },
          totalClosedInquiries: { $sum: '$isClosed' },
          totalOpenInquiries: {
            $sum: { $cond: [{ $eq: ['$isClosed', 0] }, 1, 0] },
          },

          open_enquiry: {
            $sum: { $cond: [{ $eq: ['$isClosed', 0] }, 1, 0] },
          },
          open_walkin: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$isClosed', 0] }, { $eq: ['$hasWalkin', 1] }] },
                1,
                0,
              ],
            },
          },
          open_kit_sold: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$isClosed', 0] }, { $eq: ['$hasKitSold', 1] }] },
                1,
                0,
              ],
            },
          },
          open_registration: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isClosed', 0] },
                    { $eq: ['$hasRegistration', 1] },
                  ],
                },
                1,
                0,
              ],
            },
          },

          closed_enquiry: {
            $sum: { $cond: [{ $eq: ['$isClosed', 1] }, 1, 0] },
          },
          closed_walkin: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$isClosed', 1] }, { $eq: ['$hasWalkin', 1] }] },
                1,
                0,
              ],
            },
          },
          closed_kit_sold: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$isClosed', 1] }, { $eq: ['$hasKitSold', 1] }] },
                1,
                0,
              ],
            },
          },
          closed_registration: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isClosed', 1] },
                    { $eq: ['$hasRegistration', 1] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          closed_admission: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isClosed', 1] },
                    { $eq: ['$hasAdmission', 1] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },

      // Percentage calculation
      {
        $project: {
          _id: 0,
          school_id: '$_id.school_id',
          school: '$_id.school',
          course: '$_id.course',
          board: '$_id.board',
          grade: '$_id.grade',
          stream: '$_id.stream',
          source: '$_id.source',
          subSource: '$_id.subSource',
          totalInquiry: 1,

          open: {
            enquiry: '$open_enquiry',
            enquiry_pct: {
              $cond: [
                { $gt: ['$totalInquiry', 0] },
                {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$open_enquiry', '$totalInquiry'] },
                        100,
                      ],
                    },
                    2,
                  ],
                },
                0,
              ],
            },

            walkin: '$open_walkin',
            walkin_pct: {
              $cond: [
                { $gt: ['$totalInquiry', 0] },
                {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$open_walkin', '$totalInquiry'] },
                        100,
                      ],
                    },
                    2,
                  ],
                },
                0,
              ],
            },

            kit_sold: '$open_kit_sold',
            kit_sold_pct: {
              $cond: [
                { $gt: ['$totalInquiry', 0] },
                {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$open_kit_sold', '$totalInquiry'] },
                        100,
                      ],
                    },
                    2,
                  ],
                },
                0,
              ],
            },

            registration: '$open_registration',
            registration_pct: {
              $cond: [
                { $gt: ['$totalInquiry', 0] },
                {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$open_registration', '$totalInquiry'] },
                        100,
                      ],
                    },
                    2,
                  ],
                },
                0,
              ],
            },
          },

          closed: {
            enquiry: '$closed_enquiry',
            enquiry_pct: {
              $cond: [
                { $gt: ['$totalInquiry', 0] },
                {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$closed_enquiry', '$totalInquiry'] },
                        100,
                      ],
                    },
                    2,
                  ],
                },
                0,
              ],
            },

            walkin: '$closed_walkin',
            walkin_pct: {
              $cond: [
                { $gt: ['$totalInquiry', 0] },
                {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$closed_walkin', '$totalInquiry'] },
                        100,
                      ],
                    },
                    2,
                  ],
                },
                0,
              ],
            },

            kit_sold: '$closed_kit_sold',
            kit_sold_pct: {
              $cond: [
                { $gt: ['$totalInquiry', 0] },
                {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$closed_kit_sold', '$totalInquiry'] },
                        100,
                      ],
                    },
                    2,
                  ],
                },
                0,
              ],
            },

            registration: '$closed_registration',
            registration_pct: {
              $cond: [
                { $gt: ['$totalInquiry', 0] },
                {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$closed_registration', '$totalInquiry'] },
                        100,
                      ],
                    },
                    2,
                  ],
                },
                0,
              ],
            },

            admission: '$closed_admission',
            admission_pct: {
              $cond: [
                { $gt: ['$totalInquiry', 0] },
                {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$closed_admission', '$totalInquiry'] },
                        100,
                      ],
                    },
                    2,
                  ],
                },
                0,
              ],
            },
          },

          totalOpenInquiries: 1,
          totalClosedInquiries: 1,
        },
      },

      {
        $sort: {
          school: 1,
          course: 1,
          board: 1,
          grade: 1,
          stream: 1,
          source: 1,
          subSource: 1,
        },
      }
    );

    const aggRows = await this.enquiryRepository
      .aggregate(pipeline)
      .allowDiskUse(true);

    // Collect school IDs for MDM lookup
    const schoolIds = [
      ...new Set(aggRows.map((r) => String(r.school_id)).filter(Boolean)),
    ];

    // No MDM? return merged rows with cluster=NA (but still apply any non-cluster filters)
    if (!schoolIds.length) {
      let rowsWithCluster = aggRows.map((r) => ({ cluster: 'NA', ...r }));
      // If cluster filter was requested, nothing will match (because cluster NA) — return filtered result
      if (filters && filters.cluster && filters.cluster.length) {
        rowsWithCluster = rowsWithCluster.filter((rr) =>
          filters.cluster.includes(rr.cluster)
        );
      }
      return this.enquiryHelper.mergeVisibleRows(rowsWithCluster);
    }

    // Fetch MDM school metadata - using same pattern as admissionEnquiryReport
    const schoolDetails = await this.mdmService.postDataToAPI(
      MDM_API_URLS.SEARCH_SCHOOL,
      {
        operator: `school_id In (${schoolIds.toString()})`,
      }
    );

    const mdmSchools: any[] = schoolDetails?.data?.schools ?? [];

    // Attach cluster
    const finalRows = aggRows.map((r) => {
      let cluster = 'NA';

      const matched = mdmSchools.find((s) => {
        if (String(s.school_id) !== String(r.school_id)) return false;
        return true;
      });

      if (matched) {
        cluster = matched.cluster_name ?? 'NA';
      }

      return { cluster, ...r };
    });

    // If cluster[] filter exists, filter here (cluster is from MDM)
    let filteredByClusterRows = finalRows;
    if (filters && filters.cluster && filters.cluster.length) {
      const requested = filters.cluster.map((c: any) => String(c).trim());
      const requestedIds = new Set(
        requested.filter((r) => /^\d+$/.test(r)).map((r) => r)
      ); // "2", "10"
      const requestedNames = new Set(
        requested.filter((r) => !/^\d+$/.test(r)).map((r) => r.toLowerCase())
      ); // "cluster 1"

      // Collect school_ids from mdmSchools that belong to requested clusters
      const allowedSchoolIds = new Set<string>();

      mdmSchools.forEach((s: any) => {
        const schoolId = s.school_id ?? s.schoolId;
        if (!schoolId) return;

        // try common cluster shapes
        const clusterId = s.cluster_id ?? s.cluster?.id;
        const clusterName =
          s.cluster_name ?? s.cluster?.name ?? s.cluster?.cluster_name ?? null;

        if (
          clusterId !== undefined &&
          clusterId !== null &&
          requestedIds.has(String(clusterId))
        ) {
          allowedSchoolIds.add(String(schoolId));
          return;
        }

        if (clusterName && requestedNames.has(String(clusterName).toLowerCase())) {
          allowedSchoolIds.add(String(schoolId));
          return;
        }
      });

      if (allowedSchoolIds.size === 0) {
        console.log(
          'Cluster filter did not match any MDM schools. requested=',
          requested
        );
        filteredByClusterRows = [];
      } else {
        filteredByClusterRows = finalRows.filter((r) =>
          allowedSchoolIds.has(String(r.school_id))
        );
      }
    }

    // Merge identical visible rows
    return this.enquiryHelper.mergeVisibleRows(
      filteredByClusterRows,
      filters?.group_by
    );
  }

  async generateAndUploadSourceWiseInquiryStatusCsv(
    finalRows: any[],
  ): Promise<{ url: string; fileName: string }> {
    try {
      const mergedRows = this.enquiryHelper.mergeVisibleRows(finalRows);

      const formattedEnquiries = mergedRows.map((r) => ({
        Cluster: r.cluster ?? 'NA',
        School: r.school ?? 'NA',
        Course: r.course ?? 'NA',
        Board: r.board ?? 'NA',
        Grade: r.grade ?? 'NA',
        Stream: r.stream ?? 'NA',
        Source: r.source ?? 'NA',
        'Sub Source': r.subSource ?? 'NA',

        'Total Inquiry': r.totalInquiry ?? 0,

        'Open Enquiry value': r.open?.enquiry ?? 0,
        'Open Enquiry %': Number((r.open.enquiry_pct ?? 0).toFixed(2)),

        'Open Walkin value': r.open?.walkin ?? 0,
        'Open Walkin %': Number((r.open.walkin_pct ?? 0).toFixed(2)),

        'Open KitSold value': r.open?.kit_sold ?? 0,
        'Open KitSold %': Number((r.open.kit_sold_pct ?? 0).toFixed(2)),

        'Open Registration value': r.open?.registration ?? 0,
        'Open Registration %': Number((r.open.registration_pct ?? 0).toFixed(2)),


        'Close Enquiry value': r.closed?.enquiry ?? 0,
        'Close Enquiry %': Number((r.closed.enquiry_pct ?? 0).toFixed(2)),

        'Close Walkin value': r.closed?.walkin ?? 0,
        'Close Walkin %': Number((r.closed.walkin_pct ?? 0).toFixed(2)),

        'Close KitSold value': r.closed?.kit_sold ?? 0,
        'Close KitSold %': Number((r.closed.kit_sold_pct ?? 0).toFixed(2)),

        'Close Registration value': r.closed?.registration ?? 0,
        'Close Registration %': Number((r.closed.registration_pct ?? 0).toFixed(2)),

        'Close Admission value': r.closed?.admission ?? 0,
        'Close Admission %': Number((r.closed?.admission_pct ?? 0).toFixed(2)),

        'Total OpenInquiries': r.totalOpenInquiries ?? 0,
        'Total ClosedInquiries': r.totalClosedInquiries ?? 0,
      }));

      const fields: string[] = [
        'Cluster',
        'School',
        'Course',
        'Board',
        'Grade',
        'Stream',
        'Source',
        'Sub Source',
        'Total Inquiry',
        'Open Enquiry value',
        'Open Enquiry %',
        'Open Walkin value',
        'Open Walkin %',
        'Open KitSold value',
        'Open KitSold %',
        'Open Registration value',
        'Open Registration %',
        'Close Enquiry value',
        'Close Enquiry %',
        'Close Walkin value',
        'Close Walkin %',
        'Close KitSold value',
        'Close KitSold %',
        'Close Registration value',
        'Close Registration %',
        'Close Admission value',
        'Close Admission %',
        'Total OpenInquiries',
        'Total ClosedInquiries',
      ];

      const date = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const [month, day, year] = date.split(',')[0].split('/');
      const timePart = date.split(',')[1].trimStart().split(' ')[0].replace(/:/g, '');
      const filename = `sourceWiseInquiryStatusReport_BA-${day}-${month}-${year}-${timePart}.csv`;

      // generate CSV
      const generatedAny: any = await this.csvService.generateCsv(formattedEnquiries, fields, filename);

      // Support both shapes: string OR { csv: string }
      const csvContent: string =
        typeof generatedAny === 'string' ? generatedAny : (generatedAny && typeof generatedAny.csv === 'string' ? generatedAny.csv : '');

      if (!csvContent) {
        throw new Error('CSV generation failed or returned empty content.');
      }

      const file: Express.Multer.File = await this.fileService.createFileFromBuffer(
        Buffer.from(csvContent),
        filename,
        'text/csv',
      );

      await this.setFileUploadStorage();

      const uploadedFileName = await this.storageService.uploadFile(file, filename);
      if (!uploadedFileName) {
        throw new HttpException('File upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const bucketName = this.configService.get<string>('BUCKET_NAME');
      const signedUrl = await this.storageService.getSignedUrl(bucketName, uploadedFileName, false);

      return { url: signedUrl, fileName: uploadedFileName };
    } catch (err) {
      throw new HttpException(err?.message ?? 'Failed to generate/upload CSV', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getMetabaseStudentProfileDetails() {
    try {
      const METABASE_URL = process.env.METABASE_URL || 'https://metabase-backend-1032326496689.asia-south1.run.app';
      const username = process.env.METABASE_USERNAME || 'AmolAhirrao@winjit.com';
      const password = process.env.METABASE_PASSWORD || '0T707i0?QpmtH3';

      if (!username || !password) {
        throw new Error('Metabase credentials not configured in environment variables');
      }

      // 1. Login to get session token
      const loginResponse = await fetch(`${METABASE_URL}/api/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!loginResponse.ok) {
        throw new HttpException('Failed to authenticate with Metabase', HttpStatus.UNAUTHORIZED);
      }

      const loginData: any = await loginResponse.json();
      const sessionToken = loginData.id;

      // 2. Fetch question results
      const questionId = 86905;
      const queryResponse = await fetch(`${METABASE_URL}/api/card/${questionId}/query/json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Metabase-Session': sessionToken,
        },
        body: JSON.stringify({}),
      });

      if (!queryResponse.ok) {
        throw new HttpException('Failed to fetch data from Metabase', HttpStatus.BAD_GATEWAY);
      }

      const queryData: any = await queryResponse.json();

      // 3. Process data for XLSX
      const desiredOrder = [
        'Enrollment Number',
        'Enquiry Number',
        'Student Id',
        'Father Email',
        'Child Custody',
        'Father Mobile No',
        'Enquiry No',
        'Report Card (Previous Year)',
        'Current Address City',
        'Current Address Country',
        'Current Address Landmark',
        'Course',
        'Board',
        'Sub-Caste',
        'Grade',
        'School Leaving Certificate / Transfer Certificate / Bonafide Ce',
        'Mother Tongue',
        'Nationality',
        'Father First Name',
        'Gender',
        'Single Parent?',
        'Student First Name',
        'Father Last Name',
        'Aadhar card of Father',
        'Student Last Name',
        'Mother First Name',
        'Current Address State',
        'Aadhar card of Student',
        'Academic Year',
        'Current Address Street',
        'Mother Mobile No',
        'DOB',
        'Mother Email',
        'Caste',
        'Current Address Pincode',
        'Stream',
        'Current Address House',
        'Photocopy of Passport and Visa',
        'Birth certificate of Student',
        'Mother Last Name',
        'Student Aadhar Number',
        'Student Present Residential Proof',
        'Shift',
        'Aadhar card of Mother',
        'School Location'
      ];

      const headers = desiredOrder;
      const rows = queryData.map((obj) => desiredOrder.map((key) => obj[key] ?? ''));

      const excelData = [headers, ...rows];
       
       // Handle case where Metabase returns specific structure (data.cols, data.rows) or just array of objects
       // The /query/json usually returns just an array of objects key-value pairs.
       // If it was /query it might be different. based on "json" in url, it's likely array of objects.

      const buffer = xlsx.build([{ name: 'Student Profile Details', data: excelData, options: {} }]);

      // 4. Create File
      const timestamp = formatToTimeZone(new Date(), 'YYYY-MM-DD_HH-mm-ss', { timeZone: 'Asia/Kolkata' });
      const filename = `Student_Profile_Details_${timestamp}.csv`;

      const file: Express.Multer.File = await this.fileService.createFileFromBuffer(
        buffer,
        filename,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );

      // 5. Upload File
      await this.setFileUploadStorage();
      const uploadedFileName = await this.storageService.uploadFile(file, filename);

      if (!uploadedFileName) {
        throw new HttpException('File upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // 6. Get Signed URL
      const bucketName = this.configService.get<string>('BUCKET_NAME');
      const signedUrl = await this.storageService.getSignedUrl(bucketName, uploadedFileName, false);

      return { file_url: signedUrl, fileName: uploadedFileName };

    } catch (error) {
      console.error('Metabase Integration Error:', error.message);
      throw new HttpException(
        error.message || 'An error occurred interaction with Metabase',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMetabaseStudentProfileSummary() {
    try {
      const METABASE_URL = process.env.METABASE_URL || 'https://metabase-backend-1032326496689.asia-south1.run.app';
      const username = process.env.METABASE_USERNAME || 'AmolAhirrao@winjit.com';
      const password = process.env.METABASE_PASSWORD || '0T707i0?QpmtH3';

      if (!username || !password) {
        throw new Error('Metabase credentials not configured in environment variables');
      }

      // 1. Login to get session token
      const loginResponse = await fetch(`${METABASE_URL}/api/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!loginResponse.ok) {
        throw new HttpException('Failed to authenticate with Metabase', HttpStatus.UNAUTHORIZED);
      }

      const loginData: any = await loginResponse.json();
      const sessionToken = loginData.id;

      // 2. Fetch question results
      const questionId = 86907;
      const queryResponse = await fetch(`${METABASE_URL}/api/card/${questionId}/query/json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Metabase-Session': sessionToken,
        },
        body: JSON.stringify({}),
      });

      if (!queryResponse.ok) {
        throw new HttpException('Failed to fetch data from Metabase', HttpStatus.BAD_GATEWAY);
      }

      const queryData: any = await queryResponse.json();

      // 3. Process data for XLSX
       const desiredOrder = [
        'Cluster',
        'School Name',
        'Shift',
        'Course',
        'Board',
        'Grade',
        'Stream',
        'Division',
        'Student ID',
        'Global Parent IDs',
        'Student Full Name',
        'Student Profile Filled',
        'Student Profile Total Mandatory',
        'Student Profile Percentage',
        'Parent Profile Filled',
        'Parent Profile Total Mandatory',
        'Parent Profile Percentage',
        'Document Filled',
        'Document Total Mandatory',
        'Document Percentage',
        'Total Filled',
        'Total Mandatory',
        'Total Percentage',
        'Enrollment No'
      ];

      const headers = desiredOrder;
      const rows = queryData.map((obj) => desiredOrder.map((key) => obj[key] ?? ''));
      const excelData = [headers, ...rows];

      const buffer = xlsx.build([{ name: 'Student Profile Summary', data: excelData, options: {} }]);

      // 4. Create File
      const timestamp = formatToTimeZone(new Date(), 'YYYY-MM-DD_HH-mm-ss', { timeZone: 'Asia/Kolkata' });
      const filename = `Student_Profile_Summary_${timestamp}.csv`;

      const file: Express.Multer.File = await this.fileService.createFileFromBuffer(
        buffer,
        filename,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );

      // 5. Upload File
      await this.setFileUploadStorage();
      const uploadedFileName = await this.storageService.uploadFile(file, filename);

      if (!uploadedFileName) {
        throw new HttpException('File upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // 6. Get Signed URL
      const bucketName = this.configService.get<string>('BUCKET_NAME');
      const signedUrl = await this.storageService.getSignedUrl(bucketName, uploadedFileName, false);

      return { file_url: signedUrl, fileName: uploadedFileName };

    } catch (error) {
      console.error('Metabase Integration Error:', error.message);
      throw new HttpException(
        error.message || 'An error occurred interaction with Metabase',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMetabaseGrStudent(filters?: GrReportFilterDto) {
    try {
      const METABASE_URL = 'https://metabase-prod.ampersandgroup.in';
      const username = process.env.METABASE_USERNAME || 'AmolAhirrao@winjit.com';
      const password = process.env.METABASE_PASSWORD || '0T707i0?QpmtH3';

      if (!username || !password) {
        throw new Error('Metabase credentials not configured in environment variables');
      }

      // 1. Login to get session token
      console.log('=== Step 1: Authenticating with Metabase ===');
      const loginResponse = await fetch(`${METABASE_URL}/api/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!loginResponse.ok) {
        const loginError = await loginResponse.text();
        console.error('Login failed:', loginError);
        throw new HttpException('Failed to authenticate with Metabase', HttpStatus.UNAUTHORIZED);
      }

      const loginData: any = await loginResponse.json();
      const sessionToken = loginData.id;
      console.log('✓ Authentication successful');

      // 2. Build parameters for Metabase
      console.log('=== Step 2: Building Parameters ===');
      const questionId = 93836;
      const parameters = [];

      // ALL parameters now use Number variable format
      // This avoids Field Filter SQL alias issues

      if (filters?.school) {
        parameters.push({
          type: 'number',
          target: ['variable', ['template-tag', 'school']],
          value: Number(filters.school)
        });
        console.log('✓ Added school filter:', filters.school);
      }

      if (filters?.board) {
        parameters.push({
          type: 'number',
          target: ['variable', ['template-tag', 'board']],
          value: Number(filters.board)
        });
        console.log('✓ Added board filter:', filters.board);
      }

      if (filters?.course) {
        parameters.push({
          type: 'number',
          target: ['variable', ['template-tag', 'course']],
          value: Number(filters.course)
        });
        console.log('✓ Added course filter:', filters.course);
      }

      if (filters?.stream) {
        parameters.push({
          type: 'number',
          target: ['variable', ['template-tag', 'stream']],
          value: Number(filters.stream)
        });
        console.log('✓ Added stream filter:', filters.stream);
      }

      if (filters?.academic_year) {
        parameters.push({
          type: 'number',
          target: ['variable', ['template-tag', 'year']],
          value: Number(filters.academic_year)
        });
        console.log('✓ Added academic_year filter:', filters.academic_year);
      }

      // Grade - supports multiple values with IN clause
      if (filters?.grade?.length) {
        parameters.push({
          type: 'number',
          target: ['variable', ['template-tag', 'grade']],
          value: filters.grade.join(',')  // Send as "1,2,3" for IN clause
        });
        console.log('✓ Added grade filter:', filters.grade);
      }

      console.log('');
      console.log('=== Filter Summary ===');
      console.log('Total parameters:', parameters.length);
      console.log('Full parameters:', JSON.stringify(parameters, null, 2));

      // 3. Query Metabase
      console.log('');
      console.log('=== Step 3: Querying Metabase ===');
      console.log('Question ID:', questionId);

      const requestBody = { parameters };

      const queryResponse = await fetch(`${METABASE_URL}/api/card/${questionId}/query/json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Metabase-Session': sessionToken,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', queryResponse.status);
      console.log('Response headers:', Object.fromEntries(queryResponse.headers.entries()));

      if (!queryResponse.ok) {
        const errorText = await queryResponse.text();
        console.error('=== Metabase Query Error ===');
        console.error('Status:', queryResponse.status);
        console.error('Error:', errorText);

        try {
          const errorJson = JSON.parse(errorText);
          console.error('Error details:', JSON.stringify(errorJson, null, 2));
        } catch (e) {
          console.error('Raw error:', errorText);
        }

        throw new HttpException(
          `Metabase query failed: ${errorText.substring(0, 200)}`,
          HttpStatus.BAD_GATEWAY
        );
      }

      const rawResponse: any = await queryResponse.json();

      // Check if response contains an error (even with 200 status)
      if (rawResponse.status === 'failed' || rawResponse.error || rawResponse.error_type) {
        console.error('');
        console.error('=== METABASE QUERY EXECUTION ERROR ===');
        console.error('Error:', rawResponse.error);
        console.error('Error type:', rawResponse.error_type);
        console.error('Class:', rawResponse.class);

        throw new HttpException(
          `Metabase query execution failed: ${rawResponse.error || 'Unknown error'}`,
          HttpStatus.BAD_GATEWAY
        );
      }

      console.log('');
      console.log('=== RAW RESPONSE FROM METABASE ===');
      console.log('Response type:', typeof rawResponse);
      console.log('Is Array?:', Array.isArray(rawResponse));
      console.log('Response keys:', Object.keys(rawResponse || {}));

      let queryData: any[] = [];

      // Parse different response formats
      if (Array.isArray(rawResponse)) {
        queryData = rawResponse;
        console.log('✓ Using rawResponse directly (array)');
      } else if (rawResponse?.data?.cols && rawResponse?.data?.rows) {
        // Metabase format with cols/rows
        const cols = rawResponse.data.cols;
        const rows = rawResponse.data.rows;

        queryData = rows.map((row: any[]) => {
          const obj: any = {};
          cols.forEach((col: any, index: number) => {
            obj[col.display_name || col.name] = row[index];
          });
          return obj;
        });
        console.log('✓ Using rawResponse.data.cols/rows (transformed)');
      } else if (Array.isArray(rawResponse?.data)) {
        queryData = rawResponse.data;
        console.log('✓ Using rawResponse.data');
      } else if (Array.isArray(rawResponse?.rows)) {
        queryData = rawResponse.rows;
        console.log('✓ Using rawResponse.rows');
      } else {
        console.error('');
        console.error('=== UNEXPECTED RESPONSE FORMAT ===');
        console.error('Response type:', typeof rawResponse);
        console.error('Response is array?:', Array.isArray(rawResponse));
        console.error('Response keys:', Object.keys(rawResponse || {}));
        console.error('Response sample:', JSON.stringify(rawResponse, null, 2).substring(0, 2000));

        throw new HttpException(
          'Invalid response format from Metabase',
          HttpStatus.BAD_GATEWAY
        );
      }

      console.log('');
      console.log('=== Step 4: Query Results ===');
      console.log('✓ Query successful');
      console.log('Total records fetched:', queryData?.length || 0);

      // Verify filtering worked
      if (queryData && queryData.length > 0) {
        const uniqueGrades = [...new Set(queryData.map((r: any) => r['Student Grade']))];
        console.log('');
        console.log('=== FILTER VERIFICATION ===');
        console.log('Expected grades:', filters?.grade || 'ALL');
        console.log('Actual grades in results:', uniqueGrades);
      }

      if (!queryData || queryData.length === 0) {
        console.warn('⚠ No data found for filters:', filters);

        const emptyExcelData = [
          ['GR No', 'Student Full Name', 'Father Full Name', 'Mother Full Name', 'Caste',
          'Place of Birth', 'Nationality', 'Date of Birth', 'Last School Attended',
          'Joining Date', 'Student Grade', 'General Conduct', 'Date of Leaving',
          'Grade From Which Left', 'Reason for Leaving', 'Created Date', 'Academic Year'],
          ['No data found for the selected filters']
        ];

        const buffer = xlsx.build([{ name: 'GR Report', data: emptyExcelData, options: {} }]);
        const timestamp = formatToTimeZone(new Date(), 'YYYY-MM-DD_HH-mm-ss', { timeZone: 'Asia/Kolkata' });
        const filename = `GR_Report_No_Data_${timestamp}.xlsx`;

        const file: Express.Multer.File = await this.fileService.createFileFromBuffer(
          buffer,
          filename,
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );

        await this.setFileUploadStorage();
        const uploadedFileName = await this.storageService.uploadFile(file, filename);
        const bucketName = this.configService.get<string>('BUCKET_NAME');
        const signedUrl = await this.storageService.getSignedUrl(bucketName, uploadedFileName, false);

        return {
          url: signedUrl,
          file_url: signedUrl,
          fileName: uploadedFileName,
          recordCount: 0,
          message: 'No data found for the selected filters'
        };
      }

      // 5. Process data
      console.log('');
      console.log('=== Step 5: Processing Data ===');
      const columnOrder = [
        'GR No',
        'Student Full Name',
        'Father Full Name',
        'Mother Full Name',
        'Caste',
        'Place of Birth',
        'Nationality',
        'Date of Birth',
        'Last School Attended',
        'Joining Date',
        'Student Grade',
        'General Conduct',
        'Date of Leaving',
        'Grade From Which Left',
        'Reason for Leaving',
        'Created Date',
        'Academic Year'
      ];

      const rows = queryData.map((obj) => {
        return columnOrder.map(columnName => {
          const value = obj[columnName];
          if (columnName.includes('Date') && value) {
            try {
              return new Date(value).toLocaleDateString('en-GB');
            } catch {
              return value || '';
            }
          }
          return value || '';
        });
      });

      const excelData = [columnOrder, ...rows];
      const buffer = xlsx.build([{ name: 'GR Report', data: excelData, options: {} }]);

      // 6. Upload file
      console.log('=== Step 6: Uploading File ===');
      const timestamp = formatToTimeZone(new Date(), 'YYYY-MM-DD_HH-mm-ss', { timeZone: 'Asia/Kolkata' });
      const filename = `GR_Report_${timestamp}.xlsx`;

      const file: Express.Multer.File = await this.fileService.createFileFromBuffer(
        buffer,
        filename,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );

      await this.setFileUploadStorage();
      const uploadedFileName = await this.storageService.uploadFile(file, filename);

      if (!uploadedFileName) {
        throw new HttpException('File upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const bucketName = this.configService.get<string>('BUCKET_NAME');
      const signedUrl = await this.storageService.getSignedUrl(bucketName, uploadedFileName, false);

      console.log('');
      console.log('=== SUCCESS ===');
      console.log('✓ File uploaded:', uploadedFileName);
      console.log('✓ Total records:', queryData.length);
      console.log('✓ Filters applied:', parameters.length);

      return {
        url: signedUrl,
        file_url: signedUrl,
        fileName: uploadedFileName,
        recordCount: queryData.length,
        filtersApplied: parameters.length
      };

    } catch (error) {
      console.error('');
      console.error('=== FATAL ERROR ===');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      throw new HttpException(
        error.message || 'An error occurred interacting with Metabase',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async outsideTatFollowupReport(filters: any = null) {
    try {
        let roleFilter: any = null;

      if (filters) {
        const ccReCodesResp = getCcReHrisCodes();
        const ccCodes = ccReCodesResp?.CC || [];
        const reCodes = ccReCodesResp?.RE || [];

        const filterArray = Array.isArray(filters.filters) ? filters.filters : [];
        const isAllRequested = filterArray.includes('All');
        const isCcRequested = filterArray.includes('CC Only');
        const isSchoolRequested = filterArray.includes('School Only');


        if (!isAllRequested) {
          if (isCcRequested && isSchoolRequested) {
            // Pass both CC and RE codes
            const combinedCodes = [...ccCodes, ...reCodes];
            if (combinedCodes.length) {
              const globalUserIds = await this.getGlobalUserIdsByRoleCodes(combinedCodes);
              roleFilter = { assigned_to_id: { $in: globalUserIds } };
              if (!globalUserIds.length) {
                roleFilter = { assigned_to_id: { $in: [] } };
              }
            }
          } else if (isCcRequested) {
            // Only CC codes
            if (ccCodes.length) {
              const globalUserIds = await this.getGlobalUserIdsByRoleCodes(ccCodes);
              roleFilter = { assigned_to_id: { $in: globalUserIds } };
              if (!globalUserIds.length) {
                roleFilter = { assigned_to_id: { $in: [] } };
              }
            }
          } else if (isSchoolRequested) {
            // Outside CC codes
            if (ccCodes.length) {
              const globalUserIds = await this.getGlobalUserIdsByRoleCodes(ccCodes);
              if (globalUserIds.length) {
                roleFilter = { assigned_to_id: { $nin: globalUserIds } };
              }
            }
          }
        }
      }

      const pipeline =[
        {
          $match: {
            $and: [
              {
                status: "Open"
              },
              (roleFilter ? roleFilter : {})
            ]
          },
        },
        {
          $lookup: {
            from: 'followUps',
            localField: '_id',
            foreignField: 'enquiry_id',
            as: 'lastFollowUps',
            pipeline: [
              {
                $sort: {
                  _id: -1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            nextFollowUpDate: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ['$enquiry_mode.value', 'Digital (website)'] },
                    { $eq: [{ $size: { $ifNull: ['$lastFollowUps', []] } }, 0] },
                  ],
                },
                then: '$created_at',
                else: {
                  $cond: {
                    if: {
                      $gt: [{ $size: { $ifNull: ['$lastFollowUps', []] } }, 0],
                    },
                    then: {
                      $let: {
                        vars: {
                          dateValue: {
                            $arrayElemAt: [
                              { $ifNull: ['$lastFollowUps.date', []] },
                              0,
                            ],
                          },
                        },
                        in: {
                          $cond: {
                            if: {
                              $and: [
                                { $ne: ['$$dateValue', null] },
                                { $ne: ['$$dateValue', 'Invalid Date'] },
                                { $ne: [{ $type: '$$dateValue' }, 'date'] }, // If already a date, use it directly
                              ],
                            },
                            then: {
                              $dateFromString: {
                                dateString: '$$dateValue',
                                onError: null,
                                onNull: null,
                              },
                            },
                            else: {
                              $cond: {
                                if: { $eq: [{ $type: '$$dateValue' }, 'date'] },
                                then: '$$dateValue',
                                else: null,
                              },
                            },
                          },
                        },
                      },
                    },
                    else: null,
                  },
                },
              },
            },
          },
        },
        {
          $addFields: {
            last_follow_up_remarks: {
              $cond: {
                if: { $gt: [{ $size: { $ifNull: ['$lastFollowUps', []] } }, 0] },
                then: {
                  $arrayElemAt: [{ $ifNull: ['$lastFollowUps.remarks', []] }, 0],
                },
                else: 'NA',
              },
            },
          },
        },
        {
          $addFields: {
            enquirer_name: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$other_details.parent_type', 'Father'] },
                    then: {
                      $concat: [
                        {
                          $ifNull: [
                            '$parent_details.father_details.first_name',
                            '',
                          ],
                        },
                        ' ',
                        {
                          $ifNull: ['$parent_details.father_details.last_name', ''],
                        },
                      ],
                    },
                  },
                  {
                    case: { $eq: ['$other_details.parent_type', 'Mother'] },
                    then: {
                      $concat: [
                        {
                          $ifNull: [
                            '$parent_details.mother_details.first_name',
                            '',
                          ],
                        },
                        ' ',
                        {
                          $ifNull: ['$parent_details.mother_details.last_name', ''],
                        },
                      ],
                    },
                  },
                  {
                    case: { $eq: ['$other_details.parent_type', 'Guardian'] },
                    then: {
                      $concat: [
                        {
                          $ifNull: [
                            '$parent_details.guardian_details.first_name',
                            '',
                          ],
                        },
                        ' ',
                        {
                          $ifNull: [
                            '$parent_details.guardian_details.last_name',
                            '',
                          ],
                        },
                      ],
                    },
                  },
                ],
                default: null,
              },
            },
            contact_number: {
              $switch: {
                branches: [
                  {
                    case: {
                      $eq: ['$other_details.parent_type', EParentType.FATHER],
                    },
                    then: '$parent_details.father_details.mobile',
                  },
                  {
                    case: {
                      $eq: ['$other_details.parent_type', EParentType.MOTHER],
                    },
                    then: '$parent_details.mother_details.mobile',
                  },
                  {
                    case: {
                      $eq: ['$other_details.parent_type', EParentType.GUARDIAN],
                    },
                    then: '$parent_details.guardian_details.mobile',
                  },
                ],
                default: null,
              },
            },
          },
        },
        {
          $addFields: {
            overdue_days_of_follow_up: {
              $cond: {
                if: {
                  $ne: ['$nextFollowUpDate', null],
                },
                then: {
                  $max: [
                    {
                      $dateDiff: {
                        startDate: '$nextFollowUpDate',
                        endDate: '$$NOW',
                        unit: 'day',
                      },
                    },
                    0,
                  ],
                },
                else: null,
              },
            },
          },
        },
        {
          $match: {
            $expr: {
              $gt: ['$overdue_days_of_follow_up', 0],
            },
          },
        },
        {
          $project: {
            _id: 1,
            school_name: '$school_location.value',
            school_id: '$school_location.id',
            enquiry_number: '$enquiry_number',
            enquiry_date: '$created_at',
            student_first_name: '$student_details.first_name',
            student_last_name: '$student_details.last_name',
            enquiry_stages: 1,
            current_owner: '$assigned_to',
            academic_year: '$academic_year.value',
            created_at: '$created_at',
            enquiry_status: '$status',
            contact_number: 1,
            enquirer_name: 1,
            next_follow_up_at: '$next_follow_up_at',
            next_follow_up_date: {
              $cond: {
                if: {
                  $ne: ['$nextFollowUpDate', null],
                },
                then: {
                  $dateToString: {
                    format: '%d-%m-%Y',
                    date: '$nextFollowUpDate',
                  },
                },
                else: null,
              },
            },
            next_follow_up_date_overdue_days: '$overdue_days_of_follow_up',
          },
        },
        {
          $sort: { created_at: -1 },
        },
      ];

      const cursor = await this.enquiryRepository.aggregateCursor(pipeline);


      const schoolIdsSet = new Set<string>();
      const enquiries = [];
      let recordCount = 0;
      const BATCH_SIZE = 5000; // Larger batch size for efficiency

      // First pass: collect school IDs and transform data
      try {
        for await (const e of cursor) {
          recordCount++;

          if (e.school_id && ![false, null, undefined, ''].includes(e.school_id)) {
            schoolIdsSet.add(e.school_id);
          }

          // Calculate follow-up data
          let followUpdate = e?.next_follow_up_date;
          let followUpdateOverdueDays = e?.next_follow_up_date_overdue_days;

          if (!followUpdate && e?.next_follow_up_at) {
            const nextFollowUp = e.next_follow_up_at;
            if (typeof nextFollowUp === 'string') {
              const parts = nextFollowUp.split('T');
              followUpdate = parts.length > 0
                ? parts[0].split('-').reverse().join('-')
                : null;
            } else if (nextFollowUp instanceof Date) {
              const parts = nextFollowUp.toISOString().split('T');
              followUpdate = parts.length > 0
                ? parts[0].split('-').reverse().join('-')
                : null;
            }
          }

          if (followUpdateOverdueDays == null && e?.next_follow_up_at) {
            const today = new Date();
            const inputDate = typeof e.next_follow_up_at === 'string'
              ? new Date(e.next_follow_up_at)
              : e.next_follow_up_at;

            if (inputDate.getTime() < today.getTime()) {
              const diffInMs = today.getTime() - inputDate.getTime();
              followUpdateOverdueDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
            } else {
              followUpdateOverdueDays = 0;
            }
          }

          enquiries.push({
            school_id: e?.school_id,
            'Enquiry No': e?.enquiry_number ?? 'NA',
            'Lead Generation Date': moment(e.enquiry_date).format('DD-MM-YYYY'),
            'Student First Name': e?.student_first_name ?? '',
            'Student Last Name': e?.student_last_name ?? '',
            'Enquirer Name': e?.enquirer_name ?? 'NA',
            'Contact Number': e?.contact_number ?? 'NA',
            'Current Owner': e?.current_owner ?? 'NA',
            'Enquiry for Academic Year': e?.academic_year ?? 'NA',
            'Current Stage': this.enquiryHelper.getCurrentEnquiryStage(e?.enquiry_stages) ?? 'NA',
            'Next Follow up date': followUpdate ?? 'NA',
            'Next Follow up overdue days': followUpdateOverdueDays ?? 'NA',
            'Last Follow Up Remarks': e?.last_follow_up_remarks ?? 'NA',
          });
        }
      } catch (error) {
        console.error('Error processing cursor:', error);
        throw error;
      }


      if (!enquiries.length) {
        throw new HttpException(
          'Enquiries not found for the provided academic year id',
          HttpStatus.NOT_FOUND,
        );
      }

      // Fetch school details
      console.log('Fetching school details...');
      const schoolIds = Array.from(schoolIdsSet);

      // If too many school IDs, batch the API calls
      const schoolDetailsMap = new Map();
      const SCHOOL_API_BATCH = 1000;

      for (let i = 0; i < schoolIds.length; i += SCHOOL_API_BATCH) {
        const batchIds = schoolIds.slice(i, i + SCHOOL_API_BATCH);
        console.log(`Fetching school batch ${Math.floor(i / SCHOOL_API_BATCH) + 1}...`);

        const schoolDetails = await this.mdmService.postDataToAPI(
          MDM_API_URLS.SEARCH_SCHOOL,
          {
            operator: `school_id In (${batchIds.toString()})`,
          },
        );

        // Build lookup map
        if (schoolDetails?.data?.schools?.length) {
          for (const school of schoolDetails.data.schools) {
            const key = `${school.school_id}`;
            schoolDetailsMap.set(key, school);
          }
        }
      }

      // Process and merge in chunks to avoid memory issues
      const updatedRecords = [];
      const PROCESSING_BATCH = 10000;

      for (let i = 0; i < enquiries.length; i += PROCESSING_BATCH) {
        if (i % 50000 === 0) {
          console.log(`Merging progress: ${i}/${enquiries.length}`);
        }

        const batch = enquiries.slice(i, i + PROCESSING_BATCH);

        for (const enquiry of batch) {
          const schoolKey = `${enquiry.school_id}`;
          const schoolData = schoolDetailsMap.get(schoolKey);

          const updatedRecord = {
            Cluster: schoolData?.cluster_name ?? 'NA',
            School: schoolData?.lob_description ?? 'NA',
            'Enquiry Number': enquiry['Enquiry No'],
            'Enquiry Date': enquiry['Lead Generation Date'],
            'Enquiry Stage': enquiry['Current Stage'],
            'Current Lead Owner': enquiry['Current Owner'],
            'Follow Up Date': enquiry['Next Follow up date'],
            'Ageing In Days': enquiry['Next Follow up overdue days'],
            'Enquirer Name': enquiry['Enquirer Name'],
            'Student Name': enquiry['Student First Name'] + ' ' + enquiry['Student Last Name'],
            'Academic Year': enquiry['Enquiry for Academic Year'],
            'Contact No.': enquiry['Contact Number']
          };

          updatedRecords.push(updatedRecord);
        }

        // Periodically allow garbage collection
        if (i % 50000 === 0 && global.gc) {
          global.gc();
        }
      }

      const fields = [
        'Cluster',
        'School',
        'Enquiry Number',
        'Enquirer Name',
        'Student Name',
        'Academic Year',
        'Contact No.',
        'Enquiry Date',
        'Enquiry Stage',
        'Current Lead Owner',
        'Follow Up Date',
        'Ageing In Days'
      ];

      const date = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
      });
      const [month, day, year] = date.split(',')[0].split('/');
      const filename = `OutsideTATFollowupReport-${day}-${month}-${year}-${date
        .split(',')[1]
        .trimStart()
        .split(' ')[0]
        .split(':')
        .join('')}`;

      const generatedCSV: any = await this.csvService.generateCsv(
        updatedRecords,
        fields,
        filename,
      );


      const file: Express.Multer.File =
        await this.fileService.createFileFromBuffer(
          Buffer.from(generatedCSV.csv),
          filename,
          'text/csv',
        );

      await this.setFileUploadStorage();
      const uploadedFileName = await this.storageService.uploadFile(
        file,
        filename,
      );

      const bucketName = this.configService.get<string>('BUCKET_NAME');

      if (!uploadedFileName) {
        throw new HttpException(
          'Something went wrong while uploading file!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const signedUrl = await this.storageService.getSignedUrl(
        bucketName,
        uploadedFileName,
        false,
      );

      return {
        url: signedUrl,
        fileName: uploadedFileName,
      };
    } catch (err) {
      throw new HttpException(err?.message ?? 'Failed to generate/upload CSV', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async getGlobalUserIdsByRoleCodes(roleCodes: string[]): Promise<number[]> {
    if (!roleCodes.length) return [];

    const queryParams: any[][] = [];

    roleCodes.forEach((code, index) => {
      queryParams.push([
        `filters[hr_hris_unique_role][HRIS_Unique_Role_Code][$in][${index}]`,
        code,
      ]);
    });

    const employeeResp = await this.mdmService.fetchDataFromAPI(
      MDM_API_URLS.HR_EMPLOYEE_MASTER,
      queryParams,
    );

    // Handle both { data: [...] } (Strapi) and direct [...] responses
    const rawData = Array.isArray(employeeResp)
      ? employeeResp
      : employeeResp?.data || [];

    return rawData
      .map((emp: any) => Number(emp.id))
      .filter((id: number) => !isNaN(id));
  }


async generateAndUploadOutsideTatFollowupReportCsv(
    finalRows: any[],
  ): Promise<{ url: string; fileName: string }> {
    try {
      // const mergedRows = this.enquiryHelper.mergeVisibleRows(finalRows);

      const formattedEnquiries = finalRows.map((r) => ({
        Cluster: r.cluster ?? 'NA',
        School: r.school_name ?? 'NA',
        'Enquiry Number': r.enquiry_number ?? 'NA',
        'Enquiry Date': r.enquiry_date ?? 'NA',
        'Enquiry Stage': r.enquiry_stage ?? 'NA',
        'Current Lead Owner': r.current_lead_owner ?? 'NA',
        'Follow Up Date': r.follow_up_date ?? 'NA',
        'Ageing In Days': r.ageing_in_days ?? 'NA',
        'Enquirer Name': r.enquirer_name ?? 'NA',
        'Student Name': r.student_name ?? 'NA',
        'Academic Year': r.academic_year ?? 'NA',
        'Contact No.': r.contact_number ?? 'NA'
      }));

      const fields: string[] = [
        'Cluster',
        'School',
        'Enquiry Number',
        'Enquirer Name',
        'Student Name',
        'Academic Year',
        'Contact No.',
        'Enquiry Date',
        'Enquiry Stage',
        'Current Lead Owner',
        'Follow Up Date',
        'Ageing In Days'
      ];

      const date = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const [month, day, year] = date.split(',')[0].split('/');
      const timePart = date.split(',')[1].trimStart().split(' ')[0].replace(/:/g, '');
      const filename = `OutsideTATFollowupReport-${day}-${month}-${year}-${timePart}.csv`;

      // generate CSV
      const generatedAny: any = await this.csvService.generateCsv(formattedEnquiries, fields, filename);

      // Support both shapes: string OR { csv: string }
      const csvContent: string =
        typeof generatedAny === 'string' ? generatedAny : (generatedAny && typeof generatedAny.csv === 'string' ? generatedAny.csv : '');

      if (!csvContent) {
        throw new Error('CSV generation failed or returned empty content.');
      }

      const file: Express.Multer.File = await this.fileService.createFileFromBuffer(
        Buffer.from(csvContent),
        filename,
        'text/csv',
      );

      await this.setFileUploadStorage();

      const uploadedFileName = await this.storageService.uploadFile(file, filename);
      if (!uploadedFileName) {
        throw new HttpException('File upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const bucketName = this.configService.get<string>('BUCKET_NAME');
      const signedUrl = await this.storageService.getSignedUrl(bucketName, uploadedFileName, false);

      return { url: signedUrl, fileName: uploadedFileName };
    } catch (err) {
      throw new HttpException(err?.message ?? 'Failed to generate/upload CSV', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async getAcademicYearBySchoolBrand(payload: { school_id: number; brand_id: number; course_id: number; board_id: number }) {
    // 1. Get School Brand ID
    const schoolBrandData = await this.mdmService.fetchDataFromAPI(MDM_API_URLS.SCHOOL_BRAND, {
        'filters[school_id]': payload.school_id,
        'filters[brand_id]': payload.brand_id
    });
    
    if (!schoolBrandData?.data?.length) {
        throw new HttpException('School Brand not found', HttpStatus.NOT_FOUND);
    }
    const schoolBrandId = schoolBrandData.data[0].id;

    // 2. Get Academic Year ID using School Brand ID, Course ID, Board ID
    const schoolBrandBoardData = await this.mdmService.fetchDataFromAPI(MDM_API_URLS.SCHOOL_BRAND_BOARD, {
        'filters[school_brand_id]': schoolBrandId,
        'filters[course_id]': payload.course_id,
        'filters[board_id]': payload.board_id,
        'populate': 'academic_year'
    });

    if (!schoolBrandBoardData?.data?.length) {
         throw new HttpException('School Brand Board configuration not found', HttpStatus.NOT_FOUND);
    }
    
    // Handle potential structure variations
    const boardData = schoolBrandBoardData.data[0].attributes;

    return boardData
  }
}