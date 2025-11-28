import { Kafka, Producer, Consumer, Admin } from 'kafkajs';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

interface KafkaConfig {
  brokers: string[];
  clientId: string;
  logLevel?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  ssl?: boolean;
  sasl?: {
    mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
    username: string;
    password: string;
  };
}

class KafkaClient {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  private admin: Admin | null = null;

  constructor(config: KafkaConfig) {
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
      logLevel: config.logLevel || 'WARN',
      ssl: config.ssl || false,
      sasl: config.sasl,
      retry: {
        maxRetryTime: 30000,
        initialRetryTime: 100,
        multiplier: 2,
        randomizationFactor: 0.2,
        retries: 8,
      },
      connectionTimeout: 10000,
      requestTimeout: 30000,
    });
  }

  async getProducer(): Promise<Producer> {
    if (!this.producer) {
      this.producer = this.kafka.producer({
        maxInFlightRequests: 5,
        idempotent: true,
        transactionalId: `producer-${Date.now()}`,
      });
      await this.producer.connect();
      logger.info('Kafka Producer connected');
    }
    return this.producer;
  }

  async getConsumer(groupId: string): Promise<Consumer> {
    if (!this.consumer) {
      this.consumer = this.kafka.consumer({
        groupId,
        sessionTimeout: 30000,
        rebalanceTimeout: 60000,
        heartbeatInterval: 3000,
      });
      await this.consumer.connect();
      logger.info(`Kafka Consumer connected for group: ${groupId}`);
    }
    return this.consumer;
  }

  async getAdmin(): Promise<Admin> {
    if (!this.admin) {
      this.admin = this.kafka.admin();
      await this.admin.connect();
      logger.info('Kafka Admin connected');
    }
    return this.admin;
  }

  async publishEvent(
    topic: string,
    key: string,
    value: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<void> {
    const producer = await this.getProducer();

    try {
      await producer.send({
        topic,
        messages: [
          {
            key,
            value: JSON.stringify(value),
            headers: {
              'correlation-id': `${key}-${Date.now()}`,
              timestamp: new Date().toISOString(),
              ...headers,
            },
          },
        ],
      });

      logger.info(`Event published to ${topic}: ${key}`);
    } catch (error) {
      logger.error(`Failed to publish event to ${topic}:`, error);
      throw error;
    }
  }

  async subscribeToTopic(
    topic: string,
    groupId: string,
    handler: (message: any) => Promise<void>,
    fromBeginning: boolean = false
  ): Promise<void> {
    const consumer = await this.getConsumer(groupId);

    try {
      await consumer.subscribe({
        topic,
        fromBeginning,
      });

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const value = message.value
              ? JSON.parse(message.value.toString())
              : null;

            await handler({
              topic,
              partition,
              offset: message.offset,
              key: message.key?.toString(),
              value,
              headers: message.headers,
            });
          } catch (error) {
            logger.error(
              `Error processing message from ${topic}:`,
              error
            );
            throw error;
          }
        },
      });

      logger.info(`Subscribed to topic: ${topic}`);
    } catch (error) {
      logger.error(`Failed to subscribe to topic ${topic}:`, error);
      throw error;
    }
  }

  async createTopics(topics: Array<{ name: string; partitions?: number; replicationFactor?: number }>): Promise<void> {
    const admin = await this.getAdmin();

    try {
      await admin.createTopics({
        topics: topics.map((t) => ({
          topic: t.name,
          numPartitions: t.partitions || 3,
          replicationFactor: t.replicationFactor || 1,
        })),
        validateOnly: false,
        waitForLeaders: true,
      });

      logger.info(`Topics created: ${topics.map((t) => t.name).join(', ')}`);
    } catch (error) {
      logger.warn(`Failed to create topics (may already exist):`, error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
      logger.info('Kafka Producer disconnected');
    }
    if (this.consumer) {
      await this.consumer.disconnect();
      logger.info('Kafka Consumer disconnected');
    }
    if (this.admin) {
      await this.admin.disconnect();
      logger.info('Kafka Admin disconnected');
    }
  }
}

export { KafkaClient, KafkaConfig };
