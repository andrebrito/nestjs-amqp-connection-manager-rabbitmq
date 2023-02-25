import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ChannelWrapper } from 'amqp-connection-manager';
import { Channel, ConsumeMessage } from 'amqplib';
import { ConnectionFactoryService } from './connection-factory.service';
import { QUEUE } from './global';

@Injectable()
export class AmqpConsumerService implements OnApplicationBootstrap {
  constructor(private connectionFactoryService: ConnectionFactoryService) {}

  onApplicationBootstrap() {
    this.connectionFactoryService
      .getConnection()
      .then(({ channel: appChannel }) =>
        appChannel.addSetup((channel: Channel) =>
          channel.consume(
            QUEUE,
            (message: ConsumeMessage) => this.handle(message, appChannel),
            { noAck: false },
          ),
        ),
      );
  }

  private handle(message: ConsumeMessage, channel: ChannelWrapper) {
    console.log(
      'acking message...',
      message.properties.headers['x-delay'],
      Buffer.from(message.content).toString(),
    );

    channel.ack(message);
  }
}
