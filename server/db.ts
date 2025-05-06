import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Add connection options to improve reliability
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 5, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false // Enable SSL in production only
});

// Add error handling for connection issues
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

// Test connection on startup
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection test failed:', err);
  } else {
    console.log('Database connection successful');
  }
});

export const db = drizzle(pool, { schema });
