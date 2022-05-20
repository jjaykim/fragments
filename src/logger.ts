// Create and export a Pino Logger instance:
// https://getpino.io/#/docs/api?id=logger
import pino from 'pino';

// If we're doing `debug` logging, make the logs easier to read
const isDebug = (LOG_LEVEL: String) => {
  if (LOG_LEVEL === 'debug') {
    return {
      // https://github.com/pinojs/pino-pretty
      target: 'pino-pretty',
      option: {
        colorize: true,
      },
    };
  }
  return undefined;
};

const logger = pino({
  level: process.env.LOG_LEVEL || 'info', // Use `info` as our standard log level if not specified
  transport: isDebug(process.env.LOG_LEVEL as string),
});

export default logger;
