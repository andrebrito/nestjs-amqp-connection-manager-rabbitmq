import { Injectable } from '@nestjs/common';
import { AmqpProducerService } from './amqp-producer.service';

@Injectable()
export class AppService {
  constructor(private amqpService: AmqpProducerService) {}

  // AMQP Connection Manager
  async post() {
    const res = await this.amqpService.emit(
      `Emitting at ${new Date().toLocaleTimeString()}`,
    );

    console.log('response', res);

    return res;
  }
}
