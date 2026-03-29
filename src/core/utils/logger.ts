require('dotenv').config();
import winston from 'winston';
const { combine, timestamp, printf, colorize, align, json } = winston.format;

import DailyRotateFile from 'winston-daily-rotate-file';
import { PRODUCTION } from '../constants';
import * as fs from 'fs';
const errorFilter = winston.format((info, opts) => {
  return info.level === 'error' ? info : false;
});

const infoFilter = winston.format((info, opts) => {
  return info.level === 'info' ? info : false;
});

// // Use /tmp directory for logs in Google App Engine
// const logDirectory = '/tmp/logs';
// // Ensure log directory exists
// if (!fs.existsSync(logDirectory)) {
//   fs.mkdirSync(logDirectory, { recursive: true });
// }
// const combinedFileRotateTransport = new DailyRotateFile({
//   filename: 'combined-%DATE%.log',
//   datePattern: 'YYYY-MM-DD',
//   maxFiles: '50d',
//   zippedArchive: true,
//   maxSize: '20m',
//   dirname: './logs/',
// });
// const infoFileRotateTransport = new DailyRotateFile({
//   level: 'info',
//   filename: 'info-%DATE%.log',
//   datePattern: 'YYYY-MM-DD',
//   maxFiles: '50d',
//   zippedArchive: true,
//   maxSize: '20m',
//   dirname: './logs/',
//   format: combine(infoFilter(), timestamp(), json()),
// });

// const errorFileRotateTransport = new DailyRotateFile({
//   level: 'error',
//   filename: 'error-%DATE%.log',
//   datePattern: 'YYYY-MM-DD',
//   maxFiles: '50d',
//   zippedArchive: true,
//   maxSize: '20m',
//   dirname: './logs/',
//   format: combine(errorFilter(), timestamp(), json()),
// });

export const logger = winston.createLogger({
//   format: combine(
//     timestamp({
//       format: 'YYYY-MM-DD hh:mm:ss.SSS A',
//     }),
//     align(),
//     printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
//   ),
//   transports: [combinedFileRotateTransport, infoFileRotateTransport, errorFileRotateTransport],
});

if (process.env.NODE_ENV != PRODUCTION) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}
