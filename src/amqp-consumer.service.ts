import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ChannelWrapper } from 'amqp-connection-manager';
import { Channel, ConsumeMessage } from 'amqplib';
import { AmqpProducerService } from './amqp-producer.service';
import { ConnectionFactoryService } from './connection-factory.service';
import { CURRENT_TRY, MAX_TRIES, QUEUE } from './global';

@Injectable()
export class AmqpConsumerService implements OnApplicationBootstrap {
  constructor(
    private connectionFactoryService: ConnectionFactoryService,
    private producerService: AmqpProducerService,
  ) {}

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

  private async handle(message: ConsumeMessage, channel: ChannelWrapper) {
    const content = Buffer.from(message.content).toString();
    const hasCurrentTry = !!message.properties.headers[CURRENT_TRY];
    const currentTry = Number(message.properties.headers[CURRENT_TRY]) || 1;
    const currentDelay = Number(message.properties.headers['x-delay']) || 1000;

    console.log(
      'acking message...',
      'x-delay',
      currentDelay,
      'current try',
      currentTry,
      'max tries',
      MAX_TRIES,
      content,
    );

    if (!hasCurrentTry) {
      console.log('acking message.');
      return channel.ack(message);
    }

    const isPm = content.includes('PM');

    if (currentTry === MAX_TRIES) {
      if (isPm) {
        console.log('acking cause pm.');
        return channel.ack(message);
      }

      console.log('nacking message...');
      channel.nack(message, false, false);
      return;
    }

    console.log('acking message for further requeue');
    channel.ack(message);

    const nextTry = currentTry + 1;

    await this.producerService.emit(
      JSON.parse(content),
      currentDelay * nextTry,
      nextTry,
    );
  }
}
