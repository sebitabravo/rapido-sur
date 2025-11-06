import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config();

/**
 * TypeORM DataSource for migrations
 * This is used by TypeORM CLI to run migrations
 *
 * IMPORTANT: Keep this in sync with app.module.ts TypeORM configuration
 */
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'rapido_sur',

  // Entity locations
  entities: [join(__dirname, '..', 'modules', '**', '*.entity{.ts,.js}')],

  // Migration locations
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],

  // CRITICAL: Never use synchronize in production
  // Use migrations instead
  synchronize: false,

  // Logging
  logging: process.env.NODE_ENV === 'development',

  // Connection pool settings for production
  extra: {
    // Maximum number of connections in the pool
    max: 20,
    // Minimum number of connections in the pool
    min: 2,
    // Maximum time (in milliseconds) to wait for a connection
    connectionTimeoutMillis: 10000,
    // Maximum time (in milliseconds) a connection can be idle before being removed
    idleTimeoutMillis: 30000,
  },
};

// Create and export DataSource instance
const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
