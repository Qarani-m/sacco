const db = require("./db");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const Role = require("./Role");

class User {
  // Create new user
  static async create(userData) {
    const {
      email,
      password,
      full_name,
      phone_number,
      role = "member",
    } = userData;
    const password_hash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const query = `
            INSERT INTO users (id, email, password_hash, full_name, phone_number, role)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, email, full_name, phone_number, role, is_active, registration_paid, created_at
        `;

    const result = await db.query(query, [
      id,
      email,
      password_hash,
      full_name,
      phone_number,
      role,
    ]);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    // console.log(email)
    const query = "SELECT * FROM users WHERE email = $1";
    // console.log(query)
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  // Find user by phone number
  static async findByPhoneNumber(phoneNumber) {
    const query = "SELECT * FROM users WHERE phone_number = $1";
    const result = await db.query(query, [phoneNumber]);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const query = "SELECT * FROM users WHERE id = $1";
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update registration payment status
  static async markRegistrationPaid(userId, amount = 500) {
    const query = `
            UPDATE users
            SET registration_paid = true, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
    const result = await db.query(query, [userId]);

    // Record registration fee as SACCO income
    try {
      const SaccoIncome = require('./SaccoIncome');
      await SaccoIncome.recordRegistrationFee(userId, amount);
      console.log(`✅ Registration fee income recorded: KES ${amount} for user ${userId.substring(0, 8)}`);
    } catch (error) {
      console.error('⚠️ Failed to record registration fee income:', error.message);
      // Don't fail the registration, just log the error
    }

    return result.rows[0];
  }

  // Get all members
  static async getAllMembers(filters = {}) {
    let query =
      "SELECT id, email, full_name, phone_number, role, is_active, registration_paid, created_at FROM users WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (filters.role) {
      query += ` AND role = $${paramCount}`;
      params.push(filters.role);
      paramCount++;
    }

    if (filters.is_active !== undefined) {
      query += ` AND is_active = $${paramCount}`;
      params.push(filters.is_active);
      paramCount++;
    }

    if (filters.registration_paid !== undefined) {
      query += ` AND registration_paid = $${paramCount}`;
      params.push(filters.registration_paid);
      paramCount++;
    }

    query += " ORDER BY created_at DESC";

    const result = await db.query(query, params);
    return result.rows;
  }

  // Get all admins
  static async getAllAdmins() {
    const query = `
            SELECT id, email, full_name, phone_number, is_active, created_at 
            FROM users 
            WHERE role = 'admin' AND is_active = true
            ORDER BY created_at
        `;
    const result = await db.query(query);
    return result.rows;
  }

  // Seed exactly three admin users if they don't exist
  static async seedAdmins() {
    const existingAdmins = await this.getAllAdmins();
    const needed = 3 - existingAdmins.length;
    if (needed <= 0) return existingAdmins;
    const admins = [];
    for (let i = 0; i < needed; i++) {
      const email = `admin${i + 1}@example.com`;
      const password = "AdminPass123"; // In real life, use env vars
      const password_hash = await bcrypt.hash(password, 10);
      const full_name = `Admin ${i + 1}`;
      const phone_number = `070000000${i}`;
      const role = "admin";
      const query = `
                INSERT INTO users (email, password_hash, full_name, phone_number, role, is_active, registration_paid)
                VALUES ($1, $2, $3, $4, $5, true, true)
                RETURNING id, email, full_name, phone_number, role, is_active, registration_paid
            `;
      const result = await db.query(query, [
        email,
        password_hash,
        full_name,
        phone_number,
        role,
      ]);
      admins.push(result.rows[0]);
    }
    return admins;
  }

  // Update user details
  static async update(userId, updateData) {
    const { full_name, phone_number } = updateData;
    const query = `
            UPDATE users 
            SET full_name = $1, phone_number = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING id, email, full_name, phone_number, role, is_active, registration_paid
        `;
    const result = await db.query(query, [full_name, phone_number, userId]);
    return result.rows[0];
  }

  // Deactivate user
  static async deactivate(userId) {
    const query = `
            UPDATE users 
            SET is_active = false, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  // Activate user
  static async activate(userId) {
    const query = `
            UPDATE users 
            SET is_active = true, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  // Update password
  static async updatePassword(userId, newPassword) {
    const password_hash = await bcrypt.hash(newPassword, 10);
    const query = `
            UPDATE users 
            SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id
        `;
    const result = await db.query(query, [password_hash, userId]);
    return result.rows[0];
  }

  // Check if user has active unpaid loan
  static async hasUnpaidLoan(userId) {
    const query = `
            SELECT COUNT(*) as count 
            FROM loans 
            WHERE borrower_id = $1 
            AND status IN ('approved', 'active') 
            AND balance_remaining > 0
        `;
    const result = await db.query(query, [userId]);
    return parseInt(result.rows[0].count) > 0;
  }

  // Get user statistics
  static async getStats(userId) {
    const query = `
            SELECT 
                (SELECT COALESCE(SUM(quantity), 0) FROM shares WHERE user_id = $1 AND status = 'active') as total_shares,
                (SELECT COALESCE(SUM(amount), 0) FROM savings WHERE user_id = $1) as total_savings,
                (SELECT COUNT(*) FROM loans WHERE borrower_id = $1 AND status = 'active') as active_loans,
                (SELECT COALESCE(SUM(balance_remaining), 0) FROM loans WHERE borrower_id = $1 AND status = 'active') as loan_balance
        `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  // Generate email verification token
  static async generateVerificationToken(userId) {
    const jwt = require("jsonwebtoken");

    // Generate a unique token
    const token = jwt.sign(
      { id: userId, purpose: "email_verification" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set expiry to 24 hours from now in SQLite datetime format
    const currentDb = db.getCurrentDb();
    let expiresAt;

    if (currentDb === 'sqlite') {
      // SQLite datetime format
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    } else {
      // PostgreSQL/Neon can handle JS Date objects
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    // Store token in database
    const query = `
            UPDATE users
            SET verification_token = $1, verification_token_expires = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING id, email, full_name
        `;

    const result = await db.query(query, [token, expiresAt, userId]);
    return { token, user: result.rows[0] };
  }

  // Verify email with token
  static async verifyEmail(token) {
    const jwt = require("jsonwebtoken");

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token exists and hasn't expired
      const query = `
                SELECT * FROM users 
                WHERE id = $1 
                AND verification_token = $2 
                AND verification_token_expires > CURRENT_TIMESTAMP
            `;

      const result = await db.query(query, [decoded.id, token]);

      if (result.rows.length === 0) {
        throw new Error("Invalid or expired verification token");
      }

      const user = result.rows[0];

      // Mark email as verified and clear token
      const updateQuery = `
                UPDATE users 
                SET email_verified = true, 
                    verification_token = NULL, 
                    verification_token_expires = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING id, email, full_name, email_verified
            `;

      const updateResult = await db.query(updateQuery, [user.id]);
      return updateResult.rows[0];
    } catch (error) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        throw new Error("Invalid or expired verification token");
      }
      throw error;
    }
  }

  // Find user by verification token
  static async findByVerificationToken(token) {
    const query = `
            SELECT * FROM users 
            WHERE verification_token = $1 
            AND verification_token_expires > CURRENT_TIMESTAMP
        `;
    const result = await db.query(query, [token]);
    return result.rows[0];
  }

  // Resend verification email
  static async resendVerificationToken(email) {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.email_verified) {
      throw new Error("Email already verified");
    }

    return await this.generateVerificationToken(user.id);
  }

  // ============================================
  // RBAC METHODS
  // ============================================

  /**
   * Get user's role
   */
  static async getRole(userId) {
    const query = `
      SELECT r.id, r.name, r.description, r.is_active
      FROM roles r
      INNER JOIN users u ON u.role_id = r.id
      WHERE u.id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  /**
   * Get user's permissions
   */
  static async getPermissions(userId) {
    const user = await this.findById(userId);
    if (!user || !user.role_id) {
      return [];
    }
    return await Role.getPermissions(user.role_id);
  }

  /**
   * Check if user has specific permission
   */
  static async hasPermission(userId, permissionName) {
    const user = await this.findById(userId);
    if (!user || !user.role_id) {
      return false;
    }
    return await Role.hasPermission(user.role_id, permissionName);
  }

  /**
   * Check if user can perform action (alias for hasPermission)
   */
  static async can(userId, permissionName) {
    return await this.hasPermission(userId, permissionName);
  }

  /**
   * Assign role to user
   */
  static async assignRole(userId, roleId) {
    const query = `
      UPDATE users
      SET role_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, full_name, role_id
    `;
    const result = await db.query(query, [roleId, userId]);
    return result.rows[0];
  }

  /**
   * Get user with role details
   */
  static async findByIdWithRole(userId) {
    const query = `
      SELECT u.*, r.name as role_name, r.description as role_description
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  /**
   * Update guarantor opt-in status
   */
  static async updateGuarantorStatus(userId, canBeGuarantor, maxShares = 0) {
    const query = `
      UPDATE users
      SET can_be_guarantor = $1, max_shares_to_guarantee = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, email, full_name, can_be_guarantor, max_shares_to_guarantee
    `;
    const result = await db.query(query, [canBeGuarantor, maxShares, userId]);
    return result.rows[0];
  }

  /**
   * Get all available guarantors (users who opted in)
   */
  static async getAvailableGuarantors(excludeUserId = null) {
    let query = `
      SELECT id, full_name, email, phone_number, max_shares_to_guarantee
      FROM users
      WHERE can_be_guarantor = true AND is_active = true
    `;
    const params = [];

    if (excludeUserId) {
      query += ' AND id != $1';
      params.push(excludeUserId);
    }

    query += ' ORDER BY full_name';

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Get guarantor status for a user
   */
  static async getGuarantorStatus(userId) {
    const query = `
      SELECT can_be_guarantor, max_shares_to_guarantee
      FROM users
      WHERE id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  /**
   * Check if user can guarantee (has opted in and has available shares)
   */
  static async canGuarantee(userId, sharesRequested) {
    const status = await this.getGuarantorStatus(userId);

    if (!status || !status.can_be_guarantor) {
      return { canGuarantee: false, reason: 'User has not opted in as guarantor' };
    }

    if (sharesRequested > status.max_shares_to_guarantee) {
      return {
        canGuarantee: false,
        reason: `User can only guarantee up to ${status.max_shares_to_guarantee} shares`,
        maxShares: status.max_shares_to_guarantee
      };
    }

    // Check current guarantor commitments
    const LoanGuarantor = require('./LoanGuarantor');
    const activeGuarantees = await db.query(`
      SELECT COALESCE(SUM(lg.shares_pledged), 0) as committed_shares
      FROM loan_guarantors lg
      INNER JOIN loans l ON lg.loan_id = l.id
      WHERE lg.guarantor_id = $1
      AND lg.status IN ('pending', 'accepted')
      AND l.status IN ('pending', 'active')
    `, [userId]);

    const committedShares = parseInt(activeGuarantees.rows[0].committed_shares || 0);
    const availableShares = status.max_shares_to_guarantee - committedShares;

    if (sharesRequested > availableShares) {
      return {
        canGuarantee: false,
        reason: `Only ${availableShares} shares available (${committedShares} already committed)`,
        availableShares,
        committedShares
      };
    }

    return { canGuarantee: true, availableShares, committedShares };
  }
}

module.exports = User;
