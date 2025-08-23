import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const poolConfig: PoolConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'luminateEcosystem',
  // Connection pool settings
  max: parseInt(process.env.DB_POOL_MAX || '20'), // Maximum number of clients in the pool
  min: parseInt(process.env.DB_POOL_MIN || '5'), // Minimum number of clients in the pool
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'), // How long to wait before timing out when connecting a new client
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'), // How long to wait for a connection
  allowExitOnIdle: true, // Allow the pool to close when all clients are idle
};

// Create the connection pool
const pool = new Pool(poolConfig);

// Pool event handlers
pool.on('connect', (client) => {
  console.log('🔌 New database client connected');
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected database error on idle client', err);
  process.exit(-1);
});

pool.on('acquire', (client) => {
  console.log('📥 Database client acquired from pool');
});

pool.on('release', (client) => {
  console.log('📤 Database client released back to pool');
});

// Test the connection
const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    return false;
  }
};

// Graceful shutdown
const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('🔒 Database pool closed');
  } catch (err) {
    console.error('❌ Error closing database pool:', err);
  }
};

export {
  pool,
  testConnection,
  closePool
};
