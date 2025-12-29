const db = require('./src/models/db');
const { v4: uuidv4 } = require('uuid');

async function seedWorkflows() {
    try {
        console.log("🌱 Seeding Default Workflows...");

        // Wait for DB init
        await new Promise(r => setTimeout(r, 2000));

        // 1. Get Roles
        const roleRisk = (await db.query("SELECT id FROM roles WHERE name = 'Risk'")).rows[0];
        const roleFinance = (await db.query("SELECT id FROM roles WHERE name = 'Finance'")).rows[0];
        const roleDisbursement = (await db.query("SELECT id FROM roles WHERE name = 'Disbursement Officer'")).rows[0];
        const roleAdmin = (await db.query("SELECT id FROM roles WHERE name = 'Admin'")).rows[0];

        if (!roleRisk || !roleFinance || !roleDisbursement) {
            console.error("❌ Missing required roles (Risk, Finance, Disbursement). Please ensure roles are seeded first.");
            // Determine fallback? Or just use Admin if others missing? 
            // For now, fail.
        }

        // 2. Create Workflow Header
        const workflowId = uuidv4();
        await db.query(`
            INSERT INTO approval_workflows (id, name, description, entity_type, is_default, is_active)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [workflowId, 'Standard Loan Approval', 'Default approval workflow for loans', 'loan', true, true]);

        console.log("Created Workflow:", workflowId);

        // 3. Create Steps
        // Step 1: Risk Assessment
        await db.query(`
            INSERT INTO workflow_steps (workflow_id, step_order, step_name, role_id, approvers_required, description)
            VALUES ($1, 1, 'Risk Assessment', $2, 1, 'Review creditworthiness and risk')
        `, [workflowId, roleRisk ? roleRisk.id : roleAdmin.id]);

        // Step 2: Finance Approval (if > 10000? or always?)
        await db.query(`
            INSERT INTO workflow_steps (workflow_id, step_order, step_name, role_id, approvers_required, description)
            VALUES ($1, 2, 'Finance Review', $2, 1, 'financial capability check')
        `, [workflowId, roleFinance ? roleFinance.id : roleAdmin.id]);

        // Step 3: Disbursement Authorization
        // Note: Disbursement Officer usually handles the actual disbursement action, not necessarily an "approval step" 
        // But if they need to "approve" that it's ready, we can add it.
        // Let's add it as a step.
        /* 
        await db.query(`
            INSERT INTO workflow_steps (workflow_id, step_order, step_name, role_id, approvers_required, description)
            VALUES ($1, 3, 'Disbursement Check', $2, 1, 'Final check before payout')
        `, [workflowId, roleDisbursement ? roleDisbursement.id : roleAdmin.id]);
        */

        console.log("✅ Seeded Default Workflow Steps");
        process.exit(0);

    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seedWorkflows();
