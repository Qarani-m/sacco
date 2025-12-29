const db = require('../db');
const bcrypt = require('bcrypt');

async function seedAdmins() {
    try {
        // Check existing admins
        const checkQuery = "SELECT COUNT(*) FROM users WHERE role = 'admin'";
        const checkResult = await db.query(checkQuery);
        const adminCount = parseInt(checkResult.rows[0].count);

        if (adminCount >= 3) {
            console.log('Admins already seeded (Found ' + adminCount + ')');
            process.exit(0);
        }

        const adminsToCreate = 3 - adminCount;
        console.log(`Seeding ${adminsToCreate} admin(s)...`);

        const defaultPassword = await bcrypt.hash('Admin@123', 10);

        for (let i = 1; i <= adminsToCreate; i++) {
            const suffix = adminCount + i;
            const email = `admin${suffix}@sacco.com`;
            
            await db.query(`
                INSERT INTO users (email, password_hash, full_name, phone_number, role, is_active, registration_paid)
                VALUES ($1, $2, $3, $4, 'admin', true, true)
            `, [email, defaultPassword, `Admin User ${suffix}`, `070000000${suffix}`]);
            
            console.log(`Created ${email}`);
        }

        console.log('Admin seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedAdmins();
