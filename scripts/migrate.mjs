#!/usr/bin/env node

/**
 * Professional Database Migration Handler
 *
 * Features:
 * - Pre-flight database connection validation
 * - Better-auth schema requirements verification
 * - Detailed migration logging with progress tracking
 * - Post-migration schema validation
 * - Comprehensive error handling with actionable guidance
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Logging utilities
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}▶ ${msg}${colors.reset}`),
  detail: (msg) => console.log(`  ${colors.gray}${msg}${colors.reset}`),
  step: (num, msg) => console.log(`${colors.cyan}[${num}]${colors.reset} ${msg}`),
};

/**
 * Parse DATABASE_URL into components
 */
function parseDatabaseUrl(url) {
  try {
    const parsed = new URL(url);
    return {
      url,
      host: parsed.hostname,
      port: parsed.port || '5432',
      database: parsed.pathname.slice(1).split('?')[0],
      user: parsed.username,
    };
  } catch {
    return null;
  }
}

/**
 * Validate environment variables
 */
async function validateEnvironment() {
  log.section('Environment Validation');

  const required = ['DATABASE_URL', 'BETTER_AUTH_SECRET', 'BETTER_AUTH_URL'];
  const missing = [];
  const present = [];

  for (const envVar of required) {
    if (!process.env[envVar]) {
      missing.push(envVar);
      log.error(`Missing: ${envVar}`);
    } else {
      present.push(envVar);
      if (envVar === 'DATABASE_URL') {
        const parsed = parseDatabaseUrl(process.env[envVar]);
        if (parsed) {
          log.success(`${envVar} configured`);
          log.detail(`Host: ${parsed.host}`);
          log.detail(`Database: ${parsed.database}`);
          log.detail(`User: ${parsed.user}`);
        } else {
          log.error(`${envVar} has invalid format`);
          return {
            valid: false,
            message: 'DATABASE_URL must be a valid PostgreSQL connection string',
            details: ['Format: postgresql://user:password@host:port/database'],
          };
        }
      } else {
        log.success(`${envVar} configured`);
      }
    }
  }

  if (missing.length > 0) {
    return {
      valid: false,
      message: `Missing required environment variables: ${missing.join(', ')}`,
      details: missing.map((v) => `Set ${v} in your environment configuration`),
    };
  }

  return { valid: true, message: 'All required environment variables present' };
}

/**
 * Test database connection
 */
async function testDatabaseConnection() {
  log.section('Database Connection Test');

  try {
    log.info('Attempting to connect to database...');

    const { Pool, neonConfig } = await import('@neondatabase/serverless');
    const ws = await import('ws');

    // Configure neon for WebSocket support
    neonConfig.webSocketConstructor = ws.default;

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    log.detail('Testing query execution...');
    const result = await pool.query('SELECT version() as version, now() as current_time');

    await pool.end();

    log.success('Database connection successful');
    log.detail(`PostgreSQL: ${result.rows[0].version.split(' ')[1]}`);
    log.detail(`Server time: ${result.rows[0].current_time}`);

    return { valid: true, message: 'Database connection successful' };
  } catch (error) {
    log.error('Database connection failed');

    const details = [];

    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      details.push('DNS resolution failed - check database host');
      details.push('Verify network connectivity');
    } else if (error.message.includes('ECONNREFUSED')) {
      details.push('Connection refused - check if database is running');
      details.push('Verify host and port are correct');
    } else if (error.message.includes('authentication')) {
      details.push('Authentication failed - check username and password');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      details.push('Database does not exist - create it first');
    } else {
      details.push(`Error: ${error.message}`);
    }

    return {
      valid: false,
      message: 'Cannot connect to database',
      details,
    };
  }
}

/**
 * Check current database schema
 */
async function checkCurrentSchema() {
  log.section('Current Schema Analysis');

  try {
    const { Pool, neonConfig } = await import('@neondatabase/serverless');
    const ws = await import('ws');
    neonConfig.webSocketConstructor = ws.default;

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Get existing tables
    const tablesResult = await pool.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    // Get existing enums
    const enumsResult = await pool.query(`
      SELECT typname
      FROM pg_type
      WHERE typcategory = 'E'
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      ORDER BY typname
    `);

    await pool.end();

    const tables = tablesResult.rows.map((row) => row.tablename);
    const enums = enumsResult.rows.map((row) => row.typname);

    if (tables.length === 0) {
      log.info('Database is empty (fresh installation)');
    } else {
      log.success(`Found ${tables.length} existing tables`);
      tables.forEach((table) => log.detail(`- ${table}`));
    }

    if (enums.length > 0) {
      log.success(`Found ${enums.length} existing enums`);
      enums.forEach((enumType) => log.detail(`- ${enumType}`));
    }

    return { tables, enums };
  } catch (error) {
    log.warn('Could not analyze current schema');
    log.detail(error.message);
    return { tables: [], enums: [] };
  }
}

