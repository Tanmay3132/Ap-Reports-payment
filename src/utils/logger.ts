import { LOG_GROUP_NAME, LOG_SERVICE_NAME, LOKI_URL } from '@config';
import winston from 'winston';
import LokiTransport from 'winston-loki';

// Define log format
const logFormat = winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`);

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    logFormat,
  ),
  transports: [
    // debug log setting
    new LokiTransport({
      host: LOKI_URL,
      onConnectionError: err => console.error(`LOKI CONNECTION ERROR: ${err}`),
      useWinstonMetaAsLabels: false,
      batching:  true,
      interval:  5,
      labels: {
        appname: LOG_GROUP_NAME,
        service_name: LOG_SERVICE_NAME,
      },
    }),
  ],
});

logger.add(
  new winston.transports.Console({
    format: winston.format.combine(winston.format.splat(), winston.format.colorize()),
  }),
);

const stream = {
  write: (message: string) => {
    logger.info(message.substring(0, message.lastIndexOf('\n')));
  },
};

export { logger, stream };
