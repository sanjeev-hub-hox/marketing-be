import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { PipelineStage, Types } from 'mongoose';

import {
  EMAIL_TEMPLATE_SLUGS,
  SUPPORT_EMAIL_FIELDS,
} from '../../global/global.constant';
import { EmailService } from '../../global/global.email.service';
import { AxiosService } from '../../global/service';
import { CreatedByDetailsDto } from '../../middleware/auth/auth.dto';
import { LoggerService, MdmService } from '../../utils';
import { EnquiryRepository } from '../enquiry/enquiry.repository';
import { EEnquiryStageStatus, EParentType } from '../enquiry/enquiry.type';
import { EnquiryHelper } from '../enquiry/enquiryHelper.service';
import { EnquiryLogRepository } from '../enquiryLog/enquiryLog.repository';
import { EnquiryLogService } from '../enquiryLog/enquiryLog.service';
import {
  EEnquiryEvent,
  EEnquiryEventSubType,
  EEnquiryEventType,
} from '../enquiryLog/enquiryLog.type';
import { SlotService } from '../slots/slot.service';
import { ESlotType, EUnavailabilityOf } from '../slots/slot.type';
import {
  CancelSchoolVisitRequestDto,
  CompleteSchoolVisitRequestDto,
  RescheduleSchoolVisitRequestDto,
  ScheduleSchoolVisitRequestDto,
} from './schoolVisit.dto';
import { SchoolVisitRepository } from './schoolVisit.repository';
import { ESchoolVisitStatus } from './schoolVisit.type';

@Injectable()
export class SchoolVisitService {
  constructor(
    public readonly configService: ConfigService,
    private schoolVisitRepository: SchoolVisitRepository,
    private enquiryLogService: EnquiryLogService,
    private enquiryLogRepository: EnquiryLogRepository,
    private enquiryRepository: EnquiryRepository,
    private slotService: SlotService,
    private axiosService: AxiosService,
    private loggerService: LoggerService,
    private emailService: EmailService,
    private enquiryHelper: EnquiryHelper,
    private mdmService: MdmService,
  ) { }

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