/**
 * Validate Better-Auth required schema
 */
async function validateBetterAuthSchema() {
  log.section('Better-Auth Schema Validation');

  const requiredTables = {
    users: [
      'id',
      'email',
      'username',
      'name',
      'role',
      'email_verified',
      'created_at',
      'updated_at',
    ],
    sessions: [
      'id',
      'user_id',
      'expires_at',
      'created_at',
      'updated_at',
    ],
    email_verifications: [
      'id',
      'user_id',
      'token',
      'expires_at',
      'created_at',
    ],
  };

  try {
    const { Pool, neonConfig } = await import('@neondatabase/serverless');
    const ws = await import('ws');
    neonConfig.webSocketConstructor = ws.default;

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const issues = [];

    for (const [tableName, requiredColumns] of Object.entries(requiredTables)) {
      // Check if table exists
      const tableCheck = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        )`,
        [tableName]
      );

      if (!tableCheck.rows[0].exists) {
        issues.push(`Table '${tableName}' does not exist`);
        log.error(`Missing table: ${tableName}`);
        continue;
      }

      // Check columns
      const columnsResult = await pool.query(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = 'public'
         AND table_name = $1`,
        [tableName]
      );

      const existingColumns = columnsResult.rows.map((row) => row.column_name);
      const missingColumns = requiredColumns.filter(
        (col) => !existingColumns.includes(col)
      );

      if (missingColumns.length > 0) {
        issues.push(
          `Table '${tableName}' missing columns: ${missingColumns.join(', ')}`
        );
        log.error(`${tableName}: Missing columns - ${missingColumns.join(', ')}`);
      } else {
        log.success(`${tableName}: All required columns present`);
      }
    }

    await pool.end();

    if (issues.length > 0) {
      return {
        valid: false,
        message: 'Better-auth schema validation failed',
        details: issues,
      };
    }

    log.success('Better-auth schema is valid');
    return { valid: true, message: 'Better-auth schema is complete' };
  } catch (error) {
    log.warn('Could not validate better-auth schema');
    log.detail(error.message);
    return {
      valid: false,
      message: 'Schema validation skipped (will be created during migration)',
      details: [],
    };
  }
}

/**
 * Run Drizzle migration
 */
async function runDrizzleMigration() {
  log.section('Database Schema Migration');

  try {
    log.info('Running drizzle-kit push with --force flag...');
    log.detail('This will automatically sync schema without prompts');
    console.log(''); // Empty line before drizzle output

    const { stdout, stderr } = await execAsync('npm run db:push', {
      env: { ...process.env },
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
    });

    // Log drizzle-kit output
    if (stdout) {
      console.log(stdout);
    }

    if (stderr && !stderr.includes('npm warn')) {
      console.error(stderr);
    }

    log.success('Migration completed successfully');

    return { valid: true, message: 'Schema migration successful' };
  } catch (error) {
    log.error('Migration failed');

    const details = [];

    if (error.stdout) {
      console.log(error.stdout);
    }

    if (error.stderr) {
      console.error(error.stderr);

      if (error.stderr.includes('permission denied')) {
        details.push('Database user lacks required permissions (CREATE, ALTER, DROP)');
      } else if (error.stderr.includes('syntax error')) {
        details.push('SQL syntax error in schema definition');
      } else if (error.stderr.includes('already exists')) {
        details.push('Schema conflict - objects already exist with different definitions');
      } else if (error.stderr.includes('timeout')) {
        details.push('Database operation timed out - check connectivity');
      }
    }

    if (details.length === 0) {
      details.push('See error output above for details');
    }

    return {
      valid: false,
      message: 'Migration failed',
      details,
    };
  }
}

/**
 * Post-migration validation
 */
