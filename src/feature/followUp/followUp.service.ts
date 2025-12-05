import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { Types } from 'mongoose';

import { EnquiryRepository } from '../enquiry/enquiry.repository';
import { EEnquiryStageStatus, EEnquiryStatus } from '../enquiry/enquiry.type';
import { EnquiryLogService } from '../enquiryLog/enquiryLog.service';
import {
  EEnquiryEvent,
  EEnquiryEventSubType,
  EEnquiryEventType,
} from '../enquiryLog/enquiryLog.type';
import { MyTaskRepository } from '../myTask/myTask.repository';
import { FollowUpRepository } from './followUp.repository';
import { EFollowUpMode } from './followUp.type';

@Injectable()
export class FollowUpService {
  constructor(
    public readonly configService: ConfigService,
    private followUpRepository: FollowUpRepository,
    private enquiryRepository: EnquiryRepository,
    private myTaskRespository: MyTaskRepository,
    private enquiryLogService: EnquiryLogService,
  ) {}
  /**
   *
   */
  async createFollowUp(enquiryId: string, payload: Record<string, any>) {
    const {
      mode,
      reminder_details,
      close_enquiry_details,
      created_by,
      date,
      time,
    } = payload;
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException('Enquiry not found', HttpStatus.NOT_FOUND);
    }

    const isFollowUpTimeValid = await this.isFollowUpTimeValid(
      date,
      time,
      enquiryId,
    );
    if (!isFollowUpTimeValid.status) {
      throw new HttpException(
        isFollowUpTimeValid.message,
        HttpStatus.BAD_REQUEST,
      );
    }

    const enquiryModes = [];
    if (mode.length) {
      mode.map((followUpMode) => {
        switch (followUpMode) {
          case EFollowUpMode.call:
          case EFollowUpMode.cell:
            enquiryModes.push(EEnquiryEvent.FOLLOW_UP_CALL);
            break;
          case EFollowUpMode.email:
            enquiryModes.push(EEnquiryEvent.FOLLOW_UP_EMAIL);
            break;
          case EFollowUpMode.virtualMeeting:
            enquiryModes.push(EEnquiryEvent.FOLLOW_UP_VIRTUAL_MEETING);
            break;
          case EFollowUpMode.physicalMeeting:
            enquiryModes.push(EEnquiryEvent.FOLLOW_UP_PHYSICAL_MEETING);
            break;
        }
      });
    }

