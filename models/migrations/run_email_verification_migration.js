const db = require('../db');

async function runMigration() {
    try {
        console.log('Running email verification migration...');
        
        // Add email verification columns
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS verification_token TEXT,
            ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP;
        `);
        
        console.log('✓ Added email verification columns');
        
        // Create index
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
        `);
        
        console.log('✓ Created verification token index');
        console.log('Migration completed successfully!');
        
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
