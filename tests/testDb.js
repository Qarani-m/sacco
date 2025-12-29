/**
 * Test Database Helper
 * Provides a clean database instance for integration tests
 */

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

let pool = null;

/**
 * Initialize test database connection
 */
async function initTestDb() {
  if (pool) return pool;

  // Use test database
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.TEST_DB_NAME || 'sacco_test',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 5
  });

  return pool;
}

/**
 * Clean up all test data
 */
async function cleanDatabase() {
  if (!pool) return;

  const tables = [
    'approval_history',
    'workflow_steps',
    'approval_workflows',
    'role_permissions',
    'guarantors',
    'loans',
    'welfare_payments',
    'share_purchases',
    'savings',
    'payments',
    'messages',
    'documents',
    'admin_actions',
    'users'
  ];

  for (const table of tables) {
    try {
      await pool.query(`DELETE FROM ${table}`);
    } catch (error) {
      // Table might not exist
    }
  }
}

/**
 * Seed test data
 */
async function seedTestData() {
  const bcrypt = require('bcrypt');
  const passwordHash = await bcrypt.hash('Test@1234', 10);

  // Get roles
  const rolesResult = await pool.query(`SELECT id, name FROM roles WHERE name IN ('Admin', 'Finance', 'Risk', 'Member')`);
  const roles = rolesResult.rows;

  const adminRole = roles.find(r => r.name === 'Admin');
  const financeRole = roles.find(r => r.name === 'Finance');
  const riskRole = roles.find(r => r.name === 'Risk');
  const memberRole = roles.find(r => r.name === 'Member');

  // Create test users
  const adminId = uuidv4();
  const financeId = uuidv4();
  const riskId = uuidv4();
  const memberId = uuidv4();

  await pool.query(`
    INSERT INTO users (id, email, password_hash, full_name, phone_number, role, role_id, is_active, email_verified, registration_paid)
    VALUES
      ($1, 'admin@test.com', $2, 'Test Admin', '0700000001', 'admin', $3, true, true, true),
      ($4, 'finance@test.com', $5, 'Test Finance', '0700000002', 'member', $6, true, true, true),
      ($7, 'risk@test.com', $8, 'Test Risk', '0700000003', 'member', $9, true, true, true),
      ($10, 'member@test.com', $11, 'Test Member', '0700000004', 'member', $12, true, true, true)
  `, [
    adminId, passwordHash, adminRole.id,
    financeId, passwordHash, financeRole.id,
    riskId, passwordHash, riskRole.id,
    memberId, passwordHash, memberRole.id
  ]);

  return {
    users: {
      admin: { id: adminId, email: 'admin@test.com', role_id: adminRole.id },
      finance: { id: financeId, email: 'finance@test.com', role_id: financeRole.id },
      risk: { id: riskId, email: 'risk@test.com', role_id: riskRole.id },
      member: { id: memberId, email: 'member@test.com', role_id: memberRole.id }
    },
    roles: {
      admin: adminRole,
      finance: financeRole,
      risk: riskRole,
      member: memberRole
    }
  };
}

/**
 * Close database connection
 */
async function closeTestDb() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Get database query function
 */
function getQuery() {
  if (!pool) throw new Error('Test database not initialized');
  return (text, params) => pool.query(text, params);
}

module.exports = {
  initTestDb,
  cleanDatabase,
  seedTestData,
  closeTestDb,
  getQuery
};
