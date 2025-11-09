import type { Config } from 'drizzle-kit';

/**
 * Environment variable loading strategy:
 *
 * Development: Load from .env file using dotenv (devDependency)
 * Production: Environment variables injected by container/platform (no dotenv needed)
 *
 * This approach avoids top-level await and handles optional dependencies robustly.
 */

// Only attempt to load dotenv if DATABASE_URL is not already set
// This ensures we skip dotenv in production where env vars are pre-injected
if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
  try {
    // Import dotenv synchronously using require (works in both CJS and TS with esModuleInterop)
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const dotenv = require('dotenv');
    dotenv.config();
  } catch (error) {
    // dotenv not available - this is expected in production
    // Continue without it, DATABASE_URL must be set externally
  }
}

// Validate DATABASE_URL is present after attempting to load from dotenv
if (!process.env.DATABASE_URL) {
  throw new Error(
    '❌ DATABASE_URL environment variable is required.\n\n' +
    'Development: Create a .env file with DATABASE_URL=postgresql://...\n' +
    'Production: Set DATABASE_URL in your Dokploy environment configuration.\n\n' +
    'Format: postgresql://user:password@host:port/database'
  );
}

export default {
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
} satisfies Config;
