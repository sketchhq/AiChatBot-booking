import { config } from 'dotenv';

import { IDatabaseConfig } from './core/interfaces/dbConfig.interface';

config();

const parseDatabaseUrl = (url: string) => {
  const regex = /postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format. Expected: postgresql://user:pass@host:port/dbname');
  }
  return {
    username: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4], 10),
    database: match[5],
  };
};

const getDatabaseConfigForEnv = (env: string) => {
  const envKey = env.toUpperCase();
  const urlKey = env === 'local' ? 'DATABASE_URL_LOCAL' : `DATABASE_URL_${envKey}`;
  const databaseUrl = process.env[urlKey] || process.env.DATABASE_URL;

  if (databaseUrl) {
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
  }

  const prefix = env === 'local' ? 'LOCAL' : envKey;
  return {
    username: process.env[`DB_USER_${prefix}`],
    password: process.env[`DB_PASSWORD_${prefix}`],
    database: process.env[`DB_NAME_${prefix}`],
    host: process.env[`DB_HOST_${prefix}`],
    port: process.env[`DB_PORT_${prefix}`] ? parseInt(process.env[`DB_PORT_${prefix}`], 10) : 5432,
    dialect: process.env[`DB_DIALECT_${prefix}`] || 'postgres',
    frontEndBaseUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    ssl: { rejectUnauthorized: false },
  };
};

export const databaseConfig: IDatabaseConfig = Object.freeze({
  local: getDatabaseConfigForEnv('local'),
  development: getDatabaseConfigForEnv('development'),
  staging: getDatabaseConfigForEnv('staging'),
  production: getDatabaseConfigForEnv('production'),
});

const env = process.env.NODE_ENV && databaseConfig[process.env.NODE_ENV]
  ? process.env.NODE_ENV
  : 'local';
console.log('Current Environment:', env);

const currentConfig = databaseConfig[env];
if (!currentConfig.password && env !== 'local') {
  throw new Error(
    `❌ Missing DB password for environment: ${env}.\n` +
    `Set DATABASE_URL_${env.toUpperCase()} or DB_PASSWORD_${env.toUpperCase()} for this environment.`
  );
}

if (!currentConfig.password && env === 'local') {
  console.warn('⚠️ Local database password is not set. This is okay if your local Postgres uses trust auth.');
}

export const DBconfig = currentConfig;
