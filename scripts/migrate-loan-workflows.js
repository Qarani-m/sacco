#!/usr/bin/env node

/**
 * Direct SQL migration to assign workflows to existing loans
 * Run with: node scripts/migrate-loan-workflows.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'sacco.db');
const db = new sqlite3.Database(dbPath);

async function runQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function runUpdate(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
}

async function assignWorkflows() {
    console.log('🔧 Starting workflow assignment migration...\n');

    try {
        // Get all loans without workflow
        const loans = await runQuery(`
            SELECT id, requested_amount, status
            FROM loans
            WHERE workflow_id IS NULL OR current_step_id IS NULL
            ORDER BY created_at DESC
        `);

        console.log(`Found ${loans.length} loans to fix\n`);

        if (loans.length === 0) {
            console.log('✅ All loans already have workflows assigned!');
            db.close();
            process.exit(0);
        }

        let successCount = 0;
        let failCount = 0;

        for (const loan of loans) {
            const amount = parseFloat(loan.requested_amount);
            const loanIdShort = loan.id.substring(0, 8);

            console.log(`Processing loan ${loanIdShort} (${amount} KES)...`);

            // Determine workflow based on amount
            let workflowId, workflowName, firstStepId;

            if (amount < 50000) {
                // Small loans workflow
                workflowId = 'workflow-small-loans';
                workflowName = 'Small Loans Workflow';
                firstStepId = 'step-small-1';
            } else if (amount <= 200000) {
                // Medium loans workflow (default)
                workflowId = 'workflow-medium-loans';
                workflowName = 'Medium Loans Workflow';
                firstStepId = 'step-medium-1';
            } else {
                // Large loans workflow
                workflowId = 'workflow-large-loans';
                workflowName = 'Large Loans Workflow';
                firstStepId = 'step-large-1';
            }

            try {
                // Verify workflow exists
                const workflow = await runQuery(
                    'SELECT id FROM approval_workflows WHERE id = ?',
                    [workflowId]
                );

                if (workflow.length === 0) {
                    console.log(`  ❌ Workflow ${workflowId} not found in database`);
                    failCount++;
                    continue;
                }

                // Verify step exists
                const step = await runQuery(
                    'SELECT id FROM workflow_steps WHERE id = ?',
                    [firstStepId]
                );

                if (step.length === 0) {
                    console.log(`  ❌ Step ${firstStepId} not found in database`);
                    failCount++;
                    continue;
                }

                // Update the loan
                const changes = await runUpdate(`
                    UPDATE loans
                    SET workflow_id = ?,
                        current_step_id = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [workflowId, firstStepId, loan.id]);

                if (changes > 0) {
                    console.log(`  ✅ Assigned: ${workflowName}`);
                    console.log(`  First step: ${firstStepId}\n`);
                    successCount++;
                } else {
                    console.log(`  ❌ Update failed (no rows changed)\n`);
                    failCount++;
                }

            } catch (error) {
                console.log(`  ❌ Error: ${error.message}\n`);
                failCount++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('MIGRATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total loans: ${loans.length}`);
        console.log(`✅ Successfully assigned: ${successCount}`);
        console.log(`❌ Failed: ${failCount}`);
        console.log('='.repeat(60) + '\n');

        // Verify results
        const remaining = await runQuery(`
            SELECT COUNT(*) as count
            FROM loans
            WHERE workflow_id IS NULL OR current_step_id IS NULL
        `);

        console.log(`Loans still without workflow: ${remaining[0].count}\n`);

        if (remaining[0].count === 0) {
            console.log('🎉 SUCCESS! All loans now have workflows assigned!\n');
        }

        db.close();
        process.exit(failCount > 0 ? 1 : 0);

    } catch (error) {
        console.error('💥 Fatal error:', error);
        db.close();
        process.exit(1);
    }
}

console.log('🚀 Loan Workflow Migration');
console.log('='.repeat(60) + '\n');

assignWorkflows();
