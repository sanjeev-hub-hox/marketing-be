import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import axios, { AxiosRequestHeaders } from 'axios';
import { Request } from 'express';
import * as moment from 'moment';
import { PipelineStage } from 'mongoose';

import { AxiosService, EHttpCallMethods } from '../../global/service';
import {
  ADMIN_API_URLS,
  LoggerService,
  MDM_API_URLS,
  MdmService,
} from '../../utils';
import { AdmissionService } from '../admission/admission.service';
import { AuthService } from '../auth/auth.service';
import { EnquiryRepository } from './enquiry.repository';
import { EEnquiryStageStatus, EEnquiryStatus } from './enquiry.type';
import { EnquiryHelper } from './enquiryHelper.service';
import { EnquiryService } from './enquiry.service';
import { RedisService } from 'ampersand-common-module';

@Injectable()
export class EnquiryCron {
  private request = { headers: { authorization: null }, url: '' } as Request;
  constructor(
    private loggerService: LoggerService,
    private enquiryService: EnquiryService,
    private enquiryRepository: EnquiryRepository,
    private enquiryHelperService: EnquiryHelper,
    private admissionService: AdmissionService,
    private axiosService: AxiosService,
    private configService: ConfigService,
    private authService: AuthService,
    private mdmService: MdmService,
    @Inject('REDIS_INSTANCE') private redisInstance: RedisService,
  ) {}

