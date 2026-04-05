import { config } from 'dotenv';
import * as fs from 'fs';

import { IDatabaseConfig } from './core/interfaces/dbConfig.interface';

config();

// Parse DATABASE_URL for Supabase
const parseDatabaseUrl = (url: string) => {
  const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }
  return {
    username: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
  };
};

const getDatabaseConfig = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    // Use Supabase DATABASE_URL
    const dbConfig = parseDatabaseUrl(databaseUrl);
    return {
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: 'postgres',
      frontEndBaseUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      ssl: { rejectUnauthorized: false },
    };
  } else {
    // Fallback to individual env vars (legacy)
    return {
      username: process.env.DB_USER_DEV,
      password: process.env.DB_PASSWORD_DEV,
      database: process.env.DB_NAME_DEV,
      host: process.env.DB_HOST_DEV,
      port: process.env.DB_PORT_DEV ? parseInt(process.env.DB_PORT_DEV) : 5432,
      dialect: process.env.DB_DIALECT_DEV || 'postgres',
      frontEndBaseUrl: process.env.FRONTEND_FORGET_URL_DEV || 'http://localhost:3000',
      ssl: { rejectUnauthorized: false },
    };
  }
};

export const databaseConfig: IDatabaseConfig = Object.freeze({
  local: getDatabaseConfig(),
  development: getDatabaseConfig(),
  staging: getDatabaseConfig(),
  production: getDatabaseConfig(),
});

// const env = process.env.NODE_ENV || 'development';
const env = process.env.NODE_ENV && databaseConfig[process.env.NODE_ENV]
  ? process.env.NODE_ENV
  : 'development';
console.log('Current Environment:', env);

const currentConfig = databaseConfig[env];
if (!currentConfig.password) {
  throw new Error(`❌ Missing DB password for environment: ${env}. Please set DATABASE_URL or individual DB_* variables.`);
}
export const DBconfig = currentConfig;
