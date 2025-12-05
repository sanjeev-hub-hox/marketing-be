//! import master api to fetch the configs data 

export interface ReferralReminderConfig {
  enabled: boolean;
  frequency: number; // Number of reminders per day
  duration: number; // Number of days to send reminders
  cronSchedule: string; // Cron expression for scheduler
  kafkaTopic?: string;
}

export const referralReminderConfig: ReferralReminderConfig = {
  enabled: process.env.REFERRAL_REMINDER_ENABLED === 'true' || true,
  frequency: parseInt(process.env.REFERRAL_REMINDER_FREQUENCY) || 5, // 5 times per day
  duration: parseInt(process.env.REFERRAL_REMINDER_DURATION) || 3, // 3 days
  cronSchedule: process.env.REFERRAL_REMINDER_CRON || '*/2 * * * *', // Every 2 mins
  // cronSchedule: process.env.REFERRAL_REMINDER_CRON || '0 */4 * * *', // Every 4 hours
  kafkaTopic: process.env.KAFKA_REFERRAL_TOPIC || 'referral-notifications',
};