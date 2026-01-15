import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { PipelineStage, Types } from 'mongoose';
import {
  EEnquiryEvent,
  EEnquiryEventSubType,
  EEnquiryEventType,
} from 'src/feature/enquiryLog/enquiryLog.type';
import { EMAIL_TEMPLATE_SLUGS } from 'src/global/global.constant';
import { AxiosService } from 'src/global/service';

import { EmailService } from '../../global/global.email.service';
import { CreatedByDetailsDto } from '../../middleware/auth/auth.dto';
import { AdmissionService } from '../admission/admission.service';
import { EAdmissionApprovalStatus } from '../admission/admission.type';
import { EnquiryRepository } from '../enquiry/enquiry.repository';
import { EEnquiryStageStatus } from '../enquiry/enquiry.type';
import { EnquiryHelper } from '../enquiry/enquiryHelper.service';
import { EnquiryLogRepository } from '../enquiryLog/enquiryLog.repository';
import { EnquiryLogService } from '../enquiryLog/enquiryLog.service';
import { EnquiryTypeRepository } from '../enquiryType/enquiryType.repository';
import { MyTaskService } from '../myTask/myTask.service';
import { ETaskEntityType } from '../myTask/myTask.type';
import { SlotMasterRepository } from '../slots/repository';
import { SlotService } from '../slots/slot.service';
import { ESlotType, EUnavailabilityOf } from '../slots/slot.type';
import { WorkflowService } from '../workflow/workflow.service';
import {
  CancelCompetencyTestRequestDto,
  RescheduleCompetencyTestRequestDto,
  ScheduleCompetencyTestRequestDto,
} from './competencyTest.dto';
import { CompetencyTestRepository } from './competencyTest.repository';
import { TCompetencyTestDocument } from './competencyTest.schema';
import {
  ECompetencyTestResult,
  ECompetencyTestStatus,
} from './competencyTest.type';
import { Request } from 'express';

@Injectable()
export class CompetencyTestService {
  constructor(
    public readonly configService: ConfigService,
    private competencyTestRepository: CompetencyTestRepository,
    private enquiryLogService: EnquiryLogService,
    private enquiryLogRepository: EnquiryLogRepository,
    private enquiryRepository: EnquiryRepository,
    private slotService: SlotService,
    private admissionService: AdmissionService,
    private axiosService: AxiosService,
    private enquiryTypeRepository: EnquiryTypeRepository,
    private workflowService: WorkflowService,
    private slotMasterRepository: SlotMasterRepository,
    private myTaskService: MyTaskService,
    private emailService: EmailService,
    private enquiryHelper: EnquiryHelper,
  ) {}