  /**
   * This cron job will run every 15 minutes and will process the enquiries where
   * admission process is incomplete i.e the last stage is in progress
   */
  @Cron('*/15 * * * *', {
    name: 'processIncompleteAdmissionsCron',
    timeZone: 'Asia/Kolkata',
  })
  async processIncompleteAdmissions() {
    const JobId = new Date().getTime();
    this.loggerService.log(
      `[CRON][processIncompleteAdmissionsCron][JOB ID: ${JobId}] Running processIncompleteAdmissionsCron cron at ${new Date()}`,
    );
    try {
      const { access_token } = await this.authService.generatetoken(
        this.request,
        {
          username: this.configService.get<string>('TEST_USERNAME'),
          password: this.configService.get<string>('TEST_PASSWORD')
        },
      );

      this.request.headers.authorization = access_token;
      const pipeline: PipelineStage[] = [
        {
          $match: {
            $and: [
              {
                enquiry_stages: {
                  $elemMatch: {
                    stage_name: 'Payment',
                    status: EEnquiryStageStatus.COMPLETED,
                  },
                },
              },
              {
                enquiry_stages: {
                  $elemMatch: {
                    stage_name: 'Admitted or Provisional Approval',
                    status: EEnquiryStageStatus.INPROGRESS,
                  },
                },
              },
            ],
            status: {
              $in: [EEnquiryStatus.ADMITTED, EEnquiryStatus.OPEN],
            },
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
          $unwind: {
            path: '$admissionDetails',
          },
        },
        {
          $project: {
            _id: 1,
            academic_year: 1,
            enquiry_number: 1,
            enquiry_stages: 1,
            student_id: '$admissionDetails.student_id',
            enrolment_number: '$admissionDetails.enrolment_number',
            documents: 1,
            subject_details: '$admissionDetails.subject_details',
          },
        },
      ];
      const incompleteAdmissionEnquiries =
        await this.enquiryRepository.aggregate(pipeline);

      if (!incompleteAdmissionEnquiries) {
        this.loggerService.log(
          `[CRON][processIncompleteAdmissionsCron] no incomplete admission enquiries found`,
        );
        return;
      }

      this.loggerService.log(
        `[CRON][processIncompleteAdmissionsCron][JOB ID: ${JobId}] Running processIncompleteAdmissionsCron cron at ${new Date()}`,
      );

      this.loggerService.log(
        `[CRON][processIncompleteAdmissionsCron] ${incompleteAdmissionEnquiries.length} Incomplete admission enquiries found : ${JSON.stringify(incompleteAdmissionEnquiries)}`,
      );

      for (const enquiry of incompleteAdmissionEnquiries) {
        const {
          _id: enquiry_id,
          academic_year,
          enquiry_stages,
          student_id,
          enrolment_number,
          documents,
          subject_details,
        } = enquiry;

        try {
          this.loggerService.log(
            `[CRON][processIncompleteAdmissionsCron][JOB ID: ${JobId}][enquiry ID - ${enquiry._id}][enquiry number - ${enquiry.enquiry_number}] Process started`,
          );

          if (student_id && enrolment_number) {
            this.loggerService.log(
              `[CRON][processIncompleteAdmissionsCron][JOB ID: ${JobId}][enquiry ID - ${enquiry._id}][enquiry number - ${enquiry.enquiry_number}] Student Id and Enrolment number found`,
            );

            this.loggerService.log(
              `[CRON][processIncompleteAdmissionsCron][JOB ID: ${JobId}][enquiry ID - ${enquiry._id}][enquiry number - ${enquiry.enquiry_number}] Updating only final stage`,
            );

            // Simply update the last stage of enquiry;
            const admissionType =
             this.enquiryHelperService.getAdmissionType(documents);

            enquiry_stages[enquiry_stages.length - 1].status = admissionType;
            await this.enquiryRepository.updateById(enquiry_id, {
              enquiry_stages: enquiry_stages,
            });
          }

          if (!student_id && !enrolment_number) {
            this.loggerService.log(
              `[CRON][processIncompleteAdmissionsCron][JOB ID: ${JobId}][enquiry ID - ${enquiry._id}][enquiry number - ${enquiry.enquiry_number}] Student Id and Enrolment number not found`,
            );

            // Push student details to academics
            const studentDetails = await this.admissionService.addStudentDetail(
              enquiry_id,
              this.request,
            );

            this.loggerService.log(
              `[CRON][processIncompleteAdmissionsCron][JOB ID: ${JobId}][enquiry ID - ${enquiry._id}][enquiry number - ${enquiry.enquiry_number}] Add student details response: ${JSON.stringify(studentDetails)}`,
            );

            // Push the mapping of subjects to students
            const studentId =
              studentDetails?.student_profile?.id ?? studentDetails?.id;
            const submitStudentMappingDataPromises = [];
            subject_details.forEach((subject) => {
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
                      selected_for: `${+academic_year.value.split('-')[0] + 1}-01-01`,
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
                .setBaseUrl(this.configService.get<string>('ADMIN_PANEL_URL'))
                .setUrl(ADMIN_API_URLS.MAP_STUDENT_DOCUMENTS)
                .setMethod(EHttpCallMethods.POST)
                .setHeaders({
                  Authorization: this.request.headers.authorization,
                } as AxiosRequestHeaders)
                .setBody({
                  student_id: studentId,
                  documents: documents,
                })
                .sendRequest(),
            );

            const admissionType =
             this.enquiryHelperService.getAdmissionType(documents);
            enquiry_stages[enquiry_stages.length - 1].status = admissionType;

            submitStudentMappingDataPromises.push(
              this.enquiryRepository.updateById(enquiry_id, {
                enquiry_stages: enquiry_stages,
              }),
            );
            await Promise.all(submitStudentMappingDataPromises);

            this.loggerService.log(
              `[CRON][processIncompleteAdmissionsCron][JOB ID: ${JobId}][enquiry ID - ${enquiry._id}][enquiry number - ${enquiry.enquiry_number}] Added subject details and documents`,
            );
          }

          this.loggerService.log(
            `[CRON][processIncompleteAdmissionsCron][JOB ID: ${JobId}][enquiry ID - ${enquiry._id}][enquiry number - ${enquiry.enquiry_number}] Process terminated`,
          );
        } catch (error) {
          console.log(error);
          this.loggerService.error(
            `[CRON][processIncompleteAdmissionsCron][JOB ID: ${JobId}][enquiry ID - ${enquiry._id}][enquiry number - ${enquiry.enquiry_number}] Processing failed`,
            null,
          );

          if (axios.isAxiosError(error)) {
            this.loggerService.error(
              `[CRON][processIncompleteAdmissionsCron][JOB ID: ${JobId}][enquiry ID - ${enquiry._id}][enquiry number - ${enquiry.enquiry_number}] Processing failed. Error message: ${JSON.stringify(error.message)}`,
              null,
            );

            if (error.response) {
              this.loggerService.error(
                `[CRON][processIncompleteAdmissionsCron][JOB ID: ${JobId}][enquiry ID - ${enquiry._id}][enquiry number - ${enquiry.enquiry_number}] Processing failed. Error response data: ${JSON.stringify(error?.response?.data)}`,
                null,
              );
            }
          } else {
            this.loggerService.error(
              `[CRON][processIncompleteAdmissionsCron][JOB ID: ${JobId}][enquiry ID - ${enquiry._id}][enquiry number - ${enquiry.enquiry_number}] Processing failed. Error: ${error}`,
              null,
            );
          }
          continue;
        }
      }
      this.loggerService.log(
        `[CRON][processIncompleteAdmissionsCron][JOB ID: ${JobId}] Terminated processIncompleteAdmissionsCron cron at ${new Date()}`,
      );
    } catch (error) {
      console.log(error);
      this.loggerService.error(
        `[CRON][processIncompleteAdmissionsCron][JOB ID: ${JobId}] Processing failed. Error: ${error}`,
        null,
      );
    }
  }

  @Cron('*/7 * * * *') // runs every 10 minutes
  async refreshAdmissionReportCache() {
    try {
      console.log('Refreshing admission report cache...');
      const result = await this.enquiryService.enquiryDetailsReport();
      await this.redisInstance.setData('admission-enquiry-report', result, 720);
      console.log('admission report cache updated successfully');
    } catch (err) {
      console.log('Error refreshing admission report cache:', err);
    }
  }
}
