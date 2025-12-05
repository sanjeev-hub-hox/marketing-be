import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Partitioners } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private isConnected = false;

  constructor(private configService: ConfigService) {
    const brokers = this.configService.get('KAFKA_HOST_URL')?.split(',') || ['localhost:9092'];
    
    this.kafka = new Kafka({
      clientId: this.configService.get('KAFKA_CLIENT_ID') || 'marketing-service',
      brokers,
    });
    
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner, // Silence the warning
    });
  }

  async onModuleInit() {
    try {
      const kafkaUrl = this.configService.get('KAFKA_HOST_URL');
      
      if (!kafkaUrl || kafkaUrl === 'localhost:9092') {
        console.log('[KAFKA PRODUCER] Kafka not configured for this environment, skipping producer initialization');
        return;
      }

      console.log('[KAFKA PRODUCER] Connecting...');
      await this.producer.connect();
      this.isConnected = true;
      console.log('[KAFKA PRODUCER] Connected successfully');
    } catch (error) {
      console.error('[KAFKA PRODUCER] Failed to connect:', error);
      // Don't throw - allow app to start even if Kafka fails
    }
  }

  async sendMessage(topic: string, message: any): Promise<boolean> {
    if (!this.isConnected) {
      console.warn('[KAFKA PRODUCER] Producer not connected, skipping message send');
      return false;
    }

    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: message.enquiry_id || Date.now().toString(),
            value: JSON.stringify(message),
          },
        ],
      });
      console.log(`[KAFKA PRODUCER] Message sent to topic ${topic}`);
      return true;
    } catch (error) {
      console.error(`[KAFKA PRODUCER] Failed to send message to ${topic}:`, error);
      return false;
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.producer.disconnect();
      console.log('[KAFKA PRODUCER] Disconnected');
    }
  }
}