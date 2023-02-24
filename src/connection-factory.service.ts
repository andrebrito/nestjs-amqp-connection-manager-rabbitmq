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
      setup: (channel: Channel) => {
        // Dead Letter
        // channel.assertQueue('');

        channel.assertQueue(QUEUE, { durable: true });
        channel.assertExchange(EXCHANGE, 'x-delayed-message', {
          durable: true,
          arguments: { 'x-delayed-type': 'direct' },
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