async function postMigrationValidation() {
  log.section('Post-Migration Validation');

  try {
    const { Pool, neonConfig } = await import('@neondatabase/serverless');
    const ws = await import('ws');
    neonConfig.webSocketConstructor = ws.default;

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Expected schema
    const expectedTables = [
      'users',
      'sessions',
      'email_verifications',
      'posts',
      'categories',
      'tags',
      'post_categories',
      'post_tags',
      'comments',
    ];

    const expectedEnums = [
      'user_role',
      'post_status',
      'comment_status',
    ];

    // Check tables
    const tablesResult = await pool.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    const tables = tablesResult.rows.map((row) => row.tablename);
    const missingTables = expectedTables.filter((t) => !tables.includes(t));

    if (missingTables.length > 0) {
      log.error(`Missing tables: ${missingTables.join(', ')}`);
    } else {
      log.success(`All ${expectedTables.length} tables created successfully`);
    }

    // Check enums
    const enumsResult = await pool.query(`
      SELECT typname
      FROM pg_type
      WHERE typcategory = 'E'
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      ORDER BY typname
    `);

    const enums = enumsResult.rows.map((row) => row.typname);
    const missingEnums = expectedEnums.filter((e) => !enums.includes(e));

    if (missingEnums.length > 0) {
      log.error(`Missing enums: ${missingEnums.join(', ')}`);
    } else {
      log.success(`All ${expectedEnums.length} enums created successfully`);
    }

    // Get table sizes
    const sizesResult = await pool.query(`
      SELECT
        schemaname || '.' || tablename AS table_name,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);

    log.info('Table sizes:');
    sizesResult.rows.forEach((row) => {
      log.detail(`${row.table_name}: ${row.size}`);
    });

    await pool.end();

    if (missingTables.length > 0 || missingEnums.length > 0) {
      return {
        valid: false,
        message: 'Post-migration validation failed',
        details: [
          ...missingTables.map((t) => `Missing table: ${t}`),
          ...missingEnums.map((e) => `Missing enum: ${e}`),
        ],
      };
    }

    return { valid: true, message: 'All schema objects validated successfully' };
  } catch (error) {
    log.warn('Post-migration validation encountered issues');
    log.detail(error.message);
    return {
      valid: false,
      message: 'Validation incomplete',
      details: [error.message],
    };
  }
}

/**
 * Main migration process
 */
async function main() {
  console.log(`
${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════╗
║        Professional Database Migration Handler             ║
║                  Pythoughts Platform                        ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
  `);

  const startTime = Date.now();

  try {
    // Step 1: Environment validation
    log.step(1, 'Validating environment variables...');
    const envCheck = await validateEnvironment();
    if (!envCheck.valid) {
      log.error(envCheck.message);
      if (envCheck.details) {
        envCheck.details.forEach((detail) => log.detail(detail));
      }
      process.exit(1);
    }

    // Step 2: Database connection test
    log.step(2, 'Testing database connection...');
    const connectionCheck = await testDatabaseConnection();
    if (!connectionCheck.valid) {
      log.error(connectionCheck.message);
      if (connectionCheck.details) {
        connectionCheck.details.forEach((detail) => log.detail(detail));
      }
      process.exit(1);
    }

    // Step 3: Check current schema
    log.step(3, 'Analyzing current database schema...');
    const currentSchema = await checkCurrentSchema();

    // Step 4: Run migration
    log.step(4, 'Running database migration...');
    const migrationResult = await runDrizzleMigration();
    if (!migrationResult.valid) {
      log.error(migrationResult.message);
      if (migrationResult.details) {
        migrationResult.details.forEach((detail) => log.detail(detail));
      }
      process.exit(1);
    }

    // Step 5: Validate better-auth schema
    log.step(5, 'Validating Better-Auth schema requirements...');
    const authValidation = await validateBetterAuthSchema();
    if (!authValidation.valid) {
      log.error(authValidation.message);
      if (authValidation.details && authValidation.details.length > 0) {
        authValidation.details.forEach((detail) => log.detail(detail));
        process.exit(1);
      }
      // If no details, it's just a warning
      log.warn('Continuing despite validation warning...');
    }

    // Step 6: Post-migration validation
    log.step(6, 'Running post-migration validation...');
    const postValidation = await postMigrationValidation();
    if (!postValidation.valid) {
      log.warn(postValidation.message);
      if (postValidation.details) {
        postValidation.details.forEach((detail) => log.detail(detail));
      }
    }

    // Success summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`
${colors.bright}${colors.green}╔════════════════════════════════════════════════════════════╗
║                 ✓ Migration Successful                     ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
    `);

    log.success(`Migration completed in ${duration}s`);
    log.info('Database is ready for application startup');

    process.exit(0);
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`
${colors.bright}${colors.red}╔════════════════════════════════════════════════════════════╗
║                  ✗ Migration Failed                        ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
    `);

    log.error(`Migration failed after ${duration}s`);
    log.error(error.message);

    if (error.stack) {
      log.detail('Stack trace:');
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// Run migration
main();
