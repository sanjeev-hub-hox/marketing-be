import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ReferralReminderService } from './referralReminder.service';
import { ReminderRepository } from './referralReminder.repository';
import { EnquiryRepository } from '../enquiry/enquiry.repository';
import { Types } from 'mongoose';

@Controller('referral-reminders')
export class ReferralReminderController {
  constructor(
    private readonly reminderService: ReferralReminderService,
    private readonly reminderRepository: ReminderRepository,
    private readonly enquiryRepository: EnquiryRepository,
  ) {}

  /**
   * GET /marketing/referral-reminders/list
   * List all reminders
   */
  @Get('list')
  async listReminders(@Query('status') status?: string) {
    const query = status ? { status } : {};
    const reminders = await this.reminderRepository.find(query);
    
    return {
      total: reminders.length,
      reminders: reminders.map(r => ({
        id: r._id,
        enquiry_number: r.enquiry_number,
        recipient_type: r.recipient_type,
        recipient_email: r.recipient_email,
        recipient_name: r.recipient_name,
        status: r.status,
        reminder_count: r.reminder_count,
        max_reminders: r.max_reminders,
        next_scheduled_at: r.next_scheduled_at,
        is_verified: r.is_verified,
        last_sent_at: r.last_sent_at,
      }))
    };
  }

  /**
   * GET /marketing/referral-reminders/due
   * List reminders that are due now
   */
  @Get('due')
  async getDueReminders() {
    const now = new Date();
    const dueReminders = await this.reminderRepository.find({
      status: 'pending',
      next_scheduled_at: { $lte: now },
      is_verified: false,
    });

    return {
      total: dueReminders.length,
      current_time: now.toISOString(),
      reminders: dueReminders.map(r => ({
        id: r._id,
        enquiry_number: r.enquiry_number,
        recipient_email: r.recipient_email,
        next_scheduled_at: r.next_scheduled_at,
        is_overdue: now > r.next_scheduled_at,
        minutes_overdue: Math.floor((now.getTime() - r.next_scheduled_at.getTime()) / 60000),
      }))
    };
  }

  /**
   * POST /marketing/referral-reminders/create-for-enquiry/:enquiryId
   * Manually create reminders for an enquiry (testing)
   */
  @Post('create-for-enquiry/:enquiryId')
  async createRemindersForEnquiry(@Param('enquiryId') enquiryId: string) {
    const enquiry = await this.enquiryRepository.getById(new Types.ObjectId(enquiryId));
    
    if (!enquiry) {
      return { error: 'Enquiry not found' };
    }

    // Check if enquiry has referral source
    const hasReferral = 
      enquiry.other_details?.enquiry_employee_source_id ||
      enquiry.other_details?.enquiry_parent_source_id ||
      enquiry.enquiry_school_source?.id ||
      enquiry.other_details?.enquiry_corporate_source_id;

    if (!hasReferral) {
      return { 
        error: 'No referral source found',
        enquiry_number: enquiry.enquiry_number,
        message: 'This enquiry does not have any referral source (employee/parent/corporate/school)'
      };
    }

    // Create reminders
    await this.reminderService.createReminderRecords(enquiry);

    // Fetch created reminders
    const reminders = await this.reminderRepository.find({
      enquiry_id: new Types.ObjectId(enquiryId)
    });

    return {
      success: true,
      enquiry_number: enquiry.enquiry_number,
      reminders_created: reminders.length,
      reminders: reminders.map(r => ({
        recipient_type: r.recipient_type,
        recipient_email: r.recipient_email,
        next_scheduled_at: r.next_scheduled_at,
      }))
    };
  }

  /**
   * POST /marketing/referral-reminders/send-initial/:enquiryId
   * Manually send initial notification for an enquiry (testing)
   */
  @Post('send-initial/:enquiryId')
  async sendInitialNotification(
    @Param('enquiryId') enquiryId: string,
    @Body() body: { token?: string; platform?: string }
  ) {
    const enquiry = await this.enquiryRepository.getById(new Types.ObjectId(enquiryId));
    
    if (!enquiry) {
      return { error: 'Enquiry not found' };
    }

    const token = body.token || '';
    const platform = body.platform || 'web';

    await this.reminderService.sendInitialNotification(enquiry, token, platform);

    return {
      success: true,
      enquiry_number: enquiry.enquiry_number,
      message: 'Initial notifications sent'
    };
  }

  /**
   * GET /marketing/referral-reminders/stats
   * Get reminder statistics
   */
  @Get('stats')
  async getStats() {
    const all = await this.reminderRepository.find({});
    const pending = all.filter(r => r.status === 'pending');
    const sent = all.filter(r => r.status === 'sent');
    const completed = all.filter(r => r.status === 'completed');
    const failed = all.filter(r => r.status === 'failed');
    
    const now = new Date();
    const due = pending.filter(r => r.next_scheduled_at <= now);

    return {
      total: all.length,
      by_status: {
        pending: pending.length,
        sent: sent.length,
        completed: completed.length,
        failed: failed.length,
      },
      due_now: due.length,
      total_reminders_sent: all.reduce((sum, r) => sum + r.reminder_count, 0),
    };
  }
}