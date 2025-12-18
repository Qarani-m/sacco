const db = require("../models/db");

async function runMigration() {
  try {
    console.log("Starting migration...");

    await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS "verification_token" VARCHAR(255),
            ADD COLUMN IF NOT EXISTS "verification_token_expires" TIMESTAMP,
            ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN DEFAULT false;
        `);

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
