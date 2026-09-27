import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Neon PostgreSQL connection
// Supports both DATABASE_URL (Neon connection string) and individual parameters
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Fallback to individual parameters if DATABASE_URL is not set
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'visitor_parcel_db',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased to 10 seconds
  query_timeout: 30000, // Query timeout 30 seconds
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

// Error handler for pool
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
  } else {
    console.log('Database connected successfully');
    release();
  }
});

export default pool;
