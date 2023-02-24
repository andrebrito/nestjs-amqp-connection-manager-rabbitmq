import { Module } from '@nestjs/common';
import { AmqpService } from './amqp.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  controllers: [AppController],
  providers: [AppService, AmqpService],
})
export class AppModule {}
