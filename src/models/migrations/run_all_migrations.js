/**
 * Run All Migrations
 * 
 * This script runs all pending migrations in order
 * Usage: node src/models/migrations/run_all_migrations.js
 */

const db = require('../db');
const fs = require('fs');
const path = require('path');

async function runAllMigrations() {
    try {
        console.log('🚀 Starting All Migrations...\n');

        const currentDb = db.getCurrentDb();
        console.log(`📊 Database: ${currentDb}\n`);

        // Determine file suffix
        const suffix = currentDb === 'sqlite' ? '_sqlite.sql' : '.sql';

        // Migration files in order
        const migrations = [
            { name: 'RBAC System', file: `rbac_schema${suffix}` },
            { name: 'Approval Workflows', file: `approval_workflow_schema${suffix}` }
        ];

        for (const migration of migrations) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`📦 Running: ${migration.name}`);
            console.log('='.repeat(60));

            const schemaPath = path.join(__dirname, migration.file);

            if (!fs.existsSync(schemaPath)) {
                console.log(`⚠️  Schema file not found: ${migration.file}`);
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
                    if (statement.startsWith('--') || statement.startsWith('/*')) {
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
                        error.message.includes('UNIQUE constraint')) {
                        console.log('⏭️  (exists)');
                        skipCount++;
                    } else {
                        console.log('❌');
                        console.error(`Error: ${error.message}`);
                    }
                }
            }

            console.log(`\n✓ ${migration.name}: ${successCount} executed, ${skipCount} skipped`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ All Migrations Complete!');
        console.log('='.repeat(60));

        // Verify
        console.log('\n🔍 Verifying...\n');

        const rolesResult = await db.query('SELECT COUNT(*) as count FROM roles');
        console.log(`✓ Roles: ${rolesResult.rows[0].count}`);

        const permsResult = await db.query('SELECT COUNT(*) as count FROM permissions');
        console.log(`✓ Permissions: ${permsResult.rows[0].count}`);

        const workflowsResult = await db.query('SELECT COUNT(*) as count FROM approval_workflows');
        console.log(`✓ Workflows: ${workflowsResult.rows[0].count}`);

        console.log('\n🎉 System Ready!\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

runAllMigrations();
