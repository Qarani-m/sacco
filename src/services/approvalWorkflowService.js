
const ApprovalWorkflow = require('../models/ApprovalWorkflow');
const Loan = require('../models/Loan');

class ApprovalWorkflowService {
    /**
     * Initialize workflow for a loan
     */
    static async initializeLoanWorkflow(loanId, loanAmount) {
        try {
            // Get appropriate workflow based on loan amount
            const workflow = await ApprovalWorkflow.getWorkflowForAmount(loanAmount, 'loan');

            if (!workflow) {
                throw new Error('No workflow found for loan amount');
            }

            // Get first step
            const steps = await ApprovalWorkflow.getSteps(workflow.id);
            const firstStep = steps[0];

            if (!firstStep) {
                throw new Error('Workflow has no steps');
            }

            // Update loan with workflow and first step
            await Loan.updateWorkflow(loanId, workflow.id, firstStep.id);

            return {
                workflow,
                currentStep: firstStep,
                allSteps: steps
            };
        } catch (error) {
            console.error('Error initializing workflow:', error);
            throw error;
        }
    }

    /**
     * Process approval action
     */
    static async processApproval(loanId, userId, action, comments = '') {
        try {
            // Get loan details
            const loan = await Loan.findById(loanId);
            if (!loan) {
                throw new Error('Loan not found');
            }

            if (!loan.workflow_id || !loan.current_step_id) {
                throw new Error('Loan workflow not initialized');
            }

            // Check if user can approve this step
            const canApprove = await ApprovalWorkflow.canUserApprove(userId, loan.current_step_id);
            if (!canApprove) {
                throw new Error('User does not have permission to approve this step');
            }

            // Prevent self-approval (borrower cannot approve their own loan)
            if (loan.borrower_id === userId) {
                throw new Error('You cannot approve your own loan');
            }

            // Check if user has already approved this step
            const hasApproved = await ApprovalWorkflow.hasUserApproved(userId, 'loan', loanId, loan.current_step_id);
            if (hasApproved) {
                throw new Error('You have already approved this step');
            }

            // Record the approval/rejection
            await ApprovalWorkflow.recordApproval({
                entity_type: 'loan',
                entity_id: loanId,
                workflow_id: loan.workflow_id,
                step_id: loan.current_step_id,
                approver_id: userId,
                action,
                comments
            });

            // If rejected, update loan status
            if (action === 'rejected') {
                await Loan.updateStatus(loanId, 'rejected');
                return {
                    success: true,
                    status: 'rejected',
                    message: 'Loan has been rejected'
                };
            }

            // Get current step details
            const currentStep = await ApprovalWorkflow.getSteps(loan.workflow_id);
            const step = currentStep.find(s => s.id === loan.current_step_id);

            // Check if step has required approvals
            const approvalsCount = await ApprovalWorkflow.getApprovalsCount('loan', loanId, loan.current_step_id);
            const requiredApprovals = step.approvers_required || 1;

            if (approvalsCount < requiredApprovals) {
                return {
                    success: true,
                    status: 'pending',
                    message: `Approval recorded. ${requiredApprovals - approvalsCount} more approval(s) needed for this step`,
                    approvalsCount,
                    requiredApprovals
                };
            }

            // Step is complete, move to next step
            const nextStep = await ApprovalWorkflow.getNextStep(loan.workflow_id, step.step_order);

            if (nextStep) {
                // Move to next step
                await Loan.updateWorkflow(loanId, loan.workflow_id, nextStep.id);
                return {
                    success: true,
                    status: 'next_step',
                    message: `Step completed. Moving to: ${nextStep.step_name}`,
                    nextStep
                };
            } else {
                // Workflow complete - approve loan
                await Loan.updateStatus(loanId, 'approved');
                await Loan.updateWorkflow(loanId, loan.workflow_id, null); // Clear current step
                return {
                    success: true,
                    status: 'approved',
                    message: 'All approvals complete. Loan has been approved!'
                };
            }
        } catch (error) {
            console.error('Error processing approval:', error);
            throw error;
        }
    }

    /**
     * Get workflow progress for a loan
     */
    static async getWorkflowProgress(loanId) {
        try {
            const loan = await Loan.findById(loanId);
            if (!loan || !loan.workflow_id) {
                return null;
            }

            const workflow = await ApprovalWorkflow.findById(loan.workflow_id);
            const steps = await ApprovalWorkflow.getSteps(loan.workflow_id);
            const history = await ApprovalWorkflow.getApprovalHistory('loan', loanId);

            // Calculate progress for each step
            const stepsWithProgress = await Promise.all(steps.map(async (step) => {
                const approvalsCount = await ApprovalWorkflow.getApprovalsCount('loan', loanId, step.id);
                const isCurrentStep = step.id === loan.current_step_id;
                const isComplete = approvalsCount >= step.approvers_required;
                const isPending = isCurrentStep && !isComplete;

                return {
                    ...step,
                    approvalsCount,
                    isCurrentStep,
                    isComplete,
                    isPending,
                    progress: (approvalsCount / step.approvers_required) * 100
                };
            }));

            return {
                workflow,
                steps: stepsWithProgress,
                history,
                currentStepOrder: steps.find(s => s.id === loan.current_step_id)?.step_order || 0,
                totalSteps: steps.length
            };
        } catch (error) {
            console.error('Error getting workflow progress:', error);
            throw error;
        }
    }

    /**
     * Get pending approvals for a user
     */
    static async getPendingApprovalsForUser(userId) {
        try {
            // Get user's role
            const User = require('../models/User');
            const user = await User.findById(userId);

            if (!user || !user.role_id) {
                return [];
            }

            // Get loans that are in steps matching user's role
            const query = `
        SELECT l.*, ws.step_name, ws.step_order, aw.name as workflow_name,
               u.full_name as borrower_name
        FROM loans l
        INNER JOIN workflow_steps ws ON l.current_step_id = ws.id
        INNER JOIN approval_workflows aw ON l.workflow_id = aw.id
        INNER JOIN users u ON l.borrower_id = u.id
        WHERE ws.role_id = $1
          AND l.status = 'pending'
          AND l.borrower_id != $2
          AND NOT EXISTS (
            SELECT 1 FROM approval_history ah
            WHERE ah.entity_id = l.id
              AND ah.entity_type = 'loan'
              AND ah.step_id = l.current_step_id
              AND ah.approver_id = $2
              AND ah.action = 'approved'
          )
        ORDER BY l.created_at
      `;

            const db = require('../models/db');
            const result = await db.query(query, [user.role_id, userId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting pending approvals:', error);
            throw error;
        }
    }
}

module.exports = ApprovalWorkflowService;
