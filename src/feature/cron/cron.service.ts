import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { Document, Types } from 'mongoose';
import { ADMIN_PANEL_URL } from 'src/global/global.constant';
import { AxiosService, EHttpCallMethods } from 'src/global/service';

import { EnquiryRepository } from '../enquiry/enquiry.repository';
import { EnquiryRegistrationSchema } from '../enquiry/enquiry.schema';
import { EEnquiryStageStatus } from '../enquiry/enquiry.type';
import { EnquiryLogRepository } from '../enquiryLog/enquiryLog.repository';
import { EnquiryLogSchema } from '../enquiryLog/enquiryLog.schema';
import {
  EEnquiryEvent,
  EEnquiryEventSubType,
  EEnquiryEventType,
} from '../enquiryLog/enquiryLog.type';
import { EnquiryTypeRepository } from '../enquiryType/enquiryType.repository';
import { ESlotType } from '../slots/slot.type';
import { AdminPostParamDto, WorkflowActivities } from './dto/admin.dto';
import { ReferralReminderService } from '../referralReminder/referralReminder.service';
import { referralReminderConfig } from '../../config/referral-reminder.config';

@Injectable()
export class CronService {
  constructor(
    private enquiryRepository: EnquiryRepository,
    private enquiryLogRepository: EnquiryLogRepository,
    private enquiryTypeRepository: EnquiryTypeRepository,
    private axiosService: AxiosService,
    private configService: ConfigService,
    private referralReminderService: ReferralReminderService, 
  ) {}

  async getDefaultCompetencyTestWorkflow(): Promise<WorkflowActivities> {
    const workflowDoc = await this.axiosService
      .setBaseUrl(`${this.configService.get<string>('ADMIN_PANEL_URL')}`)
      .setMethod(EHttpCallMethods.GET)
      .setUrl(
        `${ADMIN_PANEL_URL.GET_MASTER_DETAILS}?type=Workflows&subType=Marketing workflows`,
      )
      .sendRequest();
    if (workflowDoc.status !== HttpStatus.OK) {
      throw new NotFoundException();
    }
    const competencyTestStage = workflowDoc.data.data.find(
      (workflow) => workflow.stage === ESlotType.COMPETENCY_TEST,
    );
    const defaultWorkFlowActivity =
      competencyTestStage.workflow_activities.find(
        (activity) => activity.is_default,
      );

    return defaultWorkFlowActivity;
  }