    if (close_enquiry_details) {
      const { status, reason } = close_enquiry_details;
      await Promise.all([
        this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
          status: EEnquiryStatus.CLOSED,
        }),
        this.enquiryLogService.createLog({
          enquiry_id: new Types.ObjectId(enquiryId),
          event_type: EEnquiryEventType.ENQUIRY,
          event_sub_type: EEnquiryEventSubType.ENQUIRY_ACTION,
          event: EEnquiryEvent.ENQUIRY_CLOSED,
          log_data: {
            status: status,
            message: reason,
          },
          created_by: created_by.user_name,
          created_by_id: created_by.user_id,
        }),
      ]);
    }

    await Promise.all([
      this.followUpRepository.create({
        ...payload,
        enquiry_id: new Types.ObjectId(enquiryId),
      }),
      this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
        next_follow_up_at: new Date(date),
      }),
      ...enquiryModes.map((mode: EEnquiryEvent) => {
        return this.enquiryLogService.createLog({
          enquiry_id: new Types.ObjectId(enquiryId),
          event_type: EEnquiryEventType.FOLLOW_UP,
          event_sub_type: EEnquiryEventSubType.FOLLOW_UP_ACTION,
          event: mode,
          log_data: {
            date: moment(date).format('DD-MM-YYYY'),
            time: moment(time, ['HH:mm']).format('hh:mm A'),
            remarks: payload?.remarks,
          },
          created_by: created_by.user_name,
          created_by_id: created_by.user_id,
        });
      }),
    ]);

    const { enquiry_stages } = enquiryDetails;

    const isReminderSet = reminder_details ? true : false;

    // Get the current in progress stage name
    const inProgressStageName = enquiry_stages.reverse().find((stage) => {
      return stage.status == EEnquiryStageStatus.INPROGRESS;
    })?.stage_name;

    const tPlusFiveDate = new Date();
    tPlusFiveDate.setDate(new Date().getDate() + 1);
    tPlusFiveDate.setHours(23, 59, 59, 999);

    // Get the task created against the in progress stage
    const inProgressStageTask = await this.myTaskRespository.getOne({
      enquiry_id: new Types.ObjectId(enquiryId as string),
      created_for_stage: inProgressStageName,
      is_closed: false,
    });

    if (!inProgressStageTask) {
      // If there is no in progress open task found against this enquiry, then either all the three tasks were created and closed or TAT exceeded CRON closed it after creating the third task
      return;
    }

    // Overriding the valid from and valid till date as per today's follow up
    if (inProgressStageTask.task_creation_count < 3) {
      if (isReminderSet) {
        const { date, time } = reminder_details;
        const [hours, minutes] = time.split(':');
        const formattedDate = date.split('-').reverse().join('-');

        const validTillDate = new Date(formattedDate);
        validTillDate.setHours(hours);
        validTillDate.setMinutes(minutes);

        await this.myTaskRespository.updateById(inProgressStageTask._id, {
          valid_from: new Date(),
          valid_till: validTillDate,
          task_creation_count: inProgressStageTask.task_creation_count + 1,
        });
      } else {
        await this.myTaskRespository.updateById(inProgressStageTask._id, {
          valid_from: new Date(),
          valid_till: tPlusFiveDate,
          task_creation_count: inProgressStageTask.task_creation_count + 1,
        });
      }
    } else {
      // Closing the in progress stage task because follow up is taken against the third task
      await this.myTaskRespository.updateById(inProgressStageTask._id, {
        is_closed: true,
      });
    }
    return;
  }

  async isFollowUpTimeValid(
    newFollowUpDate: string,
    newFollowUpTime: string,
    enquiryId: string,
  ) {
    const enquiryFollowUps = await this.followUpRepository.getMany(
      { enquiry_id: new Types.ObjectId(enquiryId) },
      { created_at: -1 },
    );
    if (!enquiryFollowUps?.length) {
      return { status: true, message: '' };
    }

    const { date: lastFollowUpDate, time: lastFollowUpTime } =
      enquiryFollowUps[0];

    const [lastFollowUpHour, lastFollowUpMinutes, lastFollowUpSeconds] =
      lastFollowUpTime.split(':');
    const [newFollowUpHour, newFollowUpMinutes, newFollowUpSeconds] =
      newFollowUpTime.split(':');

    const [lastFollowUpYear, lastFollowUpMonth, lastFollowUpDay] =
      lastFollowUpDate.split('-');
    const [newFollowUpYear, newFollowUpMonth, newFollowUpDay] =
      newFollowUpDate.split('-');

    if (
      new Date(
        `${newFollowUpYear}-${newFollowUpMonth}-${newFollowUpDay} ${newFollowUpHour}:${newFollowUpMinutes}:${newFollowUpSeconds}`,
      ) <
      new Date(
        `${lastFollowUpYear}-${lastFollowUpMonth}-${lastFollowUpDay} ${lastFollowUpHour}:${lastFollowUpMinutes}:${lastFollowUpSeconds}`,
      )
    ) {
      return {
        status: false,
        message: `Follow up time must be greater than the last follow up date time which is ${lastFollowUpDay}-${lastFollowUpMonth}-${lastFollowUpYear} ${lastFollowUpHour}:${lastFollowUpMinutes}`,
      };
    }

    return {
      status: true,
      message: 'New follow up time is valid',
    };
  }
}
