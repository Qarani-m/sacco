/**
 * Setup Test Database (Node.js version)
 * Alternative to shell script for cross-platform compatibility
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';
const TEST_DB_NAME = process.env.TEST_DB_NAME || 'sacco_test';

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execPsql(command, database = 'postgres') {
  const env = {
    ...process.env,
    PGPASSWORD: DB_PASSWORD
  };

  try {
    const result = execSync(
      `psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${database} -c "${command}"`,
      { env, stdio: 'pipe' }
    );
    return result.toString();
  } catch (error) {
    if (error.stderr) {
      console.error(error.stderr.toString());
    }
    throw error;
  }
}

function execPsqlFile(filePath, database) {
  const env = {
    ...process.env,
    PGPASSWORD: DB_PASSWORD
  };

  try {
    const result = execSync(
      `psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${database} -f ${filePath}`,
      { env, stdio: 'pipe' }
    );
    return result.toString();
  } catch (error) {
    if (error.stderr) {
      console.error(error.stderr.toString());
    }
    throw error;
  }
}

async function setupTestDatabase() {
  try {
    log('🔧 Setting up test database...', 'yellow');

    // Check PostgreSQL connection
    log('📡 Checking PostgreSQL connection...');
    try {
      execSync(`pg_isready -h ${DB_HOST} -p ${DB_PORT}`, { stdio: 'pipe' });
      log('✅ PostgreSQL is running', 'green');
    } catch (error) {
      log('❌ PostgreSQL is not running or not accessible', 'red');
      log('Please start PostgreSQL and try again', 'red');
      process.exit(1);
    }

    // Check if database exists
    log('🔍 Checking if test database exists...');
    try {
      const result = execPsql(`SELECT 1 FROM pg_database WHERE datname = '${TEST_DB_NAME}'`);
      if (result.includes('1 row')) {
        log(`🗑️  Dropping existing test database: ${TEST_DB_NAME}...`);
        execPsql(`DROP DATABASE ${TEST_DB_NAME}`);
      }
    } catch (error) {
      // Database doesn't exist, that's fine
    }

    // Create test database
    log(`🏗️  Creating test database: ${TEST_DB_NAME}...`);
    execPsql(`CREATE DATABASE ${TEST_DB_NAME}`);
    log(`✅ Test database created: ${TEST_DB_NAME}`, 'green');

    // Run migrations
    log('📦 Running migrations...');

    const migrationsDir = path.join(__dirname, '..', 'src', 'models', 'migrations');

    // RBAC Schema
    log('  - RBAC schema...');
    const rbacSchemaPath = path.join(migrationsDir, 'rbac_schema.sql');
    if (fs.existsSync(rbacSchemaPath)) {
      execPsqlFile(rbacSchemaPath, TEST_DB_NAME);
    } else {
      log(`    ⚠️  RBAC schema file not found: ${rbacSchemaPath}`, 'yellow');
    }

    // Approval Workflow Schema
    log('  - Approval workflow schema...');
    const workflowSchemaPath = path.join(migrationsDir, 'approval_workflow_schema.sql');
    if (fs.existsSync(workflowSchemaPath)) {
      execPsqlFile(workflowSchemaPath, TEST_DB_NAME);
    } else {
      log(`    ⚠️  Workflow schema file not found: ${workflowSchemaPath}`, 'yellow');
    }

    log('✅ Migrations completed', 'green');

    // Verify setup
    log('🔍 Verifying setup...');
    const tableCountResult = execPsql(
      `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'`,
      TEST_DB_NAME
    );

    const match = tableCountResult.match(/\s+(\d+)/);
    const tableCount = match ? parseInt(match[1]) : 0;

    if (tableCount > 0) {
      log(`✅ Setup verified: ${tableCount} tables created`, 'green');
    } else {
      log('❌ Setup verification failed: No tables found', 'red');
      process.exit(1);
    }

    // Success
    console.log('');
    log('🎉 Test database setup complete!', 'green');
    console.log('');
    console.log('Database details:');
    console.log(`  Host: ${DB_HOST}`);
    console.log(`  Port: ${DB_PORT}`);
    console.log(`  Database: ${TEST_DB_NAME}`);
    console.log(`  User: ${DB_USER}`);
    console.log('');
    console.log('You can now run tests with: npm test');
    console.log('');

  } catch (error) {
    log('❌ Error setting up test database:', 'red');
    console.error(error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setupTestDatabase();
}

module.exports = setupTestDatabase;
