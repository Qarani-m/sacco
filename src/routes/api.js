const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Seed workflows endpoint
 * GET /api/seed-workflows
 */
router.get('/seed-workflows', async (req, res) => {
    try {
        console.log('🌱 Starting workflow seed...');

        // Get roles
        const rolesResult = await db.query(`SELECT id, name FROM roles WHERE name IN ('Admin', 'Finance', 'Risk')`);
        const roles = rolesResult.rows;

        const adminRole = roles.find(r => r.name === 'Admin');
        const financeRole = roles.find(r => r.name === 'Finance');
        const riskRole = roles.find(r => r.name === 'Risk');

        if (!adminRole || !financeRole || !riskRole) {
            return res.status(400).json({
                success: false,
                error: 'Required roles not found. Please run RBAC migration first.',
                found_roles: roles.map(r => r.name)
            });
        }

        // Check if workflows already exist
        const existing = await db.query(`SELECT COUNT(*) as count FROM approval_workflows WHERE entity_type = 'loan'`);
        if (parseInt(existing.rows[0].count) > 0) {
            return res.json({
                success: true,
                message: 'Workflows already exist',
                count: parseInt(existing.rows[0].count)
            });
        }

        // Create Small Loans Workflow
        const smallId = uuidv4();
        await db.query(`
            INSERT INTO approval_workflows (id, name, description, entity_type, min_amount, max_amount, is_active, is_default)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [smallId, 'Small Loans Workflow', 'For loans under KES 50,000 - requires Risk approval', 'loan', 0, 49999.99, true, false]);

        await db.query(`
            INSERT INTO workflow_steps (workflow_id, step_order, step_name, role_id, approvers_required, description)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [smallId, 1, 'Risk Assessment', riskRole.id, 1, 'Risk officer reviews and approves small loan']);

        // Create Medium Loans Workflow
        const mediumId = uuidv4();
        await db.query(`
            INSERT INTO approval_workflows (id, name, description, entity_type, min_amount, max_amount, is_active, is_default)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [mediumId, 'Medium Loans Workflow', 'For loans KES 50,000 - 200,000 - requires Risk + Finance approval', 'loan', 50000, 200000, true, true]);

        const mediumStep1Id = uuidv4();
        const mediumStep2Id = uuidv4();
        await db.query(`
            INSERT INTO workflow_steps (id, workflow_id, step_order, step_name, role_id, approvers_required, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [mediumStep1Id, mediumId, 1, 'Risk Assessment', riskRole.id, 1, 'Risk officer assesses loan risk']);

        await db.query(`
            INSERT INTO workflow_steps (id, workflow_id, step_order, step_name, role_id, approvers_required, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [mediumStep2Id, mediumId, 2, 'Financial Review', financeRole.id, 1, 'Finance officer reviews financial viability']);

        // Create Large Loans Workflow
        const largeId = uuidv4();
        await db.query(`
            INSERT INTO approval_workflows (id, name, description, entity_type, min_amount, max_amount, is_active, is_default)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [largeId, 'Large Loans Workflow', 'For loans over KES 200,000 - requires Risk + Finance + Admin approval', 'loan', 200000.01, 999999999, true, false]);

        const largeStep1Id = uuidv4();
        const largeStep2Id = uuidv4();
        const largeStep3Id = uuidv4();

        await db.query(`
            INSERT INTO workflow_steps (id, workflow_id, step_order, step_name, role_id, approvers_required, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [largeStep1Id, largeId, 1, 'Risk Assessment', riskRole.id, 1, 'Risk officer assesses loan risk']);

        await db.query(`
            INSERT INTO workflow_steps (id, workflow_id, step_order, step_name, role_id, approvers_required, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [largeStep2Id, largeId, 2, 'Financial Review', financeRole.id, 1, 'Finance officer reviews financial viability']);

        await db.query(`
            INSERT INTO workflow_steps (id, workflow_id, step_order, step_name, role_id, approvers_required, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [largeStep3Id, largeId, 3, 'Executive Approval', adminRole.id, 1, 'Admin provides final approval']);

        res.json({
            success: true,
            message: 'Workflows seeded successfully!',
            workflows: [
                { name: 'Small Loans', range: '< KES 50,000', steps: 1 },
                { name: 'Medium Loans', range: 'KES 50,000 - 200,000', steps: 2 },
                { name: 'Large Loans', range: '> KES 200,000', steps: 3 }
            ]
        });

    } catch (error) {
        console.error('Workflow seed error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Run guarantor opt-in migration
 * GET /api/migrate-guarantor
 */
router.get('/migrate-guarantor', async (req, res) => {
    try {
        console.log('🔄 Running guarantor opt-in migration...');

        // Check if columns already exist
        const checkColumns = await db.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'users'
            AND column_name IN ('can_be_guarantor', 'max_shares_to_guarantee')
        `);

        if (checkColumns.rows.length === 2) {
            return res.json({
                success: true,
                message: 'Guarantor columns already exist',
                columns: checkColumns.rows.map(r => r.column_name)
            });
        }

        // Add guarantor opt-in columns
        await db.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS can_be_guarantor BOOLEAN DEFAULT false
        `);

        await db.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS max_shares_to_guarantee INTEGER DEFAULT 0
        `);

        // Update existing users to have default values
        await db.query(`
            UPDATE users
            SET can_be_guarantor = false, max_shares_to_guarantee = 0
            WHERE can_be_guarantor IS NULL
        `);

        // Add index for faster guarantor searches
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_users_can_be_guarantor
            ON users(can_be_guarantor)
            WHERE can_be_guarantor = true
        `);

        // Update loan_guarantors status constraint
        await db.query(`
            ALTER TABLE loan_guarantors DROP CONSTRAINT IF EXISTS loan_guarantors_status_check
        `);

        await db.query(`
            ALTER TABLE loan_guarantors
            ADD CONSTRAINT loan_guarantors_status_check
            CHECK (status IN ('pending', 'accepted', 'declined', 'released'))
        `);

        res.json({
            success: true,
            message: 'Guarantor opt-in migration completed successfully!',
            changes: [
                'Added users.can_be_guarantor column',
                'Added users.max_shares_to_guarantee column',
                'Updated loan_guarantors status constraint',
                'Created index on can_be_guarantor'
            ]
        });

    } catch (error) {
        console.error('Guarantor migration error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
