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

async function runRbacMigration() {
    try {
        console.log('🔄 Running RBAC migration to update user check constraint...');
        await waitForDb();

        const sqlPath = path.join(__dirname, 'update_user_role_check.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon to run statements sequentially if needed, 
        // but db.query might handle multiple statements depending on driver.
        // sqlite3 driver `exec` handles multiple, but `run`/`all` usually one.
        // db.js uses `query` which maps to `db.all` or `db.run`.
        // `sqlite.js` implementation of `query` tries to detect SELECT vs Insert etc.
        // It might NOT handle multiple statements well if they are complex.
        // SAFE BET: Split and execute one by one.

        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            await db.query(statement);
        }

        console.log('✅ RBAC user constraint migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    runRbacMigration();
}

module.exports = runRbacMigration;
