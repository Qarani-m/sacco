/**
 * Quick Workflow Seeder
 * Run this to quickly seed workflows into your database
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { v4: uuidv4 } = require('uuid');

async function quickSeed() {
    try {
        if (!process.env.DATABASE_URL) {
            console.error('❌ DATABASE_URL not set in .env file');
            process.exit(1);
        }

        const sql = neon(process.env.DATABASE_URL);
        console.log('✅ Connected to Neon database');

        // Get roles
        const roles = await sql`SELECT id, name FROM roles WHERE name IN ('Admin', 'Finance', 'Risk')`;
        const adminRole = roles.find(r => r.name === 'Admin');
        const financeRole = roles.find(r => r.name === 'Finance');
        const riskRole = roles.find(r => r.name === 'Risk');

        if (!adminRole || !financeRole || !riskRole) {
            console.error('❌ Required roles not found. Please run RBAC migration first.');
            console.log('Available roles:', roles.map(r => r.name).join(', '));
            process.exit(1);
        }

        console.log('✅ Found required roles');

        // Check if workflows exist
        const existing = await sql`SELECT COUNT(*) as count FROM approval_workflows WHERE entity_type = 'loan'`;
        if (parseInt(existing[0].count) > 0) {
            console.log('⚠️  Workflows already exist. Skipping.');
            process.exit(0);
        }

        console.log('🌱 Seeding workflows...');

        // Small Loans Workflow
        const smallId = uuidv4();
        await sql`
            INSERT INTO approval_workflows (id, name, description, entity_type, min_amount, max_amount, is_active, is_default)
            VALUES (${smallId}, 'Small Loans Workflow', 'For loans under KES 50,000 - requires Risk approval', 'loan', 0, 49999.99, true, false)
        `;
        await sql`
            INSERT INTO workflow_steps (workflow_id, step_order, step_name, role_id, approvers_required, description)
            VALUES (${smallId}, 1, 'Risk Assessment', ${riskRole.id}, 1, 'Risk officer reviews and approves small loan')
        `;
        console.log('✅ Created Small Loans Workflow');

        // Medium Loans Workflow
        const mediumId = uuidv4();
        await sql`
            INSERT INTO approval_workflows (id, name, description, entity_type, min_amount, max_amount, is_active, is_default)
            VALUES (${mediumId}, 'Medium Loans Workflow', 'For loans KES 50,000 - 200,000 - requires Risk + Finance approval', 'loan', 50000, 200000, true, true)
        `;
        await sql`
            INSERT INTO workflow_steps (workflow_id, step_order, step_name, role_id, approvers_required, description)
            VALUES
                (${mediumId}, 1, 'Risk Assessment', ${riskRole.id}, 1, 'Risk officer assesses loan risk'),
                (${mediumId}, 2, 'Financial Review', ${financeRole.id}, 1, 'Finance officer reviews financial viability')
        `;
        console.log('✅ Created Medium Loans Workflow');

        // Large Loans Workflow
        const largeId = uuidv4();
        await sql`
            INSERT INTO approval_workflows (id, name, description, entity_type, min_amount, max_amount, is_active, is_default)
            VALUES (${largeId}, 'Large Loans Workflow', 'For loans over KES 200,000 - requires Risk + Finance + Admin approval', 'loan', 200000.01, 999999999, true, false)
        `;
        await sql`
            INSERT INTO workflow_steps (workflow_id, step_order, step_name, role_id, approvers_required, description)
            VALUES
                (${largeId}, 1, 'Risk Assessment', ${riskRole.id}, 1, 'Risk officer assesses loan risk'),
                (${largeId}, 2, 'Financial Review', ${financeRole.id}, 1, 'Finance officer reviews financial viability'),
                (${largeId}, 3, 'Executive Approval', ${adminRole.id}, 1, 'Admin provides final approval')
        `;
        console.log('✅ Created Large Loans Workflow');

        console.log('');
        console.log('🎉 Workflow seeding completed!');
        console.log('');
        console.log('Summary:');
        console.log('  - Small Loans (< KES 50,000): 1 approval (Risk)');
        console.log('  - Medium Loans (KES 50,000 - 200,000): 2 approvals (Risk → Finance)');
        console.log('  - Large Loans (> KES 200,000): 3 approvals (Risk → Finance → Admin)');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

quickSeed();
