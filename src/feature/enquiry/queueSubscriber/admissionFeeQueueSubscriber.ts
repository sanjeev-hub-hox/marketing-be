import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { Types } from 'mongoose';

import { LoggerService } from '../../../utils';
import { AdmissionService } from '../../admission/admission.service';
import { EnquiryLogRepository } from '../../enquiryLog/enquiryLog.repository';
import { EnquiryLogService } from '../../enquiryLog/enquiryLog.service';
import {
  EEnquiryEvent,
  EEnquiryEventSubType,
  EEnquiryEventType,
} from '../../enquiryLog/enquiryLog.type';
import { MyTaskService } from '../../myTask/myTask.service';
import { ETaskEntityType } from '../../myTask/myTask.type';
import { EnquiryRepository } from '../enquiry.repository';
import { EnquiryStageUpdateService } from '../EnquiryStageUpdate.service';

@Processor('admissionFees', {
  concurrency: 1,
  lockDuration: 300000,
})
@Injectable()
export class AdmissionFeeQueueSubscriber extends WorkerHost {
  constructor(
    private enquiryRepository: EnquiryRepository,
    private enquiryLogService: EnquiryLogService,
    private enquiryLogRepository: EnquiryLogRepository,
    private admissionService: AdmissionService,
    private enquiryStageUpdateService: EnquiryStageUpdateService,
    private myTaskService: MyTaskService,
    private loggerService: LoggerService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const {
      url,
      headers,
      enquiry_id,
      payment_type,
      enquiry_number,
      amount,
      mode_of_payment,
      payment_date_time,
    } = job.data;

    this.loggerService.log(
      `[AdmissionFee Queue][Subscribe][EnquiryId : ${enquiry_id}][JobId: ${job.id}][Payload: ${JSON.stringify(job.data)}] `,
    );

    try {
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

      const paymentDetails = {
        amount: amount,
        mode_of_payment: mode_of_payment,
        payment_date_time: payment_date_time,
      };

      const tPlusFiveDate = new Date();
      tPlusFiveDate.setDate(new Date().getDate() + 5);
      tPlusFiveDate.setHours(23, 59, 59, 999);

      const isEnrGenerated = await this.admissionService.getadmisionDetails(
        enquiryDetails._id,
      );

      if (isEnrGenerated.enrolment_number) {
        this.loggerService.log(`Enrollment number already exists !!`);
        this.loggerService.log(`Not proceeding to insert student details !!`);
        return true;
      }


      try {
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
          is_admission_fee_received_log: true,
        });
      } catch (err) {
        if (err.code === 11000) {
          this.loggerService.log(
            `[JobId: ${job.id}] : Duplicate admission fee received log — skipping processing`,
          );
          return false;
        }
      }

      await this.admissionService.updateAdmissionPaymentStatus(
        enquiry_id as string,
        paymentDetails,
      );

      await this.enquiryStageUpdateService.moveToNextStage(
        enquiry_id,
        'Payment',
        { url, headers } as any,
      );

      await this.myTaskService.createMyTask({
        enquiry_id: enquiry_id,
        created_for_stage: ETaskEntityType.ADMITTED_OR_PROVISIONAL_APPROVAL,
        task_creation_count: 1,
        valid_from: new Date(),
        valid_till: tPlusFiveDate,
        assigned_to_id: enquiryDetails.assigned_to_id,
      });
      return;
    } catch (err) {
      this.loggerService.error(
        `[JobId: ${job.id}][AdmissionFee Queue][Subscribe][EnquiryId : ${enquiry_id}][Payload: ${JSON.stringify(job.data)}]`,
        null,
      );
      throw err;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`Job ${job.id} completed successfully!`);
  }
}
