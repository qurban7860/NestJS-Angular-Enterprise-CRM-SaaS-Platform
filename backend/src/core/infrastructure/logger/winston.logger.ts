import { transports, format } from 'winston';

const { combine, timestamp, printf, colorize, errors } = format;

const logFormat = printf(({ level, message, timestamp, context, stack, ...meta }) => {
  const ctx = context ? `[${context}]` : '';
  const err = stack ? `\n${stack}` : '';
  const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return `${timestamp} ${level} ${ctx}: ${message}${err}${metaStr}`;
});

export function createWinstonLogger() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    transports: [
      new transports.Console({
        level: process.env.LOG_LEVEL || 'debug',
        format: combine(
          colorize({ all: !isProduction }),
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          errors({ stack: true }),
          logFormat,
        ),
      }),
      ...(isProduction
        ? [
            new transports.File({
              filename: 'logs/error.log',
              level: 'error',
              format: combine(timestamp(), errors({ stack: true }), format.json()),
            }),
            new transports.File({
              filename: 'logs/combined.log',
              format: combine(timestamp(), format.json()),
            }),
          ]
        : []),
    ],
  };
}
