import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { WinstonModuleOptions } from 'nest-winston';
import path from 'path/win32';

interface LogInfo {
  timestamp?: string;
  level: string;
  message: string;
  context?: string;
  [key: string]: any;
}
const logDirectory = path.join(process.cwd(), 'logs');

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize(),
        winston.format.printf((info) => {
          const { timestamp, level, message, context } = info as LogInfo;
          return `[${timestamp}] ${level} [${context || 'App'}]: ${message}`;
        }),
      ),
    }),

    new winston.transports.DailyRotateFile({
      dirname: logDirectory,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    new winston.transports.DailyRotateFile({
      dirname: logDirectory,
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
};
