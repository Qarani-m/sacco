/**
 * Initialize Database and Run Migrations
 * 
 * This script ensures database is connected before running migrations
 */

const db = require('../src/models/db');
const fs = require('fs');
const path = require('path');

// Wait for database connection
async function waitForDb() {
    let retries = 10;
    while (retries > 0) {
        try {
            await db.query('SELECT 1');
            return true;
        } catch (error) {
            retries--;
            if (retries === 0) {
                throw new Error('Database connection timeout');
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
}

async function runMigrations() {
    try {
        console.log('🔄 Waiting for database connection...\n');
        await waitForDb();

        const currentDb = db.getCurrentDb();
        console.log(`✅ Connected to: ${currentDb}\n`);

        // Determine file suffix
        const suffix = currentDb === 'sqlite' ? '_sqlite.sql' : '.sql';

        // Migration files
        const migrations = [
            { name: 'RBAC System', file: `rbac_schema${suffix}` },
            { name: 'Approval Workflows', file: `approval_workflow_schema${suffix}` }
        ];

        for (const migration of migrations) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`📦 ${migration.name}`);
            console.log('='.repeat(60));

            const schemaPath = path.join(__dirname, '../src/models/migrations', migration.file);

            if (!fs.existsSync(schemaPath)) {
                console.log(`⚠️  Not found: ${migration.file}`);
                continue;
            }

            const schema = fs.readFileSync(schemaPath, 'utf8');
            const statements = schema
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            let successCount = 0;
            let skipCount = 0;

            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];

                try {
                    if (statement.startsWith('--') || statement.startsWith('/*') || statement.startsWith('COMMENT')) {
                        continue;
                    }

                    const preview = statement.substring(0, 50).replace(/\n/g, ' ');
                    process.stdout.write(`[${i + 1}/${statements.length}] ${preview}... `);

                    await db.query(statement);
                    console.log('✅');
                    successCount++;
                } catch (error) {
                    if (error.message.includes('already exists') ||
                        error.message.includes('duplicate') ||
                        error.message.includes('UNIQUE constraint') ||
                        error.message.includes('no such column')) {
                        console.log('⏭️');
                        skipCount++;
                    } else {
                        console.log('❌');
                        console.error(`   Error: ${error.message}`);
                    }
                }
            }

            console.log(`\n✓ ${successCount} executed, ${skipCount} skipped`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('🔍 Verifying...\n');

        try {
            const rolesResult = await db.query('SELECT COUNT(*) as count FROM roles');
            console.log(`✅ Roles: ${rolesResult.rows[0].count}`);
        } catch (e) {
            console.log(`⚠️  Roles table: ${e.message}`);
        }

        try {
            const permsResult = await db.query('SELECT COUNT(*) as count FROM permissions');
            console.log(`✅ Permissions: ${permsResult.rows[0].count}`);
        } catch (e) {
            console.log(`⚠️  Permissions table: ${e.message}`);
        }

        try {
            const workflowsResult = await db.query('SELECT COUNT(*) as count FROM approval_workflows');
            console.log(`✅ Workflows: ${workflowsResult.rows[0].count}`);
        } catch (e) {
            console.log(`⚠️  Workflows table: ${e.message}`);
        }

        console.log('\n🎉 Migration Complete!\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

runMigrations();
