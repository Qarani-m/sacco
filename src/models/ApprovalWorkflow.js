const db = require('./db');

class ApprovalWorkflow {
    /**
     * Get all workflows
     */
    static async getAll() {
        const query = `
      SELECT * FROM approval_workflows
      WHERE is_active = true
      ORDER BY min_amount
    `;
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Get workflow by ID
     */
    static async findById(workflowId) {
        const query = `SELECT * FROM approval_workflows WHERE id = $1`;
        const result = await db.query(query, [workflowId]);
        return result.rows[0];
    }

    /**
     * Get appropriate workflow for loan amount
     */
    static async getWorkflowForAmount(amount, entityType = 'loan') {
        const query = `
      SELECT * FROM approval_workflows
      WHERE entity_type = $1
        AND is_active = true
        AND (min_amount IS NULL OR $2 >= min_amount)
        AND (max_amount IS NULL OR $2 <= max_amount)
      ORDER BY is_default DESC, min_amount DESC
      LIMIT 1
    `;
        const result = await db.query(query, [entityType, amount]);
        return result.rows[0];
    }

    /**
     * Get workflow steps
     */
    static async getSteps(workflowId) {
        const query = `
      SELECT ws.*, r.name as role_name
      FROM workflow_steps ws
      LEFT JOIN roles r ON ws.role_id = r.id
      WHERE ws.workflow_id = $1
      ORDER BY ws.step_order
    `;
        const result = await db.query(query, [workflowId]);
        return result.rows;
    }

    /**
     * Get next step in workflow
     */
    static async getNextStep(workflowId, currentStepOrder = 0) {
        const query = `
      SELECT * FROM workflow_steps
      WHERE workflow_id = $1 AND step_order > $2
      ORDER BY step_order
      LIMIT 1
    `;
        const result = await db.query(query, [workflowId, currentStepOrder]);
        return result.rows[0];
    }

    /**
     * Check if workflow is complete
     */
    static async isWorkflowComplete(workflowId, currentStepOrder) {
        const query = `
      SELECT COUNT(*) as count
      FROM workflow_steps
      WHERE workflow_id = $1 AND step_order > $2
    `;
        const result = await db.query(query, [workflowId, currentStepOrder]);
        return parseInt(result.rows[0].count) === 0;
    }

    /**
     * Create new workflow
     */
    static async create(workflowData) {
        const { name, description, entity_type, min_amount, max_amount, is_default } = workflowData;
        const query = `
      INSERT INTO approval_workflows (name, description, entity_type, min_amount, max_amount, is_default)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
        const result = await db.query(query, [name, description, entity_type, min_amount, max_amount, is_default]);
        return result.rows[0];
    }

    /**
     * Add step to workflow
     */
    static async addStep(stepData) {
        const { workflow_id, step_order, step_name, role_id, approvers_required, description } = stepData;
        const query = `
      INSERT INTO workflow_steps (workflow_id, step_order, step_name, role_id, approvers_required, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
        const result = await db.query(query, [workflow_id, step_order, step_name, role_id, approvers_required, description]);
        return result.rows[0];
    }

    /**
     * Record approval action
     */
    static async recordApproval(approvalData) {
        const { entity_type, entity_id, workflow_id, step_id, approver_id, action, comments } = approvalData;
        const query = `
      INSERT INTO approval_history (entity_type, entity_id, workflow_id, step_id, approver_id, action, comments)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
        const result = await db.query(query, [entity_type, entity_id, workflow_id, step_id, approver_id, action, comments]);
        return result.rows[0];
    }

    /**
     * Get approval history for entity
     */
    static async getApprovalHistory(entityType, entityId) {
        const query = `
      SELECT ah.*, u.full_name as approver_name, u.email as approver_email,
             ws.step_name, ws.step_order, r.name as role_name
      FROM approval_history ah
      LEFT JOIN users u ON ah.approver_id = u.id
      LEFT JOIN workflow_steps ws ON ah.step_id = ws.id
      LEFT JOIN roles r ON ws.role_id = r.id
      WHERE ah.entity_type = $1 AND ah.entity_id = $2
      ORDER BY ah.created_at
    `;
        const result = await db.query(query, [entityType, entityId]);
        return result.rows;
    }

    /**
     * Check if user can approve current step
     */
    static async canUserApprove(userId, stepId) {
        const query = `
      SELECT COUNT(*) as count
      FROM workflow_steps ws
      INNER JOIN users u ON u.role_id = ws.role_id
      WHERE ws.id = $1 AND u.id = $2
    `;
        const result = await db.query(query, [stepId, userId]);
        return parseInt(result.rows[0].count) > 0;
    }

    /**
     * Check if user has already approved
     */
    static async hasUserApproved(userId, entityType, entityId, stepId) {
        const query = `
      SELECT COUNT(*) as count
      FROM approval_history
      WHERE approver_id = $1 
        AND entity_type = $2 
        AND entity_id = $3 
        AND step_id = $4
        AND action = 'approved'
    `;
        const result = await db.query(query, [userId, entityType, entityId, stepId]);
        return parseInt(result.rows[0].count) > 0;
    }

    /**
     * Get approvals count for step
     */
    static async getApprovalsCount(entityType, entityId, stepId) {
        const query = `
      SELECT COUNT(*) as count
      FROM approval_history
      WHERE entity_type = $1 
        AND entity_id = $2 
        AND step_id = $3
        AND action = 'approved'
    `;
        const result = await db.query(query, [entityType, entityId, stepId]);
        return parseInt(result.rows[0].count);
    }
}

module.exports = ApprovalWorkflow;
