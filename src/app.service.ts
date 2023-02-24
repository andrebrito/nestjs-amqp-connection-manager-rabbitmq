import { Injectable } from '@nestjs/common';
import { AmqpService } from './amqp.service';

@Injectable()
export class AppService {
  constructor(private amqpService: AmqpService) {}

  // AMQP Connection Manager
  async post() {
    const res = await this.amqpService.emit(
      `Emitting at ${new Date().toLocaleTimeString()}`,
    );

    console.log('response', res);

    return res;
  }
}
