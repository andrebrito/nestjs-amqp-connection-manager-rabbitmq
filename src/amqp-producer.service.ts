import { Injectable, Logger } from '@nestjs/common';
import { ConnectionFactoryService } from './connection-factory.service';
import { EXCHANGE, ROUTING_KEY } from './global';

@Injectable()
export class AmqpProducerService {
  private readonly logger = new Logger('logger');

  constructor(private connectionFactoryService: ConnectionFactoryService) {}

  async emit(message: any) {
    const { channel } = await this.connectionFactoryService.getConnection();

    const options = {
      persistent: true,
      timeout: 500,
      headers: { 'x-delay': 20000 },
    };

    try {
      const response = await channel.publish(
        EXCHANGE,
        ROUTING_KEY,
        message,
        options,
      );

      return response;
    } catch (error) {
      if (error.message === 'timeout') {
        this.logger.log('Timeout error, will try to reconnect next message.');
      }
    }
  }
}
