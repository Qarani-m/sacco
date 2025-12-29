#!/usr/bin/env node

/**
 * Script to retroactively assign workflows to existing loans
 * that don't have workflow_id or current_step_id
 *
 * Run with: node scripts/fix-loan-workflows.js
 */

require('dotenv').config();
const db = require('../src/models/db');
const ApprovalWorkflowService = require('../src/services/approvalWorkflowService');

async function fixLoanWorkflows() {
    console.log('🔧 Starting loan workflow fix...\n');

    try {
        // Wait for database to initialize
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get all loans without workflow assignment
        const query = `
            SELECT id, requested_amount, status, borrower_id
            FROM loans
            WHERE workflow_id IS NULL OR current_step_id IS NULL
            ORDER BY created_at DESC
        `;

        const result = await db.query(query);
        const loans = result.rows;

        if (loans.length === 0) {
            console.log('✅ No loans need workflow assignment. All done!');
            process.exit(0);
        }

        console.log(`Found ${loans.length} loans without workflow assignments:\n`);

        let successCount = 0;
        let failCount = 0;

        for (const loan of loans) {
            const loanIdShort = loan.id.substring(0, 8);
            console.log(`Processing loan ${loanIdShort}...`);
            console.log(`  Amount: KES ${loan.requested_amount}`);
            console.log(`  Status: ${loan.status}`);

            try {
                // Initialize workflow for this loan
                const workflowInfo = await ApprovalWorkflowService.initializeLoanWorkflow(
                    loan.id,
                    loan.requested_amount
                );

                if (workflowInfo && workflowInfo.workflow) {
                    console.log(`  ✅ Assigned: ${workflowInfo.workflow.name}`);
                    console.log(`  Current step: ${workflowInfo.currentStep.step_name}\n`);
                    successCount++;
                } else {
                    console.log(`  ❌ Failed: No workflow returned\n`);
                    failCount++;
                }
            } catch (error) {
                console.log(`  ❌ Error: ${error.message}\n`);
                failCount++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total loans processed: ${loans.length}`);
        console.log(`✅ Successfully assigned: ${successCount}`);
        console.log(`❌ Failed: ${failCount}`);
        console.log('='.repeat(60) + '\n');

        if (failCount > 0) {
            console.log('⚠️  Some loans failed. Check error messages above.');
            console.log('You may need to manually assign workflows to failed loans.\n');
        } else {
            console.log('🎉 All loans now have workflow assignments!\n');
        }

        process.exit(failCount > 0 ? 1 : 0);

    } catch (error) {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n⚠️  Script interrupted by user');
    process.exit(1);
});

// Run the script
console.log('🚀 Loan Workflow Fix Script');
console.log('=' + '='.repeat(60));
console.log('This script will assign workflows to loans missing workflow_id\n');

fixLoanWorkflows();
