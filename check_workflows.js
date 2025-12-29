const db = require('./src/models/db');
const ApprovalWorkflow = require('./src/models/ApprovalWorkflow');

async function checkWorkflows() {
    try {
        console.log("Checking DB Workflows...");

        // Check workflows
        const workflows = await db.query("SELECT * FROM approval_workflows");
        console.log("Existing Workflows:", workflows.rows);

        // Check workflow steps
        const steps = await db.query("SELECT * FROM workflow_steps");
        console.log("Existing Steps:", steps.rows);

        process.exit(0);
    } catch (error) {
        console.error("Error checking workflows:", error);
        process.exit(1);
    }
}

checkWorkflows();
