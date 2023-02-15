import { Injectable } from '@nestjs/common';
import amqp, { Channel, ChannelWrapper } from 'amqp-connection-manager';
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/esm/AmqpConnectionManager';

@Injectable()
export class AmqpService {
  private readonly exchangeName = 'testing.exchange';
  private readonly queueName = 'testing.queue';
  private readonly routingKey = 'testing.routing.key';

  private connection: IAmqpConnectionManager;
  private channelWrapper: ChannelWrapper;

  private isConnected = false;

  private async connect() {
    this.connection = amqp.connect('amqp://localhost:5672', {
      connectionOptions: { timeout: 4000 },
      heartbeatIntervalInSeconds: 2,
    });

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

    this.isConnected = true;
  }

  async emit(message: any) {
    if (!this.isConnected) {
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
        this.isConnected = false;
      }
    }
  }
}