  async triggerWorkflow(id: number, dto: AdminPostParamDto) {
    const param = {
      activity_slug: dto.activity_slug,
      subject_variables: {
        enquiry_no: dto.enquiry_number,
      },
      description_variables: {
        enquiry_no: dto.enquiry_number,
      },
      module_name: dto.module_name,
      module_id: '1',
      reference_id: dto.enquiry_number,
      attachment_links: [],
      lob_id: `${dto.school_id}`,
    };

    // TODO: Either create a token through keycloak API and pass it in the below API call or remove auth for this admin panel API
    return this.axiosService
      .setBaseUrl(`${this.configService.get<string>('ADMIN_PANEL_URL')}`)
      .setMethod(EHttpCallMethods.POST)
      .setUrl(`${ADMIN_PANEL_URL.POST_WORKFLOW_LOGS}/${id}`)
      .setBody(param)
      .sendRequest();
  }

  
  @Cron('0 */4 * * *') // Every 4 hours
  async processReferralReminders(): Promise<void> {
    const now = new Date();
    
    // Query reminders that are due
    const dueReminders = await this.reminderRepository.find({
      status: ReminderStatus.PENDING,
      next_scheduled_at: { $lte: now },
      reminder_count: { $lt: this.maxReminders },
      is_verified: false,
    });

    for (const reminder of dueReminders) {
      try {
        // Send to Kafka for async processing
        await this.kafkaProducer.sendMessage(
          'referral-reminders',
          {
            reminder_id: reminder._id.toString(),
            enquiry_id: reminder.enquiry_id.toString(),
            enquiry_number: reminder.enquiry_number,
            recipient_type: reminder.recipient_type,
            recipient_email: reminder.recipient_email,
            recipient_phone: reminder.recipient_phone,
            recipient_name: reminder.recipient_name,
            verification_url: reminder.referral_details.verification_url,
            reminder_count: reminder.reminder_count,
          }
        );

        // Update reminder record
        await this.reminderRepository.updateById(reminder._id, {
          reminder_count: reminder.reminder_count + 1,
          last_sent_at: now,
          next_scheduled_at: this.calculateNextSchedule(
            now, 
            referralReminderConfig.frequency
          ),
          $push: { sent_timestamps: now },
        });

        // Mark as completed if max reached
        if (reminder.reminder_count + 1 >= reminder.max_reminders) {
          await this.reminderRepository.updateById(reminder._id, {
            status: ReminderStatus.COMPLETED,
          });
        }
      } catch (error) {
        await this.reminderRepository.updateById(reminder._id, {
          $push: { error_logs: error.message },
        });
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async workflowService(): Promise<void> {
    const enquiryDoc: Partial<EnquiryRegistrationSchema & Document>[] =
      await this.enquiryRepository.getMany({
        $and: [
          {
            $or: [
              {
                'other_details.competency_test_tat_exceeded_cron': {
                  $exists: false,
                },
              },
              {
                'other_details.competency_test_tat_exceeded_cron': {
                  $eq: false,
                },
              },
            ],
          },
          { status: EEnquiryStageStatus.OPEN },
          {
            enquiry_stages: {
              $elemMatch: {
                stage_name: ESlotType.COMPETENCY_TEST,
                status: EEnquiryStageStatus.INPROGRESS,
              },
            },
          },
        ],
      });

    if (!enquiryDoc.length) {
      return;
    }

    const workFlowActivity = await this.getDefaultCompetencyTestWorkflow();
    if (!workFlowActivity) {
      return;
    }

    for (const data of enquiryDoc) {
      const enquiryLog: EnquiryLogSchema & Document & { created_at?: Date } =
        await this.enquiryLogRepository.getOne({
          enquiry_id: data._id,
          event_type: EEnquiryEventType.COMPETENCY_TEST,
          event_sub_type: EEnquiryEventSubType.COMPETENCY_TEST_ACTION,
          event: EEnquiryEvent.COMPETENCY_TEST_SCHEDULED,
        });

      if (!enquiryLog) {
        continue;
      }
      const id: Types.ObjectId = data._id as Types.ObjectId;
      const stages = data.enquiry_stages.find(
        (stage) => stage.stage_name === ESlotType.COMPETENCY_TEST,
      );

      const enquiryTypeDoc = await this.enquiryTypeRepository.getById(
        data.enquiry_type_id,
      );

      if (!enquiryTypeDoc) {
        continue;
      }

      const enquiryTypeStage = enquiryTypeDoc.stages.find((stage_enq) =>
        new Types.ObjectId(stage_enq.stage_id).equals(
          new Types.ObjectId(stages.stage_id),
        ),
      );

      if (enquiryTypeStage?.workflow && enquiryLog?.created_at) {
        const currentTime = moment(enquiryLog?.created_at);
        const calculatedTime = moment(currentTime).add(
          enquiryTypeStage?.tat?.value ?? 0,
          enquiryTypeStage?.tat?.unit ?? 'second',
        );

        if (calculatedTime > currentTime) {
          const params = {
            ...workFlowActivity,
            enquiry_number: data?.enquiry_number,
            school_id: data?.school_location?.id,
          };
          console.log(data.id);
          await this.enquiryRepository.updateById(id, {
            'other_details.competency_test_tat_exceeded_cron': true,
          });
          this.triggerWorkflow(data?.created_by?.user_id, params);
        }
      }
    }
  }
}
