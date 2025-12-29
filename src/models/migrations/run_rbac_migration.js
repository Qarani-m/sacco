/**
 * RBAC Migration Runner
 * 
 * Run this script to apply RBAC schema to your database
 * Usage: node src/models/migrations/run_rbac_migration.js
 */

const db = require('../db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('🚀 Starting RBAC Migration...\n');

        // Determine which database we're using
        const currentDb = db.getCurrentDb();
        console.log(`📊 Database: ${currentDb}\n`);

        // Select appropriate schema file
        const schemaFile = currentDb === 'sqlite'
            ? 'rbac_schema_sqlite.sql'
            : 'rbac_schema.sql';

        const schemaPath = path.join(__dirname, schemaFile);

        // Check if file exists
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found: ${schemaPath}`);
        }

        // Read schema file
        console.log(`📄 Reading schema from: ${schemaFile}`);
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split into individual statements (SQLite doesn't support multiple statements in one query)
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`📝 Found ${statements.length} SQL statements\n`);

        // Execute each statement
        let successCount = 0;
        let skipCount = 0;

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];

            try {
                // Skip comments
                if (statement.startsWith('--') || statement.startsWith('/*')) {
                    continue;
                }

                // Log progress
                const preview = statement.substring(0, 60).replace(/\n/g, ' ');
                process.stdout.write(`[${i + 1}/${statements.length}] ${preview}... `);

                await db.query(statement);
                console.log('✅');
                successCount++;
            } catch (error) {
                // Some errors are expected (e.g., table already exists)
                if (error.message.includes('already exists') ||
                    error.message.includes('duplicate') ||
                    error.message.includes('UNIQUE constraint')) {
                    console.log('⏭️  (already exists)');
                    skipCount++;
                } else {
                    console.log('❌');
                    console.error(`Error: ${error.message}`);
                }
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('✅ Migration Complete!');
        console.log(`   Executed: ${successCount} statements`);
        console.log(`   Skipped: ${skipCount} statements`);
        console.log('='.repeat(50) + '\n');

        // Verify migration
        console.log('🔍 Verifying migration...\n');

        // Check roles table
        const rolesResult = await db.query('SELECT COUNT(*) as count FROM roles');
        const rolesCount = parseInt(rolesResult.rows[0].count);
        console.log(`✓ Roles table: ${rolesCount} roles`);

        // Check permissions table
        const permsResult = await db.query('SELECT COUNT(*) as count FROM permissions');
        const permsCount = parseInt(permsResult.rows[0].count);
        console.log(`✓ Permissions table: ${permsCount} permissions`);

        // Check role_permissions table
        const rpResult = await db.query('SELECT COUNT(*) as count FROM role_permissions');
        const rpCount = parseInt(rpResult.rows[0].count);
        console.log(`✓ Role-Permission mappings: ${rpCount} assignments`);

        // Check users with roles
        const usersResult = await db.query('SELECT COUNT(*) as count FROM users WHERE role_id IS NOT NULL');
        const usersCount = parseInt(usersResult.rows[0].count);
        console.log(`✓ Users with roles: ${usersCount} users\n`);

        console.log('🎉 RBAC system is ready to use!\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run migration
runMigration();
