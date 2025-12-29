const db = require('../db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('🔄 Running migration to add updated_at to loans...');

        // Wait for DB to be ready
        await new Promise(r => setTimeout(r, 1000));

        const sqlPath = path.join(__dirname, 'add_updated_at_to_loans.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split statements
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            try {
                await db.query(statement);
            } catch (e) {
                if (e.message.includes('duplicate column name')) {
                    console.log('Column already exists, skipping ADD COLUMN.');
                } else {
                    throw e;
                }
            }
        }

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
