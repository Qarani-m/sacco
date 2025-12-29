/**
 * Unit tests for Approval Workflow Service
 */

const ApprovalWorkflowService = require('../../../src/services/approvalWorkflowService');
const ApprovalWorkflow = require('../../../src/models/ApprovalWorkflow');
const Loan = require('../../../src/models/Loan');

jest.mock('../../../src/models/ApprovalWorkflow');
jest.mock('../../../src/models/Loan');
jest.mock('../../../src/models/User');

describe('ApprovalWorkflowService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeLoanWorkflow', () => {
    it('should initialize workflow for a loan', async () => {
      const loanId = 'loan-123';
      const loanAmount = 75000;

      const mockWorkflow = {
        id: 'workflow-123',
        name: 'Medium Loans Workflow',
        min_amount: 50000,
        max_amount: 200000
      };

      const mockSteps = [
        { id: 'step-1', step_order: 1, step_name: 'Risk Assessment' },
        { id: 'step-2', step_order: 2, step_name: 'Financial Review' }
      ];

      ApprovalWorkflow.getWorkflowForAmount.mockResolvedValueOnce(mockWorkflow);
      ApprovalWorkflow.getSteps.mockResolvedValueOnce(mockSteps);
      Loan.updateWorkflow.mockResolvedValueOnce({});

      const result = await ApprovalWorkflowService.initializeLoanWorkflow(loanId, loanAmount);

      expect(ApprovalWorkflow.getWorkflowForAmount).toHaveBeenCalledWith(loanAmount, 'loan');
      expect(ApprovalWorkflow.getSteps).toHaveBeenCalledWith(mockWorkflow.id);
      expect(Loan.updateWorkflow).toHaveBeenCalledWith(loanId, mockWorkflow.id, mockSteps[0].id);
      expect(result).toEqual({
        workflow: mockWorkflow,
        currentStep: mockSteps[0],
        allSteps: mockSteps
      });
    });

    it('should throw error if no workflow found', async () => {
      ApprovalWorkflow.getWorkflowForAmount.mockResolvedValueOnce(null);

      await expect(
        ApprovalWorkflowService.initializeLoanWorkflow('loan-123', 75000)
      ).rejects.toThrow('No workflow found for loan amount');
    });

    it('should throw error if workflow has no steps', async () => {
      const mockWorkflow = { id: 'workflow-123' };
      ApprovalWorkflow.getWorkflowForAmount.mockResolvedValueOnce(mockWorkflow);
      ApprovalWorkflow.getSteps.mockResolvedValueOnce([]);

      await expect(
        ApprovalWorkflowService.initializeLoanWorkflow('loan-123', 75000)
      ).rejects.toThrow('Workflow has no steps');
    });
  });

  describe('processApproval', () => {
    it('should record approval and move to next step when step is complete', async () => {
      const loanId = 'loan-123';
      const userId = 'user-456';
      const action = 'approved';

      const mockLoan = {
        id: loanId,
        borrower_id: 'borrower-789',
        workflow_id: 'workflow-123',
        current_step_id: 'step-1'
      };

      const mockSteps = [
        { id: 'step-1', step_order: 1, approvers_required: 1 },
        { id: 'step-2', step_order: 2, approvers_required: 1 }
      ];

      Loan.findById.mockResolvedValueOnce(mockLoan);
      ApprovalWorkflow.canUserApprove.mockResolvedValueOnce(true);
      ApprovalWorkflow.hasUserApproved.mockResolvedValueOnce(false);
      ApprovalWorkflow.recordApproval.mockResolvedValueOnce({});
      ApprovalWorkflow.getSteps.mockResolvedValueOnce(mockSteps);
      ApprovalWorkflow.getApprovalsCount.mockResolvedValueOnce(1);
      ApprovalWorkflow.getNextStep.mockResolvedValueOnce(mockSteps[1]);
      Loan.updateWorkflow.mockResolvedValueOnce({});

      const result = await ApprovalWorkflowService.processApproval(loanId, userId, action);

      expect(ApprovalWorkflow.recordApproval).toHaveBeenCalledWith({
        entity_type: 'loan',
        entity_id: loanId,
        workflow_id: mockLoan.workflow_id,
        step_id: mockLoan.current_step_id,
        approver_id: userId,
        action,
        comments: ''
      });

      expect(Loan.updateWorkflow).toHaveBeenCalledWith(loanId, mockLoan.workflow_id, mockSteps[1].id);
      expect(result.status).toBe('next_step');
    });

    it('should reject if user tries to approve own loan', async () => {
      const loanId = 'loan-123';
      const userId = 'user-456';

      const mockLoan = {
        id: loanId,
        borrower_id: userId,
        workflow_id: 'workflow-123',
        current_step_id: 'step-1'
      };

      Loan.findById.mockResolvedValueOnce(mockLoan);
      ApprovalWorkflow.canUserApprove.mockResolvedValueOnce(true);

      await expect(
        ApprovalWorkflowService.processApproval(loanId, userId, 'approved')
      ).rejects.toThrow('You cannot approve your own loan');
    });

    it('should reject if user already approved this step', async () => {
      const loanId = 'loan-123';
      const userId = 'user-456';

      const mockLoan = {
        id: loanId,
        borrower_id: 'borrower-789',
        workflow_id: 'workflow-123',
        current_step_id: 'step-1'
      };

      Loan.findById.mockResolvedValueOnce(mockLoan);
      ApprovalWorkflow.canUserApprove.mockResolvedValueOnce(true);
      ApprovalWorkflow.hasUserApproved.mockResolvedValueOnce(true);

      await expect(
        ApprovalWorkflowService.processApproval(loanId, userId, 'approved')
      ).rejects.toThrow('You have already approved this step');
    });

    it('should approve loan when all steps complete', async () => {
      const loanId = 'loan-123';
      const userId = 'user-456';

      const mockLoan = {
        id: loanId,
        borrower_id: 'borrower-789',
        workflow_id: 'workflow-123',
        current_step_id: 'step-2'
      };

      const mockSteps = [
        { id: 'step-1', step_order: 1, approvers_required: 1 },
        { id: 'step-2', step_order: 2, approvers_required: 1 }
      ];

      Loan.findById.mockResolvedValueOnce(mockLoan);
      ApprovalWorkflow.canUserApprove.mockResolvedValueOnce(true);
      ApprovalWorkflow.hasUserApproved.mockResolvedValueOnce(false);
      ApprovalWorkflow.recordApproval.mockResolvedValueOnce({});
      ApprovalWorkflow.getSteps.mockResolvedValueOnce(mockSteps);
      ApprovalWorkflow.getApprovalsCount.mockResolvedValueOnce(1);
      ApprovalWorkflow.getNextStep.mockResolvedValueOnce(null);
      Loan.updateStatus.mockResolvedValueOnce({});
      Loan.updateWorkflow.mockResolvedValueOnce({});

      const result = await ApprovalWorkflowService.processApproval(loanId, userId, 'approved');

      expect(Loan.updateStatus).toHaveBeenCalledWith(loanId, 'approved');
      expect(result.status).toBe('approved');
    });
  });

  describe('getWorkflowProgress', () => {
    it('should return workflow progress', async () => {
      const loanId = 'loan-123';

      const mockLoan = {
        id: loanId,
        workflow_id: 'workflow-123',
        current_step_id: 'step-1'
      };

      const mockWorkflow = { id: 'workflow-123', name: 'Medium Loans' };
      const mockSteps = [
        { id: 'step-1', step_order: 1, approvers_required: 1 },
        { id: 'step-2', step_order: 2, approvers_required: 1 }
      ];
      const mockHistory = [];

      Loan.findById.mockResolvedValueOnce(mockLoan);
      ApprovalWorkflow.findById.mockResolvedValueOnce(mockWorkflow);
      ApprovalWorkflow.getSteps.mockResolvedValueOnce(mockSteps);
      ApprovalWorkflow.getApprovalHistory.mockResolvedValueOnce(mockHistory);
      ApprovalWorkflow.getApprovalsCount.mockResolvedValue(0);

      const result = await ApprovalWorkflowService.getWorkflowProgress(loanId);

      expect(result).toHaveProperty('workflow', mockWorkflow);
      expect(result).toHaveProperty('steps');
      expect(result.steps).toHaveLength(2);
      expect(result.currentStepOrder).toBe(1);
      expect(result.totalSteps).toBe(2);
    });

    it('should return null if loan has no workflow', async () => {
      Loan.findById.mockResolvedValueOnce({ id: 'loan-123', workflow_id: null });

      const result = await ApprovalWorkflowService.getWorkflowProgress('loan-123');

      expect(result).toBeNull();
    });
  });
});
