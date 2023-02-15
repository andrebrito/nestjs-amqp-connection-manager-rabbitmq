import { Injectable, Logger } from '@nestjs/common';
import amqp, { Channel, ChannelWrapper } from 'amqp-connection-manager';
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/esm/AmqpConnectionManager';

@Injectable()
export class AmqpService {
  private readonly logger = new Logger('logger');
  private readonly exchangeName = 'testing.exchange';
  private readonly queueName = 'testing.queue';
  private readonly routingKey = 'testing.routing.key';

  private connection: IAmqpConnectionManager;
  private channelWrapper: ChannelWrapper;

  private async connect() {
    this.connection = amqp.connect('amqp://localhost:5672');

    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: (channel: Channel) => {
        channel.assertQueue(this.queueName, { durable: true });
        channel.assertExchange(this.exchangeName, 'direct');

        return channel.bindQueue(
          this.queueName,
          this.exchangeName,
          this.routingKey,
        );
      },
    });
  }

  async emit(message: any) {
    if (!this.connection || !this.connection.isConnected()) {
      await this.connect();
    }

    const options = { persistent: true, timeout: 500 };

    try {
      const response = await this.channelWrapper.publish(
        this.exchangeName,
        this.routingKey,
        message,
        options,
      );

      return response;
    } catch (error) {
      if (error.message === 'timeout') {
        this.logger.log('Timeout error, will try to reconnect next message.');
      }
    }
  }
}
