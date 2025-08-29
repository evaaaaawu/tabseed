import { nanoid } from 'nanoid';
import pino from 'pino';

declare global {
   
  var __tabseedLogger: pino.Logger | undefined;
}

export const getLogger = (): pino.Logger => {
  if (globalThis.__tabseedLogger) return globalThis.__tabseedLogger;

  const isProd = process.env.NODE_ENV === 'production';
  const logger = pino({
    name: 'tabseed',
    level: process.env.LOG_LEVEL ?? (isProd ? 'info' : 'debug'),
    transport: isProd
      ? undefined
      : {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        },
  });

  globalThis.__tabseedLogger = logger;
  return logger;
};

export const bindRequestId = (headers: Headers): string => {
  const existing = headers.get('ts-request-id');
  if (existing) return existing;
  return `req_${nanoid(12)}`;
};
