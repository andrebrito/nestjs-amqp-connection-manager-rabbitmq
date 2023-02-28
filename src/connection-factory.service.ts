import { Injectable } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/esm/AmqpConnectionManager';
import { Channel } from 'amqplib';
import { EXCHANGE, QUEUE, ROUTING_KEY } from './global';

@Injectable()
export class ConnectionFactoryService {
  private connection: IAmqpConnectionManager;
  private channelWrapper: ChannelWrapper;

  private async connect() {
    this.connection = amqp.connect('amqp://localhost:5672');

    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: async (channel: Channel) => {
        channel.assertExchange(EXCHANGE, 'x-delayed-message', {
          durable: true,
          arguments: { 'x-delayed-type': 'direct' },
        });

        // Dead Letter Exchange
        const dlxName = `dl.${EXCHANGE}`;
        channel.assertExchange(dlxName, 'direct', { durable: true });

        // Dead Letter Queue
        const dlQueue = `dl.${QUEUE}`;
        channel.assertQueue(dlQueue, {
          durable: true,
        });

        // Dead Letter Routing Key
        const dlRoutingKey = `dl.${ROUTING_KEY}`;
        channel.bindQueue(dlQueue, dlxName, dlRoutingKey);

        channel.assertQueue(QUEUE, {
          durable: true,
          deadLetterExchange: dlxName,
          deadLetterRoutingKey: dlRoutingKey,
        });

        return channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);
      },
    });
  }

  async getConnection() {
    if (!this.connection || !this.connection.isConnected()) {
      await this.connect();
    }

    return {
      connection: this.connection,
      channel: this.channelWrapper,
    };
  }
}
