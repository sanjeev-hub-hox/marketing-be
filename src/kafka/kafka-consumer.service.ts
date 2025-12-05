import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer, Admin } from 'kafkajs';
import { NotificationService } from '../global/notification.service';
import { ReminderRepository } from '../feature/referralReminder/referralReminder.repository';
import { ReminderStatus } from '../feature/referralReminder/referralReminder.schema';
import { Types } from 'mongoose';
import { referralReminderConfig } from '../config/referral-reminder.config';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;
  private admin: Admin;
  private isConnected = false;

  constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private reminderRepository: ReminderRepository,
  ) {
    const brokers = this.configService.get('KAFKA_HOST_URL')?.split(',') || ['localhost:9092'];
    
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
      // Don't start if Kafka is not configured or disabled
      if (!referralReminderConfig.enabled) {
        console.log('[KAFKA CONSUMER] Referral reminder system is disabled, skipping consumer initialization');
        return;
      }

      const kafkaUrl = this.configService.get('KAFKA_HOST_URL');
      if (!kafkaUrl || kafkaUrl === 'localhost:9092') {
        console.log('[KAFKA CONSUMER] Kafka not configured for this environment, skipping consumer initialization');
        return;
      }

      console.log('[KAFKA CONSUMER] Connecting to Kafka...');
      await this.consumer.connect();
      console.log('[KAFKA CONSUMER] Connected successfully');

      // Create topic if it doesn't exist
      const topicName = referralReminderConfig.kafkaTopic;
      await this.ensureTopicExists(topicName);

      // Subscribe to topic
      await this.consumer.subscribe({ 
        topic: topicName,
        fromBeginning: false 
      });
      console.log(`[KAFKA CONSUMER] Subscribed to topic: ${topicName}`);

      // Start consuming messages
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const data = JSON.parse(message.value.toString());
            console.log(`[KAFKA CONSUMER] Processing message for enquiry: ${data.enquiry_number}`);
            
            await this.processReminderMessage(data);
          } catch (error) {
            console.error('[KAFKA CONSUMER] Error processing message:', error);
          }
        },
      });

      this.isConnected = true;
      console.log('[KAFKA CONSUMER] Consumer is running');
    } catch (error) {
      console.error('[KAFKA CONSUMER] Failed to initialize:', error);
      // Don't throw - allow app to start even if Kafka fails
    }
  }

  async ensureTopicExists(topicName: string): Promise<void> {
    try {
      await this.admin.connect();
      
      const topics = await this.admin.listTopics();
      
      if (!topics.includes(topicName)) {
        console.log(`[KAFKA CONSUMER] Topic ${topicName} does not exist, creating...`);
        
        await this.admin.createTopics({
          topics: [{
            topic: topicName,
            numPartitions: 3,
            replicationFactor: 1,
          }],
        });
        
        console.log(`[KAFKA CONSUMER] Topic ${topicName} created successfully`);
      } else {
        console.log(`[KAFKA CONSUMER] Topic ${topicName} already exists`);
      }
      
      await this.admin.disconnect();
    } catch (error) {
      console.error('[KAFKA CONSUMER] Error ensuring topic exists:', error);
      await this.admin.disconnect();
      throw error;
    }
  }

  async processReminderMessage(data: any): Promise<void> {
    try {
      // Send actual notification
      const result = await this.notificationService.sendNotification(
        {
          slug: 'Marketing related-Others-Email-Wed Dec 03 2025 14:36:19 GMT+0000 (Coordinated Universal Time)',
          employee_ids: [],
          global_ids: [],
          mail_to: [data.recipient_email],
          sms_to: [data.recipient_phone.toString().slice(-10)],
          param: {
            recipientType: data.recipient_type === 'parent' ? 'Parent' : 'Referrer',
            recipientName: data.recipient_name,
            verificationUrl: data.verification_url,
            reminderCount: data.reminder_count + 1,
          },
        },
        '', // token
        'web', // platform
      );

      // Update status on success
      if (result) {
        await this.reminderRepository.updateById(
          new Types.ObjectId(data.reminder_id),
          {
            status: ReminderStatus.SENT,
          }
        );
        console.log(`[KAFKA CONSUMER] Successfully sent reminder to ${data.recipient_email}`);
      } else {
        throw new Error('Notification service returned false');
      }
    } catch (error) {
      console.error(`[KAFKA CONSUMER] Error processing reminder for ${data.recipient_email}:`, error);
      
      // Update with error
      await this.reminderRepository.updateById(
        new Types.ObjectId(data.reminder_id),
        {
          status: ReminderStatus.FAILED,
          $push: { error_logs: error.message },
        }
      );
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.consumer.disconnect();
      console.log('[KAFKA CONSUMER] Disconnected');
    }
  }
}