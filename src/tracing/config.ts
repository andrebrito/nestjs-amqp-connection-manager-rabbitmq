import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import sdk from './tracing';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);

sdk.start();
