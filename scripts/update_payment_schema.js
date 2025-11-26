const db = require('../models/db');

async function updateSchema() {
    try {
        console.log('Updating payment_transactions table schema...');
        
        // Add used_registered_number column if it doesn't exist
        const query = `
            ALTER TABLE payment_transactions 
            ADD COLUMN IF NOT EXISTS used_registered_number BOOLEAN DEFAULT FALSE;
        `;
        
        await db.query(query);
        console.log('Schema updated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Schema update failed:', error);
        process.exit(1);
    }
}

updateSchema();
