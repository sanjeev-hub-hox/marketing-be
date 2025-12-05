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
import { ReminderRepository } from '../referralReminder/referralReminder.repository';
import { ReminderStatus } from '../referralReminder/referralReminder.schema';
import { referralReminderConfig } from '../../config/referral-reminder.config';
import { KafkaProducerService } from '../../kafka/kafka-producer.service';

@Injectable()
export class CronService {
  constructor(
    private enquiryRepository: EnquiryRepository,
    private enquiryLogRepository: EnquiryLogRepository,
    private enquiryTypeRepository: EnquiryTypeRepository,
    private axiosService: AxiosService,
    private configService: ConfigService,
    private referralReminderService: ReferralReminderService,
    private reminderRepository: ReminderRepository,
    private kafkaProducer: KafkaProducerService,
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

    return this.axiosService
      .setBaseUrl(`${this.configService.get<string>('ADMIN_PANEL_URL')}`)
      .setMethod(EHttpCallMethods.POST)
      .setUrl(`${ADMIN_PANEL_URL.POST_WORKFLOW_LOGS}/${id}`)
      .setBody(param)
      .sendRequest();
  }

  /**
   * Calculate next scheduled date based on frequency
   */
  private calculateNextSchedule(currentDate: Date, frequency: number): Date {
    const nextDate = new Date(currentDate);
    const intervalMinutes = Math.floor((24 * 60) / frequency);
    nextDate.setMinutes(nextDate.getMinutes() + intervalMinutes);
    return nextDate;
  }

  @Cron(referralReminderConfig.cronSchedule)
  async processReferralReminders(): Promise<void> {
    if (!referralReminderConfig.enabled) {
      console.log('[CRON] Referral reminder system is disabled');
      return;
    }

    const now = new Date();
    console.log(`[CRON] Starting referral reminder job at: ${now.toISOString()}`);

    try {
      // Query reminders that are:
      // 1. PENDING status
      // 2. Due now (next_scheduled_at <= now)
      // 3. Not yet verified
      const dueReminders = await this.reminderRepository.find({
        status: ReminderStatus.PENDING,
        next_scheduled_at: { $lte: now },
        is_verified: false,
      });

      console.log(`[CRON] Found ${dueReminders.length} due reminders to process`);

      if (dueReminders.length === 0) {
        console.log('[CRON] No due reminders found');
        return;
      }

      for (const reminder of dueReminders) {
        try {
          console.log(`[CRON] Processing reminder ${reminder._id} for ${reminder.recipient_email}`);

          // 🔥 FIX #2: Check if max reminders reached BEFORE processing
          if (reminder.reminder_count >= reminder.max_reminders) {
            console.log(`[CRON] Reminder ${reminder._id} reached max count (${reminder.max_reminders}), marking as completed`);
            
            await this.reminderRepository.updateById(reminder._id as Types.ObjectId, {
              status: ReminderStatus.COMPLETED,
            });
            continue;
          }

          // 🔥 FIX #3: Check if end date passed
          if (reminder.end_date && new Date(reminder.end_date) < now) {
            console.log(`[CRON] Reminder ${reminder._id} end date passed, marking as completed`);
            
            await this.reminderRepository.updateById(reminder._id as Types.ObjectId, {
              status: ReminderStatus.COMPLETED,
            });
            continue;
          }

          // Send message to Kafka queue
          const kafkaMessage = {
            reminder_id: reminder._id.toString(),
            enquiry_id: reminder.enquiry_id.toString(),
            enquiry_number: reminder.enquiry_number,
            recipient_type: reminder.recipient_type,
            recipient_email: reminder.recipient_email,
            recipient_phone: reminder.recipient_phone,
            recipient_name: reminder.recipient_name,
            verification_url: reminder.referral_details?.verification_url,
            reminder_count: reminder.reminder_count,
            referrer_name: reminder.referral_details?.referrer_name,
            referred_name: reminder.referral_details?.referred_name,
          };

          const sent = await this.kafkaProducer.sendMessage(
            referralReminderConfig.kafkaTopic || 'referral-notifications',
            kafkaMessage
          );

          if (!sent) {
            console.error(`[CRON] Failed to send reminder ${reminder._id} to Kafka`);
            
            await this.reminderRepository.updateById(reminder._id as Types.ObjectId, {
              $push: { error_logs: `${now.toISOString()}: Failed to send to Kafka` },
            });
            continue;
          }

          // 🔥 FIX #4: Update reminder record with correct next schedule
          const newReminderCount = reminder.reminder_count + 1;
          const nextSchedule = this.calculateNextSchedule(now, referralReminderConfig.frequency);

          console.log(`[CRON] Reminder ${reminder._id} queued. Count: ${newReminderCount}/${reminder.max_reminders}, Next: ${nextSchedule.toISOString()}`);

          await this.reminderRepository.updateById(reminder._id as Types.ObjectId, {
            reminder_count: newReminderCount,
            last_sent_at: now,
            next_scheduled_at: nextSchedule,
            $push: { sent_timestamps: now },
          });

          // Mark as completed if this was the last reminder
          if (newReminderCount >= reminder.max_reminders) {
            console.log(`[CRON] Reminder ${reminder._id} completed (sent ${newReminderCount}/${reminder.max_reminders})`);
            
            await this.reminderRepository.updateById(reminder._id as Types.ObjectId, {
              status: ReminderStatus.COMPLETED,
            });
          }

        } catch (error) {
          console.error(`[CRON] Error processing reminder ${reminder._id}:`, error);
          
          await this.reminderRepository.updateById(reminder._id as Types.ObjectId, {
            $push: { error_logs: `${now.toISOString()}: ${error.message}` },
          });
        }
      }

      console.log(`[CRON] Referral reminder job completed at: ${new Date().toISOString()}`);
    } catch (error) {
      console.error(`[CRON] Fatal error in referral reminder job:`, error);
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