import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
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
          channel.consume(QUEUE, this.handle),
        ),
      );
  }

  private async handle(message: ConsumeMessage) {
    console.log(
      'consumming...',
      message.properties.headers['x-delay'],
      Buffer.from(message.content).toString(),
    );
  }
}
