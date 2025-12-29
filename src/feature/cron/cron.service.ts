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
// import { KafkaProducerService } from '../../kafka/kafka-producer.service';
import { NotificationService } from '../../global/notification.service';


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
    // private kafkaProducer: KafkaProducerService,
    private notificationService: NotificationService,
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
  private calculateNextSchedule(startDate: Date, frequency: number): Date {
    const nextDate = new Date(startDate);
    const hoursInterval = 24 / frequency;
    nextDate.setHours(nextDate.getHours() + hoursInterval);
    return nextDate;
  }

  @Cron('0 */4 * * *') // Every 4 hours
  async processReferralReminders(): Promise<void> {
    if (!referralReminderConfig.enabled) {
      console.log('[CRON] Referral reminder system is disabled');
      return;
    }

    console.log('[CRON] Starting referral reminder job');

    try {
      const now = new Date();
      
      // Query reminders that are due
      const dueReminders = await this.reminderRepository.find({
        status: ReminderStatus.PENDING,
        next_scheduled_at: { $lte: now },
        is_verified: false,
      });

      console.log(`[CRON] Found ${dueReminders.length} due reminders`);

      // Get token for notification service (you may need to adjust this based on your auth setup)
      const token = ''; // Add logic to get token if needed
      const platform = 'web';

      for (const reminder of dueReminders) {
        try {
          // Check if max reminders reached
          if (reminder.reminder_count >= reminder.max_reminders) {
            await this.reminderRepository.updateById(reminder._id as Types.ObjectId, {
              status: ReminderStatus.COMPLETED,
            });
            continue;
          }

          // Send notification via communication module (includes both email and SMS)
          const notificationResult = await this.notificationService.sendNotification(
            {
              slug: 'Marketing related-Others-Email-Wed Dec 03 2025 14:36:19 GMT+0000 (Coordinated Universal Time)',
              employee_ids: [],
              global_ids: [],
              mail_to: [reminder.recipient_email],
              sms_to: [reminder.recipient_phone.toString().slice(-10)], // Last 10 digits for SMS
              param: {
                recipientType: reminder.recipient_type === 'parent' ? 'Parent' : 'Referrer',
                recipientName: reminder.recipient_name,
                referrerName: reminder.referral_details.referrer_name || reminder.recipient_name,
                verificationUrl: reminder.referral_details.verification_url,
                studentName: reminder.referral_details.referred_name || '',
                enquiryId: reminder.enquiry_number,
                reminderCount: reminder.reminder_count + 1,
              },
            },
            token,
            platform
          );

          // Update reminder record
          await this.reminderRepository.updateById(reminder._id as Types.ObjectId, {
            reminder_count: reminder.reminder_count + 1,
            last_sent_at: now,
            next_scheduled_at: this.calculateNextSchedule(
              now, 
              referralReminderConfig.frequency
            ),
            $push: { 
              sent_timestamps: now,
              ...(notificationResult ? {} : { error_logs: 'Notification service returned false' })
            },
          });

          // Mark as completed if max reached
          if (reminder.reminder_count + 1 >= reminder.max_reminders) {
            await this.reminderRepository.updateById(reminder._id as Types.ObjectId, {
              status: ReminderStatus.COMPLETED,
            });
          }

          console.log(`[CRON] Processed reminder for ${reminder.recipient_email} (SMS: ${reminder.recipient_phone})`);
        } catch (error) {
          console.error(`[CRON] Error processing reminder ${reminder._id}:`, error);
          await this.reminderRepository.updateById(reminder._id as Types.ObjectId, {
            $push: { error_logs: error.message },
          });
        }
      }

      console.log(`[CRON] Referral reminder job completed`);
    } catch (error) {
      console.error(`[CRON] Error in referral reminder job:`, error);
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