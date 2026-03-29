import { config } from 'dotenv';
import * as fs from 'fs';

import { IDatabaseConfig } from './core/interfaces/dbConfig.interface';

config();



export const databaseConfig: IDatabaseConfig = Object.freeze({
  local: {
     username: process.env.DB_USER_LOCAL,
    password: process.env.DB_PASSWORD_LOCAL,
    database: process.env.DB_NAME_LOCAL,
    host: process.env.DB_HOST_LOCAL,
    port: process.env.DB_PORT_LOCAL,
    dialect: process.env.DB_DIALECT_LOCA,
    frontEndBaseUrl: process.env.FRONTEND_FORGET_URL_DEV,
    ssl: { rejectUnauthorized: false },
  },
  development: {
    username: process.env.DB_USER_DEV,
    password: process.env.DB_PASSWORD_DEV,
    database: process.env.DB_NAME_DEV,
    host: process.env.DB_HOST_DEV,
    port: process.env.DB_PORT_DEV,
    dialect: process.env.DB_DIALECT_DEV,
    frontEndBaseUrl: process.env.FRONTEND_FORGET_URL_DEV,
     ssl: { rejectUnauthorized: false },
  },
  staging: {
    username: process.env.DB_USER_STAGING,
    password: process.env.DB_PASSWORD_STAGING,
    database: process.env.DB_NAME_STAGING,
    host: process.env.DB_HOST_STAGING,
    port: process.env.DB_PORT_STAGING,
    dialect: process.env.DB_DIALECT_STAGING,
    frontEndBaseUrl: process.env.FRONTEND_FORGET_URL_STAGING,
     ssl: { rejectUnauthorized: false },
  },
  production: {
    username: process.env.DB_USER_DEV,
    password: process.env.DB_PASSWORD_DEV,
    database: process.env.DB_NAME_DEV,
    host: process.env.DB_HOST_DEV,
    port: process.env.DB_PORT_DEV,
    dialect: process.env.DB_DIALECT_DEV,
    frontEndBaseUrl: process.env.FRONTEND_FORGET_URL_DEV,
    ssl: { rejectUnauthorized: false },
    // username: process.env.DB_USER_PROD,
    // password: process.env.DB_PASSWORD_PROD,
    // database: process.env.DB_NAME_PROD,
    // host: process.env.DB_HOST_PROD,
    // port: process.env.DB_PORT_PROD,
    // dialect: process.env.DB_DIALECT_PROD,
    // frontEndBaseUrl: process.env.FRONTEND_FORGET_URL_PROD
  }
});

// const env = process.env.NODE_ENV || 'development';
const env = process.env.NODE_ENV && databaseConfig[process.env.NODE_ENV]
  ? process.env.NODE_ENV
  : 'development';
console.log('Current Environment:', env);
if (!databaseConfig[env].password) {
  throw new Error(`❌ Missing DB password for environment: ${env}`);
}
export const DBconfig = databaseConfig[env];
