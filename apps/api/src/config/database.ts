import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import path from 'path';
import { Environment, getCurrentEnvironment, getEnvironmentDisplayName } from '../enums';

/**
 * Environment to .env file mapping
 * Maps each environment enum to its corresponding .env file
 */
const ENV_FILE_MAP: Record<Environment, string> = {
  [Environment.DEVELOPMENT]: '.env.dev',
  [Environment.QA]: '.env.qa',
  [Environment.STAGING]: '.env.staging',
  [Environment.PRODUCTION]: '.env.prod'
};

/**
 * Load environment-specific .env file
 * Priority: .env.[environment] > .env
 * 
 * Examples:
 * - Environment.DEVELOPMENT → loads .env.dev or .env
 * - Environment.QA → loads .env.qa
 * - Environment.STAGING → loads .env.staging
 * - Environment.PRODUCTION → loads .env.prod
 */
const currentEnv = getCurrentEnvironment();
const envFile = ENV_FILE_MAP[currentEnv];

// Try multiple possible paths for the .env file
// 1. From monorepo root: apps/api/.env.dev or apps/api/.env
// 2. From apps/api directory: .env.dev or .env
const possiblePaths = [
  path.resolve(process.cwd(), 'apps/api', envFile), // Monorepo root
  path.resolve(process.cwd(), 'apps/api', '.env'),  // Monorepo root, fallback
  path.resolve(__dirname, '../../', envFile),        // From compiled dist
  path.resolve(__dirname, '../../', '.env'),         // From compiled dist, fallback
  path.resolve(process.cwd(), envFile),              // Current directory
  path.resolve(process.cwd(), '.env'),               // Current directory, fallback
];

let loaded = false;
let loadedPath = '';

// Try to load environment-specific file first
for (const envPath of possiblePaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    loaded = true;
    loadedPath = envPath;
    console.log(`✓ Loaded environment config from: ${path.basename(envPath)}`);
    break;
  }
}

// If no file was loaded, try default .env in apps/api directory
if (!loaded) {
  const defaultEnvPath = path.resolve(process.cwd(), 'apps/api', '.env');
  const result = dotenv.config({ path: defaultEnvPath });
  if (!result.error) {
    loaded = true;
    loadedPath = defaultEnvPath;
    console.log(`✓ Loaded environment config from: .env`);
  }
}

// Final fallback: try loading from current working directory
if (!loaded) {
  const result = dotenv.config();
  if (!result.error) {
    loaded = true;
    loadedPath = '.env (current directory)';
    console.log(`✓ Loaded environment config from: .env (current directory)`);
  }
}

// In production/VPS, environment variables may be set directly by docker-compose
// which overrides file-based .env, so this is fine
if (!loaded && !process.env.DB_NAME) {
  console.warn(`⚠️  No .env file found and no DB_NAME environment variable set`);
  console.warn(`   Tried paths: ${possiblePaths.map(p => path.basename(p)).join(', ')}`);
}

/**
 * Database configuration for different environments
 */
const getConfig = () => {
  const env = getCurrentEnvironment();
  
  const dbConfig = {
    dialect: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || '',
    username: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    logging: env === Environment.DEVELOPMENT ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    models: [path.join(__dirname, '../models/**/*.model.{ts,js}')],
    define: {
      timestamps: true,
      underscored: false,
    },
  };

  // Log configuration details (but not password)
  console.log(`📊 Database Configuration:`);
  console.log(`   Environment: ${getEnvironmentDisplayName(env).toUpperCase()}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`   User: ${dbConfig.username}`);
  
  return dbConfig;
};

/**
 * Sequelize instance with TypeScript support
 */
const config = getConfig();
const sequelize = new Sequelize(config);

export { sequelize, getConfig };
export default sequelize;

