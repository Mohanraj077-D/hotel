const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Locate and load the environment file from various possible execution contexts
const potentialEnvPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/.env'),
];

for (const envPath of potentialEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}
dotenv.config();

const useSsl =
  process.env.DB_SSL === 'true' ||
  process.env.DATABASE_SSL === 'true' ||
  (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require'));

// Support either full DATABASE_URL or discrete parameters
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      max: Number(process.env.DB_POOL_MAX || 20),
      idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT || 30000),
      connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT || 5000),
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'taj_hotels',
      password: process.env.DB_PASSWORD != null ? String(process.env.DB_PASSWORD) : undefined,
      port: Number(process.env.DB_PORT || 5432),
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      max: Number(process.env.DB_POOL_MAX || 20),
      idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT || 30000),
      connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT || 5000),
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  // Connection acquired from pool
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error in pool:', err.message);
});

/**
 * Executes a SQL query with parameters.
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error('Database query error:', {
      query: text.replace(/\s+/g, ' ').trim(),
      message: err.message,
      code: err.code,
    });
    throw err;
  }
}

/**
 * Retrieves a dedicated client for multi-query transactions.
 */
async function getClient() {
  const client = await pool.connect();
  const originalRelease = client.release.bind(client);

  let released = false;
  const timeout = setTimeout(() => {
    if (!released) {
      console.warn('Warning: Database client has been checked out for over 10 seconds.');
    }
  }, 10000);

  client.release = () => {
    if (!released) {
      released = true;
      clearTimeout(timeout);
      return originalRelease();
    }
  };

  return client;
}

/**
 * Diagnostic check to verify live database connectivity and latency.
 */
async function testConnection() {
  const startTime = Date.now();
  try {
    const res = await pool.query('SELECT NOW() AS now, current_database() AS db_name, version() AS version');
    const latencyMs = Date.now() - startTime;
    return {
      connected: true,
      database: res.rows[0].db_name,
      serverTime: res.rows[0].now,
      version: res.rows[0].version ? res.rows[0].version.split(',')[0] : 'Unknown',
      latencyMs,
      host: poolConfig.host || (poolConfig.connectionString ? 'configured via DATABASE_URL' : 'localhost'),
      port: poolConfig.port || (poolConfig.connectionString ? 'default' : 5432),
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return {
      connected: false,
      error: error.message,
      code: error.code,
      latencyMs,
      host: poolConfig.host || (poolConfig.connectionString ? 'configured via DATABASE_URL' : 'localhost'),
      database: poolConfig.database || 'unknown',
    };
  }
}

/**
 * Initializes database tables and seed data from schema.sql.
 */
async function initDatabase() {
  const schemaPath = path.resolve(__dirname, '../schema.sql');
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at ${schemaPath}`);
  }
  const sql = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(sql);
  return { success: true, message: 'Database schema and seed data synchronized successfully.' };
}

/**
 * Closes all pool connections cleanly (useful for graceful server shutdown).
 */
async function closePool() {
  try {
    await pool.end();
  } catch (err) {
    console.error('Error closing database pool:', err.message);
  }
}

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
  initDatabase,
  closePool,
};
