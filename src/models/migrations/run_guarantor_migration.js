/**
 * Run Guarantor Opt-in Migration
 * Adds guarantor preference columns to users table
 */

const db = require('../db');
const fs = require('fs');
const path = require('path');

async function waitForDb() {
    let retries = 10;
    while (retries > 0) {
        try {
            await db.query('SELECT 1');
            return true;
        } catch (error) {
            if (error.message === 'Database not initialized yet') {
                console.log('⏳ Waiting for database initialization...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                retries--;
            } else {
                throw error;
            }
        }
    }
    throw new Error('Database initialization timed out');
}

async function runGuarantorMigration() {
    try {
        console.log('🔄 Running guarantor opt-in migration...');

        // Wait for DB to be ready
        await waitForDb();

        // Read the SQL file
        const sqlPath = path.join(__dirname, 'guarantor_optin_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute the migration
        await db.query(sql);

        console.log('✅ Guarantor opt-in migration completed successfully!');
        console.log('');
        console.log('Added columns:');
        console.log('  - users.can_be_guarantor (BOOLEAN)');
        console.log('  - users.max_shares_to_guarantee (INTEGER)');
        console.log('');
        console.log('Updated loan_guarantors status constraint to include "released"');
        console.log('');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    runGuarantorMigration();
}

module.exports = runGuarantorMigration;
