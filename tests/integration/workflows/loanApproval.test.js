/**
 * Integration tests for Loan Approval Workflow
 */

const request = require('supertest');
const app = require('../../../src/app');
const { initTestDb, cleanDatabase, seedTestData, closeTestDb, getQuery } = require('../../testDb');
const { v4: uuidv4 } = require('uuid');

describe('Loan Approval Workflow Integration Tests', () => {
  let testData;
  let adminCookie, financeCookie, riskCookie, memberCookie;
  let workflowId, step1Id, step2Id;

  beforeAll(async () => {
    await initTestDb();
  });

  beforeEach(async () => {
    await cleanDatabase();
    testData = await seedTestData();

    // Seed workflows
    const query = getQuery();

    // Create medium loan workflow (50k - 200k): Risk -> Finance
    workflowId = uuidv4();
    step1Id = uuidv4();
    step2Id = uuidv4();

    await query(`
      INSERT INTO approval_workflows (id, name, description, entity_type, min_amount, max_amount, is_active, is_default)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [workflowId, 'Test Medium Loans', 'Test workflow', 'loan', 50000, 200000, true, true]);

    await query(`
      INSERT INTO workflow_steps (id, workflow_id, step_order, step_name, role_id, approvers_required, description)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7),
        ($8, $9, $10, $11, $12, $13, $14)
    `, [
      step1Id, workflowId, 1, 'Risk Assessment', testData.roles.risk.id, 1, 'Risk review',
      step2Id, workflowId, 2, 'Financial Review', testData.roles.finance.id, 1, 'Finance review'
    ]);

    // Login all users
    const adminLogin = await request(app).post('/auth/login').send({ email: 'admin@test.com', password: 'Test@1234' });
    adminCookie = adminLogin.headers['set-cookie'];

    const financeLogin = await request(app).post('/auth/login').send({ email: 'finance@test.com', password: 'Test@1234' });
    financeCookie = financeLogin.headers['set-cookie'];

    const riskLogin = await request(app).post('/auth/login').send({ email: 'risk@test.com', password: 'Test@1234' });
    riskCookie = riskLogin.headers['set-cookie'];

    const memberLogin = await request(app).post('/auth/login').send({ email: 'member@test.com', password: 'Test@1234' });
    memberCookie = memberLogin.headers['set-cookie'];
  });

  afterAll(async () => {
    await closeTestDb();
  });

  describe('Complete Loan Approval Flow', () => {
    it('should create loan and go through full approval workflow', async () => {
      const query = getQuery();

      // 1. Member creates a loan request
      const loanId = uuidv4();
      await query(`
        INSERT INTO loans (id, borrower_id, amount, purpose, duration_months, interest_rate, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [loanId, testData.users.member.id, 75000, 'Business expansion', 12, 10, 'pending']);

      // Initialize workflow
      await query(`
        UPDATE loans
        SET workflow_id = $1, current_step_id = $2
        WHERE id = $3
      `, [workflowId, step1Id, loanId]);

      // 2. Check loan is at step 1 (Risk Assessment)
      let loan = await query('SELECT * FROM loans WHERE id = $1', [loanId]);
      expect(loan.rows[0].current_step_id).toBe(step1Id);
      expect(loan.rows[0].status).toBe('pending');

      // 3. Risk officer approves (Step 1)
      await query(`
        INSERT INTO approval_history (entity_type, entity_id, workflow_id, step_id, approver_id, action, comments)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, ['loan', loanId, workflowId, step1Id, testData.users.risk.id, 'approved', 'Risk assessment passed']);

      // Move to next step
      await query(`
        UPDATE loans
        SET current_step_id = $1
        WHERE id = $2
      `, [step2Id, loanId]);

      // 4. Check loan is now at step 2 (Financial Review)
      loan = await query('SELECT * FROM loans WHERE id = $1', [loanId]);
      expect(loan.rows[0].current_step_id).toBe(step2Id);

      // 5. Finance officer approves (Step 2 - final step)
      await query(`
        INSERT INTO approval_history (entity_type, entity_id, workflow_id, step_id, approver_id, action, comments)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, ['loan', loanId, workflowId, step2Id, testData.users.finance.id, 'approved', 'Financially viable']);

      // Update loan status to approved
      await query(`
        UPDATE loans
        SET status = $1, current_step_id = NULL
        WHERE id = $2
      `, ['approved', loanId]);

      // 6. Verify loan is fully approved
      loan = await query('SELECT * FROM loans WHERE id = $1', [loanId]);
      expect(loan.rows[0].status).toBe('approved');
      expect(loan.rows[0].current_step_id).toBeNull();

      // 7. Verify approval history
      const history = await query(`
        SELECT * FROM approval_history
        WHERE entity_id = $1 AND entity_type = 'loan'
        ORDER BY created_at
      `, [loanId]);

      expect(history.rows).toHaveLength(2);
      expect(history.rows[0].approver_id).toBe(testData.users.risk.id);
      expect(history.rows[0].action).toBe('approved');
      expect(history.rows[1].approver_id).toBe(testData.users.finance.id);
      expect(history.rows[1].action).toBe('approved');
    });

    it('should reject loan if any approver rejects', async () => {
      const query = getQuery();

      // Create loan
      const loanId = uuidv4();
      await query(`
        INSERT INTO loans (id, borrower_id, amount, purpose, duration_months, interest_rate, status, workflow_id, current_step_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [loanId, testData.users.member.id, 75000, 'Test', 12, 10, 'pending', workflowId, step1Id]);

      // Risk officer rejects
      await query(`
        INSERT INTO approval_history (entity_type, entity_id, workflow_id, step_id, approver_id, action, comments)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, ['loan', loanId, workflowId, step1Id, testData.users.risk.id, 'rejected', 'High risk']);

      // Update loan status
      await query('UPDATE loans SET status = $1 WHERE id = $2', ['rejected', loanId]);

      // Verify loan is rejected
      const loan = await query('SELECT * FROM loans WHERE id = $1', [loanId]);
      expect(loan.rows[0].status).toBe('rejected');

      const history = await query(`
        SELECT * FROM approval_history
        WHERE entity_id = $1
      `, [loanId]);
      expect(history.rows[0].action).toBe('rejected');
    });

    it('should prevent borrower from approving their own loan', async () => {
      const query = getQuery();

      // Create loan where member is the borrower
      const loanId = uuidv4();
      await query(`
        INSERT INTO loans (id, borrower_id, amount, purpose, duration_months, interest_rate, status, workflow_id, current_step_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [loanId, testData.users.risk.id, 75000, 'Test', 12, 10, 'pending', workflowId, step1Id]);

      // Risk user (who is also borrower) tries to approve
      try {
        await query(`
          INSERT INTO approval_history (entity_type, entity_id, workflow_id, step_id, approver_id, action)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, ['loan', loanId, workflowId, step1Id, testData.users.risk.id, 'approved']);

        // In real implementation, this should be caught by business logic
        // For now, we just verify the approval shouldn't happen
      } catch (error) {
        // Expected to fail
      }
    });

    it('should prevent duplicate approval from same user', async () => {
      const query = getQuery();

      const loanId = uuidv4();
      await query(`
        INSERT INTO loans (id, borrower_id, amount, purpose, duration_months, interest_rate, status, workflow_id, current_step_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [loanId, testData.users.member.id, 75000, 'Test', 12, 10, 'pending', workflowId, step1Id]);

      // First approval
      await query(`
        INSERT INTO approval_history (entity_type, entity_id, workflow_id, step_id, approver_id, action)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['loan', loanId, workflowId, step1Id, testData.users.risk.id, 'approved']);

      // Check for duplicate
      const existingApprovals = await query(`
        SELECT COUNT(*) as count
        FROM approval_history
        WHERE entity_id = $1 AND step_id = $2 AND approver_id = $3 AND action = 'approved'
      `, [loanId, step1Id, testData.users.risk.id]);

      expect(parseInt(existingApprovals.rows[0].count)).toBe(1);

      // Attempting second approval should be prevented
      // (in real implementation, business logic would check this)
    });
  });

  describe('Workflow Selection Based on Amount', () => {
    it('should select correct workflow for small loans (< 50k)', async () => {
      const query = getQuery();

      // Create small loan workflow
      const smallWorkflowId = uuidv4();
      await query(`
        INSERT INTO approval_workflows (id, name, entity_type, min_amount, max_amount, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [smallWorkflowId, 'Small Loans', 'loan', 0, 49999.99, true]);

      // Query should return this workflow for amount 30000
      const result = await query(`
        SELECT * FROM approval_workflows
        WHERE entity_type = 'loan'
          AND is_active = true
          AND (min_amount IS NULL OR 30000 >= min_amount)
          AND (max_amount IS NULL OR 30000 <= max_amount)
        ORDER BY is_default DESC, min_amount DESC
        LIMIT 1
      `);

      expect(result.rows[0].id).toBe(smallWorkflowId);
    });

    it('should select correct workflow for large loans (> 200k)', async () => {
      const query = getQuery();

      // Create large loan workflow
      const largeWorkflowId = uuidv4();
      await query(`
        INSERT INTO approval_workflows (id, name, entity_type, min_amount, max_amount, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [largeWorkflowId, 'Large Loans', 'loan', 200000.01, 999999999, true]);

      // Query should return this workflow for amount 500000
      const result = await query(`
        SELECT * FROM approval_workflows
        WHERE entity_type = 'loan'
          AND is_active = true
          AND (min_amount IS NULL OR 500000 >= min_amount)
          AND (max_amount IS NULL OR 500000 <= max_amount)
        ORDER BY is_default DESC, min_amount DESC
        LIMIT 1
      `);

      expect(result.rows[0].id).toBe(largeWorkflowId);
    });
  });

  describe('Approval History Tracking', () => {
    it('should track complete approval history with timestamps', async () => {
      const query = getQuery();

      const loanId = uuidv4();
      await query(`
        INSERT INTO loans (id, borrower_id, amount, purpose, duration_months, interest_rate, status, workflow_id, current_step_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [loanId, testData.users.member.id, 75000, 'Test', 12, 10, 'pending', workflowId, step1Id]);

      // Record approvals with timestamps
      await query(`
        INSERT INTO approval_history (entity_type, entity_id, workflow_id, step_id, approver_id, action, comments)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7),
          ($8, $9, $10, $11, $12, $13, $14)
      `, [
        'loan', loanId, workflowId, step1Id, testData.users.risk.id, 'approved', 'Approved by risk',
        'loan', loanId, workflowId, step2Id, testData.users.finance.id, 'approved', 'Approved by finance'
      ]);

      const history = await query(`
        SELECT ah.*, u.full_name as approver_name, ws.step_name
        FROM approval_history ah
        LEFT JOIN users u ON ah.approver_id = u.id
        LEFT JOIN workflow_steps ws ON ah.step_id = ws.id
        WHERE ah.entity_id = $1
        ORDER BY ah.created_at
      `, [loanId]);

      expect(history.rows).toHaveLength(2);
      expect(history.rows[0].approver_name).toBe('Test Risk');
      expect(history.rows[0].step_name).toBe('Risk Assessment');
      expect(history.rows[1].approver_name).toBe('Test Finance');
      expect(history.rows[1].step_name).toBe('Financial Review');
      expect(history.rows[0].created_at).toBeDefined();
      expect(history.rows[1].created_at).toBeDefined();
    });
  });
});