  async updateEnquiryStage(
    enquiryId: string,
    enquiryStages: any[],
    stageName: string,
    status: EEnquiryStageStatus,
  ) {
    const competencyRegex = new RegExp(stageName, 'i');
    const updatedEnquiryStages = enquiryStages.map((stage) => {
      // stage.stage_id = new Types.ObjectId(stage.stage_id);
      if (competencyRegex.test(stage.stage_name)) {
        stage.status = status;
      }
      return stage;
    });
    await this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
      enquiry_stages: updatedEnquiryStages,
    });
  }

  async scheduleCompetencyTest(
    enquiryId: string,
    payload: ScheduleCompetencyTestRequestDto,
    userInfo: CreatedByDetailsDto | null,
  ) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException('Enquiry not found', HttpStatus.NOT_FOUND);
    }

    const { enquiry_stages } = enquiryDetails;
    const { slot_id, date, mode } = payload;

    const [day, month, year] = date.split('-');
    const parsedDate = `${year}-${month}-${day}`;

    const existingCompetencyTestRecord =
      await this.competencyTestRepository.getOne({
        enquiry_id: new Types.ObjectId(enquiryId),
      });

    const employeeId = [enquiryDetails.assigned_to_id];

    const globalId =
      enquiryDetails?.other_details?.parent_type === 'Guardian'
        ? enquiryDetails?.parent_details?.guardian_details?.global_id
        : enquiryDetails?.other_details?.parent_type === 'Father'
          ? enquiryDetails?.parent_details?.father_details?.global_id
          : enquiryDetails?.parent_details?.mother_details?.global_id;

    const slotDoc = await this.slotMasterRepository.getById(
      new Types.ObjectId(slot_id),
    );

    const logData = {
      date: moment(parsedDate).format('DD-MM-YYYY'),
      time: slotDoc.slot,
    };

    if (!existingCompetencyTestRecord) {
      const bookedSlotDetails = await this.slotService.bookSlot(
        enquiryId,
        slot_id,
        date,
        ESlotType.COMPETENCY_TEST,
      );

      const competencyTestPayload = {
        enquiry_id: new Types.ObjectId(enquiryId),
        booked_slot_id: bookedSlotDetails._id,
        mode: mode,
        status: ECompetencyTestStatus.SCHEDULED,
      };

      const competencyTest = await this.competencyTestRepository.create(
        competencyTestPayload,
      );

      await Promise.all([
        this.enquiryLogService.createLog({
          enquiry_id: new Types.ObjectId(enquiryId),
          event_type: EEnquiryEventType.COMPETENCY_TEST,
          event_sub_type: EEnquiryEventSubType.COMPETENCY_TEST_ACTION,
          event: EEnquiryEvent.COMPETENCY_TEST_SCHEDULED,
          log_data: { ...competencyTest, ...logData },
          created_by: userInfo?.user_name ?? null,
          created_by_id: userInfo?.user_id ?? null,
        }),
        this.updateEnquiryStage(
          enquiryId,
          enquiry_stages,
          'Competency Test',
          EEnquiryStageStatus.INPROGRESS,
        ),
      ]);

      // Send notification
      this.emailService.setEnquiryDetails(enquiryDetails).sendNotification(
        EMAIL_TEMPLATE_SLUGS.COMPETENCY_TEST_SCHEDULED,
        {
          student_name: `${enquiryDetails?.student_details?.first_name} ${enquiryDetails?.student_details?.last_name}`,
          school_location: `${enquiryDetails?.school_location?.value}`,
          date: moment(parsedDate).format('DD-MM-YYYY'),
          time: slotDoc.slot,
        },
        [
          this.enquiryHelper.getEnquirerDetails(enquiryDetails, 'email')
            ?.email as string,
        ],
      );
      return competencyTest;
    }

    const { _id: competencyTestId } = existingCompetencyTestRecord;
    const bookedSlotDetails = await this.slotService.bookSlot(
      enquiryId,
      slot_id,
      date,
      ESlotType.COMPETENCY_TEST,
    );

    const competencyTestPayload = {
      booked_slot_id: bookedSlotDetails._id,
      mode: mode,
      status: ECompetencyTestStatus.SCHEDULED,
      cancel_reason: null,
      cancel_comment: null,
    };
    const competencyTest = await this.competencyTestRepository.updateById(
      competencyTestId,
      competencyTestPayload,
    );

    await Promise.all([
      this.enquiryLogService.createLog({
        enquiry_id: new Types.ObjectId(enquiryId),
        event_type: EEnquiryEventType.COMPETENCY_TEST,
        event_sub_type: EEnquiryEventSubType.COMPETENCY_TEST_ACTION,
        event: EEnquiryEvent.COMPETENCY_TEST_SCHEDULED,
        log_data: { ...competencyTest, ...logData },
        created_by: userInfo?.user_name ?? null,
        created_by_id: userInfo?.user_id ?? null,
      }),
      this.updateEnquiryStage(
        enquiryId,
        enquiry_stages,
        'Competency Test',
        EEnquiryStageStatus.INPROGRESS,
      ),
    ]);

    // Send notification
    this.emailService.setEnquiryDetails(enquiryDetails).sendNotification(
      EMAIL_TEMPLATE_SLUGS.COMPETENCY_TEST_SCHEDULED,
      {
        student_name: `${enquiryDetails?.student_details?.first_name} ${enquiryDetails?.student_details?.last_name}`,
        school_location: `${enquiryDetails?.school_location?.value}`,
        date: moment(parsedDate).format('DD-MM-YYYY'),
        time: slotDoc.slot,
      },
      [
        this.enquiryHelper.getEnquirerDetails(enquiryDetails, 'email')
          ?.email as string,
      ],
    );
    return competencyTest;
  }

  async fetchCompetencyTestByEnquiryId(enquiryId: Types.ObjectId) {
    const result = await this.competencyTestRepository.getMany({
      enquiry_id: enquiryId,
    });
    if (!result.length) {
      throw new HttpException(
        { message: `Competency test not found.` },
        HttpStatus.NOT_FOUND,
      );
    }
    return result[0];
  }

  async getCompetencyTestDetails(enquiryId: string) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException('Enquiry not found', HttpStatus.NOT_FOUND);
    }

    const pipeline: PipelineStage[] = [
      {
        $match: {
          enquiry_id: new Types.ObjectId(enquiryId),
        },
      },
      {
        $lookup: {
          from: 'bookedSlot',
          localField: 'booked_slot_id',
          foreignField: '_id',
          as: 'bookedSlotDetails',
        },
      },
      {
        $unwind: '$bookedSlotDetails',
      },
      {
        $lookup: {
          from: 'slotMaster',
          foreignField: '_id',
          localField: 'bookedSlotDetails.slot_id',
          as: 'slotMetadata',
        },
      },
      {
        $unwind: '$slotMetadata',
      },
      {
        $project: {
          enquiry_id: 1,
          booked_slot_id: 1,
          comment: 1,
          mode: 1,
          status: 1,
          created_by: 1,
          cancel_reason: 1,
          cancel_comment: 1,
          test_result: 1,
          slot_id: '$bookedSlotDetails.slot_id',
          slot_for: '$bookedSlotDetails.slot_for',
          date: '$bookedSlotDetails.date',
          slot: '$slotMetadata.slot',
          day: '$slotMetadata.day',
          school_id: '$slotMetadata.school_id',
        },
      },
    ];

    const competencyTestDetails =
      await this.competencyTestRepository.aggregate(pipeline);
    if (!competencyTestDetails.length) {
      throw new HttpException(
        'Competency test details not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return competencyTestDetails[0];
  }

  async cancelCompetencyTest(
    enquiryId: string,
    payload: CancelCompetencyTestRequestDto,
    userInfo: CreatedByDetailsDto | null,
  ) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException('Enquiry not found', HttpStatus.NOT_FOUND);
    }

    const { enquiry_stages } = enquiryDetails;
    const { comment, reason } = payload;

    const existingCompetencyTestRecord =
      await this.competencyTestRepository.getOne({
        enquiry_id: new Types.ObjectId(enquiryId),
      });

    if (!existingCompetencyTestRecord) {
      throw new HttpException(
        'Competency test record not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const { _id: competencyTestId, booked_slot_id } =
      existingCompetencyTestRecord;

    // release the previously booked slot
    await this.slotService.releaseSlot(booked_slot_id.toString());

    // Update the existing school visit record
    const competencyTestPayload = {
      status: ECompetencyTestStatus.CANCELLED,
      cancel_reason: reason,
      cancel_comment: comment,
    };

    const competencyTest = await this.competencyTestRepository.updateById(
      competencyTestId,
      competencyTestPayload,
    );

    const recentScheduledCommpetencyTestLog =
      await this.enquiryLogRepository.getMany(
        {
          enquiry_id: new Types.ObjectId(enquiryId),
          event: {
            $in: [
              EEnquiryEvent.COMPETENCY_TEST_SCHEDULED,
              EEnquiryEvent.COMPETENCY_TEST_RESCHEDULED,
            ],
          },
        },
        'desc',
      );

    const testScheduledDate = recentScheduledCommpetencyTestLog?.length
      ? recentScheduledCommpetencyTestLog[0]?.log_data?.date
      : null;
    const testScheduleTime = recentScheduledCommpetencyTestLog?.length
      ? recentScheduledCommpetencyTestLog[0]?.log_data?.time
      : null;

    await Promise.all([
      // Add competency test action log
      this.enquiryLogService.createLog({
        enquiry_id: new Types.ObjectId(enquiryId),
        event_type: EEnquiryEventType.COMPETENCY_TEST,
        event_sub_type: EEnquiryEventSubType.COMPETENCY_TEST_ACTION,
        event: EEnquiryEvent.COMPETENCY_TEST_CANCELLED,
        log_data: competencyTest,
        created_by: userInfo?.user_name ?? null,
        created_by_id: userInfo?.user_id ?? null,
      }),
      // Update the enquiry stage
      this.updateEnquiryStage(
        enquiryId,
        enquiry_stages,
        'Competency Test',
        EEnquiryStageStatus.OPEN,
      ),
    ]);

    // Send notification
    this.emailService.setEnquiryDetails(enquiryDetails).sendNotification(
      EMAIL_TEMPLATE_SLUGS.COMPETENCY_TEST_CANCELLED,
      {
        student_name: `${enquiryDetails?.student_details?.first_name} ${enquiryDetails?.student_details?.last_name}`,
        school_location: `${enquiryDetails?.school_location?.value}`,
        date: testScheduledDate ?? '',
        time: testScheduleTime ?? '',
      },
      [
        this.enquiryHelper.getEnquirerDetails(enquiryDetails, 'email')
          ?.email as string,
      ],
    );
    return competencyTest;
  }

  async rescheduleCompetencyTest(
    enquiryId: string,
    payload: RescheduleCompetencyTestRequestDto,
    userInfo: CreatedByDetailsDto | null,
  ) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException('Enquiry not found', HttpStatus.NOT_FOUND);
    }

    const { enquiry_stages } = enquiryDetails;
    const { date, new_slot_id, mode } = payload;
    const [day, month, year] = date.split('-');
    const parsedDate = `${year}-${month}-${day}`;

    const existingCompetencyTestRecord =
      await this.competencyTestRepository.getOne({
        enquiry_id: new Types.ObjectId(enquiryId),
      });

    const slotDoc = await this.slotMasterRepository.getById(
      new Types.ObjectId(new_slot_id),
    );

    const logData = {
      date: moment(parsedDate).format('DD-MM-YYYY'),
      time: slotDoc.slot,
    };

    if (!existingCompetencyTestRecord) {
      throw new HttpException(
        'Competency test record not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const { _id: competencyTestId, booked_slot_id } =
      existingCompetencyTestRecord;

    // Book a new slot
    const bookedSlotDetails = await this.slotService.reBookSlot(
      enquiryId,
      new_slot_id,
      booked_slot_id.toString(),
      date,
      ESlotType.COMPETENCY_TEST,
    );

    // Update the existing competency test record
    const competencyTestPayload = {
      booked_slot_id: bookedSlotDetails._id,
      mode: mode,
      status: ECompetencyTestStatus.SCHEDULED,
      cancel_reason: null,
      cancel_comment: null,
    };
    const competencyTest = await this.competencyTestRepository.updateById(
      competencyTestId,
      competencyTestPayload,
    );

    await Promise.all([
      // Add competency test action log
      this.enquiryLogService.createLog({
        enquiry_id: new Types.ObjectId(enquiryId),
        event_type: EEnquiryEventType.COMPETENCY_TEST,
        event_sub_type: EEnquiryEventSubType.COMPETENCY_TEST_ACTION,
        event: EEnquiryEvent.COMPETENCY_TEST_RESCHEDULED,
        log_data: { ...competencyTest, ...logData },
        created_by: userInfo?.user_name ?? null,
        created_by_id: userInfo?.user_id ?? null,
      }),
      // Update the enquiry stage
      this.updateEnquiryStage(
        enquiryId,
        enquiry_stages,
        'Competency Test',
        EEnquiryStageStatus.INPROGRESS,
      ),
    ]);

    // Send notification
    this.emailService.setEnquiryDetails(enquiryDetails).sendNotification(
      EMAIL_TEMPLATE_SLUGS.COMPETENCY_TEST_RESCHEDULED,
      {
        student_name: `${enquiryDetails?.student_details?.first_name} ${enquiryDetails?.student_details?.last_name}`,
        school_location: `${enquiryDetails?.school_location?.value}`,
        date: moment(parsedDate).format('DD-MM-YYYY'),
        time: slotDoc.slot,
      },
      [
        this.enquiryHelper.getEnquirerDetails(enquiryDetails, 'email')
          ?.email as string,
      ],
    );
    return competencyTest;
  }

  async getAvailableSlots(enquiryId: string, inputDate: string) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );
    if (!enquiryDetails) {
      throw new HttpException('Enquiry not found', HttpStatus.NOT_FOUND);
    }

    const { school_location } = enquiryDetails as Record<string, any>;

    if (!school_location.id) {
      throw new HttpException(
        'Cannot find slots for invalid school Id',
        HttpStatus.NOT_FOUND,
      );
    }

    const availableSlots = await this.slotService.getAvailableSlots(
      inputDate,
      school_location.id,
      ESlotType.COMPETENCY_TEST,
    );
    return availableSlots;
  }

  async addUnavailableSlots(
    slotId: string,
    date: string,
    unavailabilityOf: EUnavailabilityOf,
  ) {
    const slotDetails = await this.slotService.addUnavailableSlot(
      slotId,
      date,
      unavailabilityOf,
      ESlotType.COMPETENCY_TEST,
    );
    return slotDetails;
  }

  async getSlotListForMarkingUnavailableSlots(
    schoolId: number,
    date: string,
    unavailabilityOf: EUnavailabilityOf,
  ) {
    const slots = await this.slotService.getSlotListForMarkingUnavailableSlots(
      schoolId,
      date,
      ESlotType.COMPETENCY_TEST,
      unavailabilityOf,
    );

    return slots;
  }

  async updateCompetencyTestResult(
    enquiryId: string,
    status: ECompetencyTestResult,
    userInfo: CreatedByDetailsDto | null,
    req: Request
  ): Promise<TCompetencyTestDocument> {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException('Enquiry not found', HttpStatus.NOT_FOUND);
    }

    const { enquiry_stages } = enquiryDetails;

    const competencyTest = await this.competencyTestRepository.getOne({
      enquiry_id: new Types.ObjectId(enquiryId),
    });

    if (!competencyTest) {
      throw new HttpException(
        'Competency test not found',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.competencyTestRepository.updateById(competencyTest._id, {
      test_result: status,
    });

    const promises = [
      // Add competency test action log
      this.enquiryLogService.createLog({
        enquiry_id: new Types.ObjectId(enquiryId),
        event_type: EEnquiryEventType.COMPETENCY_TEST,
        event_sub_type: EEnquiryEventSubType.COMPETENCY_TEST_ACTION,
        event:
          status === ECompetencyTestResult.PASS
            ? EEnquiryEvent.COMPETENCY_TEST_PASSED
            : EEnquiryEvent.COMPETENCY_TEST_FAILED,
        log_data: competencyTest,
        created_by: userInfo?.user_name ?? 'system',
        created_by_id: userInfo?.user_id ?? 1,
      }),
      // Update the enquiry stage
      this.updateEnquiryStage(
        enquiryId,
        enquiry_stages,
        'Competency Test',
        status === ECompetencyTestResult.PASS
          ? EEnquiryStageStatus.PASSED
          : EEnquiryStageStatus.FAILED,
      ),
    ];

    await Promise.all(promises);

    const updatedEnquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    const { enquiry_stages: updatedEnquiryStages } = updatedEnquiryDetails;
    await Promise.all([
      this.updateEnquiryStage(
        enquiryId,
        updatedEnquiryStages,
        'Admission Status',
        EEnquiryStageStatus.PENDING,
      ),
      // TODO: Remove the below updateAdmissionApprovalStatus code in future, this is added just to make the enquiry to admission flow smoothly without waiting for any approval
      this.admissionService.upsertAdmissionRecord(
        new Types.ObjectId(enquiryId),
        EAdmissionApprovalStatus.PENDING,
      ),
    ]);

    const tPlusFiveDate = new Date();
    tPlusFiveDate.setDate(new Date().getDate() + 5);
    tPlusFiveDate.setHours(23, 59, 59, 999);

    await Promise.all([
      this.workflowService.triggerWorkflow(enquiryDetails, { status }, req),
      this.myTaskService.createMyTask({
        enquiry_id: enquiryId,
        created_for_stage: ETaskEntityType.ENQUIRY,
        valid_from: new Date(),
        valid_till: tPlusFiveDate,
        task_creation_count: 1,
        assigned_to_id: enquiryDetails.assigned_to_id,
      }),
    ]);

    return;
  }
}
