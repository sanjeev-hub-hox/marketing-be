import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer, Admin } from 'kafkajs';
import { NotificationService } from '../global/notification.service';
import { VerificationTrackerService } from '../feature/referralReminder/verificationTracker.service';
import { referralReminderConfig } from '../config/referral-reminder.config';
import { ReminderMessage, VerificationMessage } from '../feature/referralReminder/referralReminder.types';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;
  private admin: Admin;
  private isConnected = false;
  private processedMessages: Set<string> = new Set();
  private messageQueue: ReminderMessage[] = [];
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private verificationTracker: VerificationTrackerService,
  ) {
    const kafkaUrl = this.configService.get('KAFKA_HOST_URL');
    const brokers = kafkaUrl ? kafkaUrl.split(',') : [];
    
    if (brokers.length === 0) {
      console.log('[KAFKA CONSUMER] No Kafka brokers configured');
      return;
    }

    console.log('[KAFKA CONSUMER] Initializing with brokers:', brokers);
    
    this.kafka = new Kafka({
      clientId: this.configService.get('KAFKA_CLIENT_ID') || 'marketing-service-consumer',
      brokers,
      retry: {
        initialRetryTime: 300,
        retries: 8
      }
    });
    
    this.consumer = this.kafka.consumer({ 
      groupId: this.configService.get('KAFKA_CONSUMER_GROUP_ID') || 'referral-reminder-group',
      retry: {
        initialRetryTime: 300,
        retries: 8
      }
    });
    
    this.admin = this.kafka.admin();
  }

  async onModuleInit() {
    try {
      if (!referralReminderConfig.enabled) {
        console.log('[KAFKA CONSUMER] Referral reminder system is disabled');
        return;
      }

      const kafkaUrl = this.configService.get('KAFKA_HOST_URL');
      if (!kafkaUrl) {
        console.log('[KAFKA CONSUMER] KAFKA_HOST_URL not configured, skipping initialization');
        return;
      }

      console.log('[KAFKA CONSUMER] Connecting to Kafka at:', kafkaUrl);
      await this.consumer.connect();
      console.log('[KAFKA CONSUMER] ✅ Connected successfully');

      await this.ensureTopicsExist([
        referralReminderConfig.kafkaTopic,
        referralReminderConfig.verificationTopic
      ]);

      await this.consumer.subscribe({ 
        topics: [
          referralReminderConfig.kafkaTopic,
          referralReminderConfig.verificationTopic
        ],
        fromBeginning: false 
      });
      console.log('[KAFKA CONSUMER] ✅ Subscribed to topics:', [
        referralReminderConfig.kafkaTopic,
        referralReminderConfig.verificationTopic
      ]);

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const data = JSON.parse(message.value.toString());
            
            console.log(`[KAFKA CONSUMER] 📨 Received message from topic: ${topic}`);
            
            if (topic === referralReminderConfig.kafkaTopic) {
              await this.processReminderMessage(data);
            } else if (topic === referralReminderConfig.verificationTopic) {
              await this.processVerificationMessage(data);
            }
          } catch (error) {
            console.error('[KAFKA CONSUMER] ❌ Error processing message:', error.message);
          }
        },
      });

      this.isConnected = true;
      console.log('[KAFKA CONSUMER] ✅ Consumer is running and listening for messages');
      this.startMessagePolling();
    } catch (error) {
      console.error('[KAFKA CONSUMER] ❌ Failed to initialize:', error.message);
    }

  }

  private startMessagePolling(): void {
    console.log('[KAFKA CONSUMER] Starting message polling every 30 seconds');
    
    this.pollingInterval = setInterval(() => {
      this.processQueuedMessages();
    }, 30000); // Poll every 30 seconds
  }

  private async processQueuedMessages(): Promise<void> {
    if (this.messageQueue.length === 0) {
      return;
    }

    console.log(`[KAFKA CONSUMER] 🔄 Processing ${this.messageQueue.length} queued messages`);
    
    const now = new Date();
    const messagesToProcess = [];
    const messagesToKeep = [];

    // Separate messages that are ready vs still in future
    for (const message of this.messageQueue) {
      const scheduledDate = new Date(message.scheduledFor);
      
      if (scheduledDate <= now) {
        messagesToProcess.push(message);
      } else {
        messagesToKeep.push(message);
      }
    }

    // Update queue
    this.messageQueue = messagesToKeep;

    // Process ready messages
    for (const message of messagesToProcess) {
      await this.processReminderMessage(message);
    }
    
    if (messagesToProcess.length > 0) {
      console.log(`[KAFKA CONSUMER] ✅ Processed ${messagesToProcess.length} messages. ${this.messageQueue.length} still in queue`);
    }
  }

  async onModuleDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      console.log('[KAFKA CONSUMER] Stopped message polling');
    }
    
    if (this.isConnected) {
      await this.consumer.disconnect();
      console.log('[KAFKA CONSUMER] Disconnected');
    }
  }

  

  async ensureTopicsExist(topics: string[]): Promise<void> {
    try {
      await this.admin.connect();
      
      const existingTopics = await this.admin.listTopics();
      const topicsToCreate = topics.filter(t => !existingTopics.includes(t));
      
      if (topicsToCreate.length > 0) {
        console.log(`[KAFKA CONSUMER] Creating topics:`, topicsToCreate);
        
        await this.admin.createTopics({
          topics: topicsToCreate.map(topic => ({
            topic,
            numPartitions: 3,
            replicationFactor: 1,
          })),
        });
        
        console.log('[KAFKA CONSUMER] ✅ Topics created successfully');
      } else {
        console.log('[KAFKA CONSUMER] ✅ All topics already exist');
      }
      
      await this.admin.disconnect();
    } catch (error) {
      console.error('[KAFKA CONSUMER] ❌ Error ensuring topics exist:', error.message);
      await this.admin.disconnect();
    }
  }

  async processReminderMessage(data: ReminderMessage): Promise<void> {
    try {
      // Deduplication check
      if (this.processedMessages.has(data.messageId)) {
        console.log(`[KAFKA CONSUMER] ⏭️ Message ${data.messageId} already processed, skipping`);
        return;
      }

      // Check if already verified
      if (this.verificationTracker.isVerified(data.enquiryId, data.recipientType)) {
        console.log(`[KAFKA CONSUMER] ✅ Enquiry ${data.enquiryId} already verified by ${data.recipientType}, skipping`);
        this.processedMessages.add(data.messageId);
        return;
      }

      console.log(`[KAFKA CONSUMER] 📧 Sending reminder ${data.reminderCount}/${data.maxReminders} to ${data.recipientEmail}`);

      // Format phone number (last 10 digits)
      const formattedPhone = data.recipientPhone.toString().slice(-10);

      // Try notification service first (includes both email and SMS)
      let notificationSuccess = false;
      try {
        notificationSuccess = await this.notificationService.sendNotification(
          {
            slug: 'Marketing related-Others-Email-Wed Dec 03 2025 14:36:19 GMT+0000 (Coordinated Universal Time)',
            employee_ids: [],
            global_ids: [],
            mail_to: [data.recipientEmail],
            sms_to: [formattedPhone],
            param: {
              recipientType: data.recipientType === 'parent' ? 'Parent' : 'Referrer',
              recipientName: data.recipientName,
              referrerName: data.referrerName || data.recipientName,
              verificationUrl: data.verificationUrl,
              studentName: data.referredName || '',
              enquiryId: data.enquiryNumber,
              reminderCount: data.reminderCount,
              maxReminders: data.maxReminders,
            },
          },
          '',
          'web',
        );
      } catch (error) {
        console.error(`[KAFKA CONSUMER] ⚠️ Notification service error: ${error.message}`);
      }

      // If notification service fails, send SMS directly as fallback
      if (!notificationSuccess) {
        console.log(`[KAFKA CONSUMER] 📱 Falling back to direct SMS gateway`);
        
        // Build SMS message using template
        const { buildSmsMessage, SmsTemplateType } = await import('../config/sms-templates.config');
        
        const smsMessage = buildSmsMessage(SmsTemplateType.REFERRAL_VERIFICATION, {
          recipientName: data.recipientName,
          verificationUrl: data.verificationUrl,
        });

        const smsSuccess = await this.notificationService.sendDirectSMS(
          formattedPhone,
          smsMessage
        );

        if (smsSuccess) {
          console.log(`[KAFKA CONSUMER] ✅ SMS sent successfully via direct gateway`);
          notificationSuccess = true;
        }
      }

      if (notificationSuccess) {
        this.processedMessages.add(data.messageId);
        console.log(`[KAFKA CONSUMER] ✅ Successfully sent reminder to ${data.recipientEmail} / ${formattedPhone}`);
      } else {
        console.error(`[KAFKA CONSUMER] ❌ Failed to send reminder via all channels`);
      }
    } catch (error) {
      console.error(`[KAFKA CONSUMER] ❌ Error processing reminder:`, error.message);
    }
  }

  async processVerificationMessage(data: VerificationMessage): Promise<void> {
    try {
      this.verificationTracker.markAsVerified(data.enquiryId, data.verifiedBy);
      console.log(`[KAFKA CONSUMER] ✅ Verification processed for enquiry ${data.enquiryId} by ${data.verifiedBy}`);
    } catch (error) {
      console.error(`[KAFKA CONSUMER] ❌ Error processing verification:`, error.message);
    }
  }

  isConsumerConnected(): boolean {
    return this.isConnected;
  }
}