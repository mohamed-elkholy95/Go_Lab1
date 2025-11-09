/**
 * Database Connection Setup
 *
 * Automatically detects database type and uses appropriate driver:
 * - Neon serverless: For DATABASE_URL containing "neon.tech" or "neon.aws"
 * - Standard PostgreSQL: For all other connections (Dokploy, local, Supabase, etc.)
 */

import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const connectionString = import.meta.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Detect if using Neon serverless based on URL
const isNeonServerless = connectionString.includes('neon.tech') || connectionString.includes('neon.aws');

let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzleNode>;

if (isNeonServerless) {
  // Use Neon serverless driver for Neon databases
  console.log('[DB] Using Neon serverless driver');

  const { Pool, neonConfig } = await import('@neondatabase/serverless');
  const ws = await import('ws');

  // Configure neon for WebSocket support
  neonConfig.webSocketConstructor = ws.default;

  const pool = new Pool({ connectionString });
  db = drizzleNeon(pool, { schema });
} else {
  // Use standard PostgreSQL driver for all other databases
  console.log('[DB] Using standard PostgreSQL driver');

  const pkg = await import('pg');
  const { Pool } = pkg.default;

  const pool = new Pool({
    connectionString,
    // Standard PostgreSQL connection settings
    ssl: connectionString.includes('sslmode=require')
      ? { rejectUnauthorized: false }
      : false
  });

  db = drizzleNode(pool, { schema });
}

// Export database instance
export { db };

// Export schema for use in queries
export { schema };
