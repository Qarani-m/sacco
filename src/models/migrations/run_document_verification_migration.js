const fs = require('fs');
const path = require('path');
const db = require('../db');

async function runMigration() {
    try {
        console.log('Starting document verification migration...');

        // Read the SQL file
        const sqlPath = path.join(__dirname, 'create_document_verification.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute the migration
        await db.query(sql);

        console.log('Migration completed successfully!');
        console.log('Created tables:');
        console.log('  - member_documents');
        console.log('  - admin_notifications');

    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await db.pool.end();
    }
}

runMigration();
