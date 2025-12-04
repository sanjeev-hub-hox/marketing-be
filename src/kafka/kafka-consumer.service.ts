@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private reminderRepository: ReminderRepository,
  ) {
    this.kafka = new Kafka({
      clientId: 'marketing-service-consumer',
      brokers: [this.configService.get('KAFKA_BROKERS') || 'localhost:9092'],
    });
    this.consumer = this.kafka.consumer({ 
      groupId: 'referral-reminder-group' 
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ 
      topic: 'referral-reminders', 
      fromBeginning: false 
    });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const data = JSON.parse(message.value.toString());
          
          // Send actual notification
          await this.notificationService.sendNotification(
            {
              slug: 'Marketing related-Others-Email-Wed Dec 03 2025 14:36:19 GMT+0000 (Coordinated Universal Time)',
              employee_ids: [],
              global_ids: [],
              mail_to: [data.recipient_email],
              sms_to: [data.recipient_phone.slice(-10)],
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
          await this.reminderRepository.updateById(data.reminder_id, {
            status: ReminderStatus.SENT,
          });
        } catch (error) {
          console.error('Error processing Kafka message:', error);
          // Update with error
          await this.reminderRepository.updateById(data.reminder_id, {
            status: ReminderStatus.FAILED,
            $push: { error_logs: error.message },
          });
        }
      },
    });
  }
}