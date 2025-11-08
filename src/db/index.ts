import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as schema from './schema';
import ws from 'ws';

// Configure neon for WebSocket support
neonConfig.webSocketConstructor = ws;

const connectionString = import.meta.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Create connection pool
const pool = new Pool({ connectionString });

// Create Drizzle instance
export const db = drizzle(pool, { schema });

// Export schema for use in queries
export { schema };
