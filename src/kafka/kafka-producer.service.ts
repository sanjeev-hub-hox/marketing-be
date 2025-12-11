// import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { Kafka, Producer, Partitioners } from 'kafkajs';

// @Injectable()
// export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
//   private kafka: Kafka;
//   private producer: Producer;
//   private isConnected = false;

//   constructor(private configService: ConfigService) {
//     const kafkaUrl = this.configService.get('KAFKA_HOST_URL');
    
//     // Parse broker URLs (handle multiple brokers separated by comma)
//     const brokers = kafkaUrl ? kafkaUrl.split(',') : [];
    
//     if (brokers.length === 0) {
//       console.log('[KAFKA PRODUCER] No Kafka brokers configured');
//       return;
//     }

//     console.log('[KAFKA PRODUCER] Initializing with brokers:', brokers);
    
//     this.kafka = new Kafka({
//       clientId: this.configService.get('KAFKA_CLIENT_ID') || 'marketing-service',
//       brokers,
//       retry: {
//         initialRetryTime: 300,
//         retries: 8
//       }
//     });
    
//     this.producer = this.kafka.producer({
//       createPartitioner: Partitioners.LegacyPartitioner,
//       retry: {
//         initialRetryTime: 300,
//         retries: 8
//       }
//     });
//   }

//   async onModuleInit() {
//     try {
//       const kafkaUrl = this.configService.get('KAFKA_HOST_URL');
      
//       if (!kafkaUrl) {
//         console.log('[KAFKA PRODUCER] KAFKA_HOST_URL not configured, skipping initialization');
//         return;
//       }

//       console.log('[KAFKA PRODUCER] Connecting to Kafka at:', kafkaUrl);
//       await this.producer.connect();
//       this.isConnected = true;
//       console.log('[KAFKA PRODUCER] ✅ Connected successfully to Kafka');
//     } catch (error) {
//       console.error('[KAFKA PRODUCER] ❌ Failed to connect:', error.message);
//       // Don't throw - allow app to start even if Kafka fails
//     }
//   }

//   async sendMessage(topic: string, message: any): Promise<boolean> {
//     if (!this.isConnected) {
//       console.warn('[KAFKA PRODUCER] Producer not connected, skipping message send');
//       return false;
//     }

//     try {
//       await this.producer.send({
//         topic,
//         messages: [
//           {
//             key: message.enquiryId || message.messageId || Date.now().toString(),
//             value: JSON.stringify(message),
//             timestamp: Date.now().toString(),
//           },
//         ],
//       });
//       console.log(`[KAFKA PRODUCER] ✅ Message sent to topic: ${topic}`);
//       return true;
//     } catch (error) {
//       console.error(`[KAFKA PRODUCER] ❌ Failed to send message to ${topic}:`, error.message);
//       return false;
//     }
//   }

//   isProducerConnected(): boolean {
//     return this.isConnected;
//   }

//   async onModuleDestroy() {
//     if (this.isConnected) {
//       await this.producer.disconnect();
//       console.log('[KAFKA PRODUCER] Disconnected');
//     }
//   }
// }