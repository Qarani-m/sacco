const db = require('./db');

class MemberProfile {
    // Create profile form (one-time only)
    static async create(profileData) {
        const { user_id, national_id, date_of_birth, address, occupation, next_of_kin_name, next_of_kin_phone } = profileData;
        
        const query = `
            INSERT INTO member_profile_forms 
            (user_id, national_id, date_of_birth, address, occupation, next_of_kin_name, next_of_kin_phone)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const result = await db.query(query, [
            user_id, national_id, date_of_birth, address, occupation, next_of_kin_name, next_of_kin_phone
        ]);
        return result.rows[0];
    }

    // Find profile by user ID
    static async findByUserId(userId) {
        const query = 'SELECT * FROM member_profile_forms WHERE user_id = $1';
        const result = await db.query(query, [userId]);
        return result.rows[0];
    }

    // Update profile (admin only)
    static async update(userId, profileData) {
        const { national_id, date_of_birth, address, occupation, next_of_kin_name, next_of_kin_phone } = profileData;
        
        const query = `
            UPDATE member_profile_forms
            SET national_id = $1,
                date_of_birth = $2,
                address = $3,
                occupation = $4,
                next_of_kin_name = $5,
                next_of_kin_phone = $6
            WHERE user_id = $7
            RETURNING *
        `;
        
        const result = await db.query(query, [
            national_id, date_of_birth, address, occupation, next_of_kin_name, next_of_kin_phone, userId
        ]);
        return result.rows[0];
    }

    // Check if profile exists
    static async exists(userId) {
        const query = 'SELECT COUNT(*) as count FROM member_profile_forms WHERE user_id = $1';
        const result = await db.query(query, [userId]);
        return parseInt(result.rows[0].count) > 0;
    }
}

module.exports = MemberProfile;
