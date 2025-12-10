export interface ReferralReminderConfig {
  enabled: boolean;
  frequency: number;
  duration: number;
  kafkaTopic: string;
  verificationTopic: string;
}

export const referralReminderConfig: ReferralReminderConfig = {
  enabled: process.env.REFERRAL_REMINDER_ENABLED === 'true' || true,
  // frequency: parseInt(process.env.REFERRAL_REMINDER_FREQUENCY) || 2, // 2 times per day
  // duration: parseInt(process.env.REFERRAL_REMINDER_DURATION) || 15, // 15 days
  frequency: parseInt(process.env.REFERRAL_REMINDER_FREQUENCY) || 480, // 480 = every 3 minutes
  duration: parseFloat(process.env.REFERRAL_REMINDER_DURATION) || 0.00625, // ~9 minutes total
  kafkaTopic: process.env.KAFKA_TOPIC_NAME_REFERRAL_REMINDERS || 'referral_reminders',
  verificationTopic: process.env.KAFKA_TOPIC_NAME_REFERRAL_VERIFICATIONS || 'referral_verifications',
};