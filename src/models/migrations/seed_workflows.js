/**
 * Seed Default Approval Workflows
 *
 * This script creates default approval workflows for loan processing
 */

require('dotenv').config();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

async function seedWorkflows() {
    try {
        console.log('🌱 Starting workflow seeding...');

        // Get role IDs
        const rolesQuery = `SELECT id, name FROM roles WHERE name IN ('Admin', 'Finance', 'Risk')`;
        const rolesResult = await db.query(rolesQuery);
        const roles = rolesResult.rows;

        const adminRole = roles.find(r => r.name === 'Admin');
        const financeRole = roles.find(r => r.name === 'Finance');
        const riskRole = roles.find(r => r.name === 'Risk');

        if (!adminRole || !financeRole || !riskRole) {
            console.error('❌ Required roles not found. Please run RBAC migration first.');
            console.log('Available roles:', roles.map(r => r.name).join(', '));
            process.exit(1);
        }

        console.log('✅ Found required roles:');
        console.log(`   - Admin: ${adminRole.id}`);
        console.log(`   - Finance: ${financeRole.id}`);
        console.log(`   - Risk: ${riskRole.id}`);

        // Check if workflows already exist
        const existingWorkflows = await db.query('SELECT COUNT(*) FROM approval_workflows WHERE entity_type = $1', ['loan']);
        if (parseInt(existingWorkflows.rows[0].count) > 0) {
            console.log('⚠️  Workflows already exist. Skipping seed.');
            return;
        }

        // Create Small Loans Workflow (< KES 50,000)
        const smallWorkflowId = uuidv4();
        await db.query(`
            INSERT INTO approval_workflows (id, name, description, entity_type, min_amount, max_amount, is_active, is_default)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            smallWorkflowId,
            'Small Loans Workflow',
            'For loans under KES 50,000 - requires Risk approval',
            'loan',
            0,
            49999.99,
            true,
            false
        ]);

        // Add step for small loans
        await db.query(`
            INSERT INTO workflow_steps (workflow_id, step_order, step_name, role_id, approvers_required, description)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [
            smallWorkflowId,
            1,
            'Risk Assessment',
            riskRole.id,
            1,
            'Risk officer reviews and approves small loan'
        ]);

        console.log('✅ Created Small Loans Workflow (< KES 50,000)');

        // Create Medium Loans Workflow (KES 50,000 - 200,000)
        const mediumWorkflowId = uuidv4();
        await db.query(`
            INSERT INTO approval_workflows (id, name, description, entity_type, min_amount, max_amount, is_active, is_default)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            mediumWorkflowId,
            'Medium Loans Workflow',
            'For loans KES 50,000 - 200,000 - requires Risk + Finance approval',
            'loan',
            50000,
            200000,
            true,
            true
        ]);

        // Add steps for medium loans
        await db.query(`
            INSERT INTO workflow_steps (workflow_id, step_order, step_name, role_id, approvers_required, description)
            VALUES
                ($1, $2, $3, $4, $5, $6),
                ($7, $8, $9, $10, $11, $12)
        `, [
            mediumWorkflowId, 1, 'Risk Assessment', riskRole.id, 1, 'Risk officer assesses loan risk',
            mediumWorkflowId, 2, 'Financial Review', financeRole.id, 1, 'Finance officer reviews financial viability'
        ]);

        console.log('✅ Created Medium Loans Workflow (KES 50,000 - 200,000)');

        // Create Large Loans Workflow (> KES 200,000)
        const largeWorkflowId = uuidv4();
        await db.query(`
            INSERT INTO approval_workflows (id, name, description, entity_type, min_amount, max_amount, is_active, is_default)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            largeWorkflowId,
            'Large Loans Workflow',
            'For loans over KES 200,000 - requires Risk + Finance + Admin approval',
            'loan',
            200000.01,
            999999999,
            true,
            false
        ]);

        // Add steps for large loans
        await db.query(`
            INSERT INTO workflow_steps (workflow_id, step_order, step_name, role_id, approvers_required, description)
            VALUES
                ($1, $2, $3, $4, $5, $6),
                ($7, $8, $9, $10, $11, $12),
                ($13, $14, $15, $16, $17, $18)
        `, [
            largeWorkflowId, 1, 'Risk Assessment', riskRole.id, 1, 'Risk officer assesses loan risk',
            largeWorkflowId, 2, 'Financial Review', financeRole.id, 1, 'Finance officer reviews financial viability',
            largeWorkflowId, 3, 'Executive Approval', adminRole.id, 1, 'Admin provides final approval'
        ]);

        console.log('✅ Created Large Loans Workflow (> KES 200,000)');

        console.log('');
        console.log('🎉 Workflow seeding completed successfully!');
        console.log('');
        console.log('Summary:');
        console.log('  - Small Loans (< KES 50,000): 1 approval (Risk)');
        console.log('  - Medium Loans (KES 50,000 - 200,000): 2 approvals (Risk → Finance)');
        console.log('  - Large Loans (> KES 200,000): 3 approvals (Risk → Finance → Admin)');
        console.log('');

        if (require.main === module) {
            process.exit(0);
        }
    } catch (error) {
        console.error('❌ Error seeding workflows:', error);
        if (require.main === module) {
            process.exit(1);
        }
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    seedWorkflows();
}

module.exports = seedWorkflows;
