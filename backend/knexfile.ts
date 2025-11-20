import dotenv from 'dotenv';
import type { Knex } from 'knex';
import path from 'path';

// Load environment variables
dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || {
      host: 'localhost',
      port: 5432,
      user: 'lexsy_user',
      password: 'lexsy_password',
      database: 'lexsy',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'src/database/migrations'),
      extension: 'ts',
    },
    seeds: {
      directory: path.join(__dirname, 'src/database/seeds'),
    },
  },

  test: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || {
      host: 'localhost',
      port: 5432,
      user: 'lexsy_user',
      password: 'lexsy_password',
      database: 'lexsy_test',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'src/database/migrations'),
      extension: 'ts',
    },
    seeds: {
      directory: path.join(__dirname, 'src/database/seeds'),
    },
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(process.cwd(), 'dist/src/database/migrations'),
      extension: 'js',
    },
    seeds: {
      directory: path.join(process.cwd(), 'dist/src/database/seeds'),
      extension: 'js',
    },
  },
};

export = config;
