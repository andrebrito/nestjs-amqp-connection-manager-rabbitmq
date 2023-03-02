import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { AmqplibInstrumentation } from '@opentelemetry/instrumentation-amqplib';
import { NodeSDK, tracing } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';

const exporter = new tracing.ConsoleSpanExporter();

const sdk = new NodeSDK({
  spanProcessor: new SimpleSpanProcessor(exporter),
  instrumentations: [
    getNodeAutoInstrumentations(),
    new AmqplibInstrumentation(),
  ],
});

export default sdk;
