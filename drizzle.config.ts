import type { Config } from 'drizzle-kit';

// Load dotenv only in development (optional dependency)
try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch {
  // dotenv not available in production, environment variables injected by container
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is required. ' +
    'Please set it in your Dokploy environment configuration.'
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