  async scheduleSchoolVisit(
    enquiryId: string,
    payload: ScheduleSchoolVisitRequestDto,
    userInfo: CreatedByDetailsDto,
  ) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException('Enquiry not found', HttpStatus.NOT_FOUND);
    }

    const { enquiry_stages, other_details, parent_details, school_location } =
      enquiryDetails;
    const { date, slot_id } = payload;

    const enquirerDetails: Record<string, unknown> = {};

    switch ((other_details as any).parent_type) {
      case EParentType.FATHER:
        const { father_details } = parent_details;
        enquirerDetails['name'] =
          father_details.first_name + father_details.last_name;
        enquirerDetails['email'] = father_details.email;
        enquirerDetails['mobile'] = father_details.mobile;
        break;
      case EParentType.MOTHER:
        const { mother_details } = parent_details;
        enquirerDetails['name'] =
          mother_details.first_name + mother_details.last_name;
        enquirerDetails['email'] = mother_details.email;
        enquirerDetails['mobile'] = mother_details.mobile;
        break;
      case EParentType.GUARDIAN:
        const { guardian_details } = parent_details;
        enquirerDetails['name'] =
          guardian_details.first_name + guardian_details.last_name;
        enquirerDetails['email'] = guardian_details.email;
        enquirerDetails['mobile'] = guardian_details.mobile;
        break;
    }

    const existingSchoolVisitRecord = await this.schoolVisitRepository.getOne({
      enquiry_id: new Types.ObjectId(enquiryId),
    });

    const slotDoc = await this.slotService.getSlotMasterById(slot_id);
    const [day, month, year] = date.split('-');
    const parsedDate = `${year}-${month}-${day}`;
    const logData = {
      date: moment(parsedDate).format('DD-MM-YYYY'),
      time: slotDoc.slot,
    };

    if (!existingSchoolVisitRecord) {
      const bookedSlotDetails = await this.slotService.bookSlot(
        enquiryId,
        slot_id,
        date,
        ESlotType.SCHOOL_VISIT,
      );

      const schoolVisitPayload = {
        enquiry_id: new Types.ObjectId(enquiryId),
        booked_slot_id: bookedSlotDetails._id,
        ...(payload.comment ? { comment: payload.comment } : {}),
        status: ESchoolVisitStatus.SCHEDULED,
      };

      const schoolVisit =
        await this.schoolVisitRepository.create(schoolVisitPayload);

      await Promise.all([
        this.enquiryLogService.createLog({
          enquiry_id: new Types.ObjectId(enquiryId),
          event_type: EEnquiryEventType.SCHOOL_TOUR,
          event_sub_type: EEnquiryEventSubType.SCHOOL_TOUR_ACTION,
          event: EEnquiryEvent.SCHOOL_TOUR_SCHEDULED,
          log_data: { ...schoolVisit, ...logData },
          created_by: userInfo?.user_name ?? null,
          created_by_id: userInfo?.user_id ?? null,
        }),
        this.updateEnquiryStage(
          enquiryId,
          enquiry_stages,
          'School Visit',
          EEnquiryStageStatus.INPROGRESS,
        ),
        // need to check the code as it is giving 500 error while creating school visit
        // this.axiosService
        //   .setBaseUrl(this.configService.get<string>('GATE_MANAGEMENT_URL'))
        //   .setUrl('/gatepass/scheduled-gatepass/create')
        //   .setMethod(EHttpCallMethods.POST)
        //   .setBody({
        //     ...enquirerDetails,
        //     school_id: school_location?.id,
        //     school_visit_id: schoolVisit._id.toString(),
        //     school_visit_date: date,
        //   })
        //   .sendRequest(),
      ]);

      // Send notification
      this.emailService.setEnquiryDetails(enquiryDetails).sendNotification(
        EMAIL_TEMPLATE_SLUGS.SCHOOL_TOUR_SCHEDULED,
        {
          school_name: `${enquiryDetails?.school_location?.value}`,
          date_time: `${logData.date} ${logData.time}`,
          date: logData.date,
          time: logData.time,
          ...SUPPORT_EMAIL_FIELDS,
        },
        [
          this.enquiryHelper.getEnquirerDetails(enquiryDetails, 'email')
            ?.email as string,
        ],
      );

      return schoolVisit;
    }

    const { _id: schoolVisitId } = existingSchoolVisitRecord;
    const bookedSlotDetails = await this.slotService.bookSlot(
      enquiryId,
      slot_id,
      date,
      ESlotType.SCHOOL_VISIT,
    );

    const schoolVisitPayload = {
      booked_slot_id: bookedSlotDetails._id,
      ...(payload.comment ? { comment: payload.comment } : {}),
      status: ESchoolVisitStatus.SCHEDULED,
      created_by: {
        user_id: userInfo.user_id,
        user_name: userInfo.user_name,
        email: userInfo.email,
      },
      cancel_reason: null,
      cancel_comment: null,
      activities: [],
      activity_comment: null,
    };
    const schoolVisit = await this.schoolVisitRepository.updateById(
      schoolVisitId,
      schoolVisitPayload,
    );

    await Promise.all([
      this.enquiryLogService.createLog({
        enquiry_id: new Types.ObjectId(enquiryId),
        event_type: EEnquiryEventType.SCHOOL_TOUR,
        event_sub_type: EEnquiryEventSubType.SCHOOL_TOUR_ACTION,
        event: EEnquiryEvent.SCHOOL_TOUR_SCHEDULED,
        log_data: { ...schoolVisit, ...logData },
        created_by: userInfo?.user_name ?? null,
        created_by_id: userInfo?.user_id ?? null,
      }),
      this.updateEnquiryStage(
        enquiryId,
        enquiry_stages,
        'School Visit',
        EEnquiryStageStatus.INPROGRESS,
      ),
      // this.axiosService
      //   .setBaseUrl(this.configService.get<string>('GATE_MANAGEMENT_URL'))
      //   .setUrl('/gatepass/scheduled-gatepass/create')
      //   .setMethod(EHttpCallMethods.POST)
      //   .setBody({
      //     ...enquirerDetails,
      //     school_id: school_location?.id,
      //     school_visit_id: schoolVisit._id.toString(),
      //     school_visit_date: date,
      //     school_visit_time: bookedSlotDetails.slot,
      //   })
      //   .sendRequest(),
    ]);

    // Send notification
    this.emailService.setEnquiryDetails(enquiryDetails).sendNotification(
      EMAIL_TEMPLATE_SLUGS.SCHOOL_TOUR_SCHEDULED,
      {
        school_name: `${enquiryDetails?.school_location?.value}`,
        date_time: `${logData.date} ${logData.time}`,
        date: logData.date,
        time: logData.time,
        ...SUPPORT_EMAIL_FIELDS,
      },
      [
        this.enquiryHelper.getEnquirerDetails(enquiryDetails, 'email')
          ?.email as string,
      ],
    );
    return schoolVisit;
  }

  async fetchSchoolVisit(enquiryId: Types.ObjectId) {
    const result = await this.schoolVisitRepository.getMany({
      enquiry_id: enquiryId,
    });
    return result;
  }

  async fetchSchoolVisitById(schoolVisitId: Types.ObjectId) {
    const result = await this.schoolVisitRepository.getById(schoolVisitId);
    return result;
  }

  async getSchoolVisitDetails(enquiryId: string) {
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
          status: 1,
          created_by: 1,
          cancel_reason: 1,
          cancel_comment: 1,
          activities: 1,
          activity_comment: 1,
          slot_id: '$bookedSlotDetails.slot_id',
          slot_for: '$bookedSlotDetails.slot_for',
          date: '$bookedSlotDetails.date',
          slot: '$slotMetadata.slot',
          day: '$slotMetadata.day',
          school_id: '$slotMetadata.school_id',
        },
      },
    ];

    const schoolVisitData =
      await this.schoolVisitRepository.aggregate(pipeline);
    if (!schoolVisitData.length) {
      throw new HttpException(
        'School visit details not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return schoolVisitData[0];
  }

  async cancelSchoolVisit(
    enquiryId: string,
    payload: CancelSchoolVisitRequestDto,
    userInfo: Record<string, any>,
  ) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException('Enquiry not found', HttpStatus.NOT_FOUND);
    }

    const { enquiry_stages } = enquiryDetails;
    const { comment, reason } = payload;

    const existingSchoolVisitRecord = await this.schoolVisitRepository.getOne({
      enquiry_id: new Types.ObjectId(enquiryId),
    });

    if (!existingSchoolVisitRecord) {
      throw new HttpException(
        'School visit record not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const { _id: schoolVisitId, booked_slot_id } = existingSchoolVisitRecord;

    // release the previously booked slot
    await this.slotService.releaseSlot(booked_slot_id.toString());

    // Update the existing school visit record
    const schoolVisitPayload = {
      status: ESchoolVisitStatus.CANCELLED,
      created_by: {
        user_id: userInfo.user_id,
        user_name: userInfo.user_name,
        email: userInfo.email,
      },
      cancel_reason: reason,
      cancel_comment: comment,
    };

    const schoolVisit = await this.schoolVisitRepository.updateById(
      schoolVisitId,
      schoolVisitPayload,
    );

    await Promise.all([
      // Add school visit action log
      this.enquiryLogService.createLog({
        enquiry_id: new Types.ObjectId(enquiryId),
        event_type: EEnquiryEventType.SCHOOL_TOUR,
        event_sub_type: EEnquiryEventSubType.SCHOOL_TOUR_ACTION,
        event: EEnquiryEvent.SCHOOL_TOUR_CANCELLED,
        log_data: schoolVisit,
        created_by: userInfo?.user_name ?? null,
        created_by_id: userInfo?.user_id ?? null,
      }),
      // Update the enquiry stage
      this.updateEnquiryStage(
        enquiryId,
        enquiry_stages,
        'School Visit',
        EEnquiryStageStatus.OPEN,
      ),
      // this.axiosService
      //   .setBaseUrl(this.configService.get<string>('GATE_MANAGEMENT_URL'))
      //   .setUrl(
      //     `/gatepass/delete-scheduled-gatepass/${schoolVisit._id.toString()}`,
      //   )
      //   .setMethod(EHttpCallMethods.DELETE)
      //   .sendRequest(),
    ]);

    const recentScheduledSchoolVisitLog =
      await this.enquiryLogRepository.getMany(
        {
          enquiry_id: new Types.ObjectId(enquiryId),
          event: {
            $in: [
              EEnquiryEvent.SCHOOL_TOUR_SCHEDULED,
              EEnquiryEvent.SCHOOL_TOUR_RESCHEDULE,
            ],
          },
        },
        'desc',
      );

    const visitScheduledDate = recentScheduledSchoolVisitLog?.length
      ? recentScheduledSchoolVisitLog[0]?.log_data?.date
      : null;
    const visitScheduleTime = recentScheduledSchoolVisitLog?.length
      ? recentScheduledSchoolVisitLog[0]?.log_data?.time
      : null;

    // Send notification
    this.emailService.setEnquiryDetails(enquiryDetails).sendNotification(
      EMAIL_TEMPLATE_SLUGS.SCHOOL_TOUR_CANCELLED,
      {
        date: visitScheduledDate,
        ...SUPPORT_EMAIL_FIELDS,
      },
      [
        this.enquiryHelper.getEnquirerDetails(enquiryDetails, 'email')
          ?.email as string,
      ],
    );
    return schoolVisit;
  }

  async completeSchoolVisit(
    enquiryId: string,
    payload: CompleteSchoolVisitRequestDto,
    userInfo: Record<string, any> = null,
  ) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException('Enquiry not found', HttpStatus.NOT_FOUND);
    }

    const { enquiry_stages } = enquiryDetails;
    const { comment, activities } = payload;

    const existingSchoolVisitRecord = await this.schoolVisitRepository.getOne({
      enquiry_id: new Types.ObjectId(enquiryId),
    });

    if (!existingSchoolVisitRecord) {
      throw new HttpException(
        'School visit record not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const { _id: schoolVisitId, booked_slot_id } = existingSchoolVisitRecord;

    // Release the booked slot
    await this.slotService.releaseSlot(booked_slot_id.toString());

    // Update the existing school visit record
    const updatePayload = {
      status: ESchoolVisitStatus.COMPLETED,
      activities: activities,
      activity_comment: comment,
    };

    const schoolVisit = await this.schoolVisitRepository.updateById(
      schoolVisitId,
      updatePayload,
    );

    await Promise.all([
      // Add school visit action log
      this.enquiryLogService.createLog({
        enquiry_id: new Types.ObjectId(enquiryId),
        event_type: EEnquiryEventType.SCHOOL_TOUR,
        event_sub_type: EEnquiryEventSubType.SCHOOL_TOUR_ACTION,
        event: EEnquiryEvent.SCHOOL_TOUR_COMPLETED,
        log_data: schoolVisit,
        created_by: userInfo?.user_name ?? null,
        created_by_id: userInfo?.user_id ?? null,
      }),
      // Update the enquiry stage
      this.updateEnquiryStage(
        enquiryId,
        enquiry_stages,
        'School Visit',
        EEnquiryStageStatus.COMPLETED,
      ),
    ]);
    return schoolVisit;
  }

  async rescheduleSchoolVisit(
    enquiryId: string,
    payload: RescheduleSchoolVisitRequestDto,
    userInfo: Record<string, any> = null,
  ) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException('Enquiry not found', HttpStatus.NOT_FOUND);
    }

    const { enquiry_stages } = enquiryDetails;
    const { date, new_slot_id } = payload;

    const existingSchoolVisitRecord = await this.schoolVisitRepository.getOne({
      enquiry_id: new Types.ObjectId(enquiryId),
    });

    const slotDoc = await this.slotService.getSlotMasterById(new_slot_id);
    const [day, month, year] = date.split('-');
    const parsedDate = `${year}-${month}-${day}`;
    const logData = {
      date: moment(parsedDate).format('DD-MM-YYYY'),
      time: slotDoc.slot,
    };

    if (!existingSchoolVisitRecord) {
      throw new HttpException(
        'School visit record not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const { _id: schoolVisitId, booked_slot_id } = existingSchoolVisitRecord;

    // Book a new slot
    const bookedSlotDetails = await this.slotService.reBookSlot(
      enquiryId,
      new_slot_id,
      booked_slot_id.toString(),
      date,
      ESlotType.SCHOOL_VISIT,
    );

    // Update the existing school visit record
    const schoolVisitPayload = {
      booked_slot_id: bookedSlotDetails._id,
      ...(payload.comment ? { comment: payload.comment } : {}),
      status: ESchoolVisitStatus.SCHEDULED,
      created_by: {
        user_id: userInfo.user_id,
        user_name: userInfo.user_name,
        email: userInfo.email,
      },
      cancel_reason: null,
      cancel_comment: null,
      activities: [],
      activity_comment: null,
    };
    const schoolVisit = await this.schoolVisitRepository.updateById(
      schoolVisitId,
      schoolVisitPayload,
    );

    await Promise.all([
      // Add school visit action log
      this.enquiryLogService.createLog({
        enquiry_id: new Types.ObjectId(enquiryId),
        event_type: EEnquiryEventType.SCHOOL_TOUR,
        event_sub_type: EEnquiryEventSubType.SCHOOL_TOUR_ACTION,
        event: EEnquiryEvent.SCHOOL_TOUR_RESCHEDULE,
        log_data: { ...schoolVisit, ...logData },
        created_by: userInfo?.user_name ?? null,
        created_by_id: userInfo?.user_id ?? null,
      }),
      // Update the enquiry stage
      this.updateEnquiryStage(
        enquiryId,
        enquiry_stages,
        'School Visit',
        EEnquiryStageStatus.INPROGRESS,
      ),
      // gate management code is giving 500 error while rescheduling the school visit
      // this.axiosService
      //   .setBaseUrl(this.configService.get<string>('GATE_MANAGEMENT_URL'))
      //   .setUrl(`/gatepass/rescheduled-gatepass/${schoolVisit._id.toString()}`)
      //   .setMethod(EHttpCallMethods.PATCH)
      //   .setBody({
      //     school_visit_date: date,
      //     school_visit_time: bookedSlotDetails.slot,
      //   })
      //   .sendRequest(),
    ]);

    // Send notification
    this.emailService.setEnquiryDetails(enquiryDetails).sendNotification(
      EMAIL_TEMPLATE_SLUGS.SCHOOL_TOUR_RESCHEDULED,
      {
        school_name: `${enquiryDetails?.school_location?.value}`,
        date: logData.date,
        time: logData.time,
        contact_no: SUPPORT_EMAIL_FIELDS.contact_no,
        link: SUPPORT_EMAIL_FIELDS.link,
      },
      [
        this.enquiryHelper.getEnquirerDetails(enquiryDetails, 'email')
          ?.email as string,
      ],
    );

    return schoolVisit;
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
      ESlotType.SCHOOL_VISIT,
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
      ESlotType.SCHOOL_VISIT,
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
      ESlotType.SCHOOL_VISIT,
      unavailabilityOf,
    );

    return slots;
  }
}
