// models/Member.js
const db = require('./db');

class Member {
    /**
     * Fetch member account by user ID
     * Expected return shape:
     * { id, name, email, registrationPaid, registrationPaidAt, ... }
     */
    static async getMemberAccount(userId) {
        const query = `
            SELECT id, name, email, registration_paid AS "registrationPaid",
                   registration_paid_at AS "registrationPaidAt"
            FROM members
            WHERE id = $1
            LIMIT 1
        `;
        const result = await db.query(query, [userId]);
        return result.rows[0] || null;
    }

    /**
     * Optionally, create a new member
     */
    static async create(memberData) {
        const { name, email } = memberData;
        const query = `
            INSERT INTO members (name, email, registration_paid)
            VALUES ($1, $2, false)
            RETURNING *
        `;
        const result = await db.query(query, [name, email]);
        return result.rows[0];
    }

    /**
     * Mark registration as paid
     */
    static async markRegistrationPaid(userId) {
        const query = `
            UPDATE members
            SET registration_paid = true,
                registration_paid_at = NOW()
            WHERE id = $1
            RETURNING *
        `;
        const result = await db.query(query, [userId]);
        return result.rows[0];
    }
}

module.exports = { Member, getMemberAccount: Member.getMemberAccount };
