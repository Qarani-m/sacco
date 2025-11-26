const User = require('../models/User');
const db = require('../models/db');

async function seed() {
    try {
        console.log('Seeding admin users...');
        const admins = await User.seedAdmins();
        console.log(`Seeded ${admins.length} admin users.`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
