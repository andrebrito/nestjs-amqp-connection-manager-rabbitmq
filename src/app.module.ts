import { Module } from '@nestjs/common';
import { AmqpConsumerService } from './amqp-consumer.service';
import { AmqpProducerService } from './amqp-producer.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectionFactoryService } from './connection-factory.service';

@Module({
  controllers: [AppController],
  providers: [
    AppService,
    AmqpConsumerService,
    AmqpProducerService,
    ConnectionFactoryService,
  ],
})
export class AppModule {}
