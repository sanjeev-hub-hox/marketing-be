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
    } catch (error) {
      console.error('[KAFKA CONSUMER] ❌ Failed to initialize:', error.message);
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
      if (this.processedMessages.has(data.messageId)) {
        console.log(`[KAFKA CONSUMER] ⏭️ Message ${data.messageId} already processed, skipping`);
        return;
      }

      const scheduledDate = new Date(data.scheduledFor);
      const now = new Date();
      
      if (scheduledDate > now) {
        const minutesUntil = Math.round((scheduledDate.getTime() - now.getTime()) / 60000);
        console.log(`[KAFKA CONSUMER] ⏰ Message ${data.messageId} scheduled for ${scheduledDate.toISOString()} (in ${minutesUntil} minutes)`);
        return;
      }

      if (this.verificationTracker.isVerified(data.enquiryId, data.recipientType)) {
        console.log(`[KAFKA CONSUMER] ✅ Enquiry ${data.enquiryId} already verified by ${data.recipientType}, skipping`);
        this.processedMessages.add(data.messageId);
        return;
      }

      console.log(`[KAFKA CONSUMER] 📧 Sending reminder ${data.reminderCount}/${data.maxReminders} to ${data.recipientEmail}`);

      const result = await this.notificationService.sendNotification(
        {
          slug: 'Marketing related-Others-Email-Wed Dec 03 2025 14:36:19 GMT+0000 (Coordinated Universal Time)',
          employee_ids: [],
          global_ids: [],
          mail_to: [data.recipientEmail],
          sms_to: [data.recipientPhone.toString().slice(-10)],
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

      if (result) {
        this.processedMessages.add(data.messageId);
        console.log(`[KAFKA CONSUMER] ✅ Successfully sent reminder to ${data.recipientEmail}`);
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

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.consumer.disconnect();
      console.log('[KAFKA CONSUMER] Disconnected');
    }
  }
}