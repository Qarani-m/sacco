/**
 * Run Approval Workflow Migration
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../db');

// Wait for database to be ready
async function waitForDb(maxRetries = 10) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await db.query('SELECT 1');
            return true;
        } catch (err) {
            if (i === maxRetries - 1) throw err;
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
}

async function runMigration() {
    try {
        console.log('⏳ Waiting for database connection...');
        await waitForDb();
        console.log('✅ Database connected');

        console.log('📦 Running approval workflow migration...');

        // Read SQL file
        const sqlPath = path.join(__dirname, 'approval_workflow_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute migration
        await db.query(sql);

        console.log('✅ Approval workflow migration completed successfully!');

        // Now seed the workflows
        console.log('');
        console.log('🌱 Seeding default workflows...');
        const seedWorkflows = require('./seed_workflows');
        await seedWorkflows();

        process.exit(0);

    } catch (error) {
        console.error('❌ Migration error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

if (require.main === module) {
    runMigration();
}

module.exports = runMigration;
