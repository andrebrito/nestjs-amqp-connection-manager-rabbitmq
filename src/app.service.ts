import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AmqpService } from './amqp.service';

@Injectable()
export class AppService {
  constructor(
    @Inject('RABBIT_SERVICE') private client: ClientProxy,
    private amqpService: AmqpService,
  ) {}

  /**
   * NestJS + RabbitMQ
   * Not working the way it should.
   */
  // async post() {
  //   const res = this.client.emit('rabbits_queue', randomUUID()).pipe(
  //     map((p) => {
  //       console.log('p', p);
  //       return p;
  //     }),
  //     catchError((error) =>
  //       of({
  //         error: true,
  //         details: error,
  //       }),
  //     ),
  //   );
  //   return await firstValueFrom(res);
  // }

  // AMQP Connection Manager
  async post() {
    const res = await this.amqpService.emit(
      `Emitting at ${new Date().toLocaleTimeString()}`,
    );

    console.log('response', res);

    return res;
  }
}
