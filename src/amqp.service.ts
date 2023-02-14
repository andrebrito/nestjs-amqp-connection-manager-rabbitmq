import { Injectable } from '@nestjs/common';
import amqp, { Channel, ChannelWrapper } from 'amqp-connection-manager';
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/esm/AmqpConnectionManager';

@Injectable()
export class AmqpService {
  private readonly xName = 'testing.exchange';
  private readonly qName = 'testing.queue';
  private readonly rk = 'testing.routing.key';

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
        channel.assertQueue(this.qName, { durable: true });
        channel.assertExchange(this.xName, 'direct');

        return channel.bindQueue(this.qName, this.xName, this.rk);
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
      await this.channelWrapper.publish(
        this.xName,
        this.rk,
        new Date().toLocaleTimeString(),
        options,
      );

      const response = await this.channelWrapper.sendToQueue(
        this.qName,
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
