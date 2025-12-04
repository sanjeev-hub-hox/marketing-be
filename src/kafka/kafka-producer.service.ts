import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit {
  private kafka: Kafka;
  private producer: Producer;

  constructor(private configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: 'marketing-service',
      brokers: [this.configService.get('KAFKA_HOST_URL') || 'localhost:9092'],
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async sendMessage(topic: string, message: any): Promise<void> {
    await this.producer.send({
      topic,
      messages: [
        {
          key: message.enquiry_id || Date.now().toString(),
          value: JSON.stringify(message),
        },
      ],
    });
  }

  async disconnect() {
    await this.producer.disconnect();
  }
}
