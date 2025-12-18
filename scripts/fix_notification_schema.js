const db = require("../models/db");

async function fixNotificationSchema() {
  console.log("Fixing notifications table schema...");

  // Postgres: Change column type to TEXT to support both UUIDs and Integers
  const pgQuery = `
        ALTER TABLE notifications 
        ALTER COLUMN related_entity_id TYPE TEXT;
    `;

  // SQLite: Usually doesn't need this as it's flexible, but we can try generic
  // SQLite doesn't support ALTER COLUMN TYPE directly in verify simple way usually,
  // but the error is from Postgres.

  try {
    console.log("Attempting to alter column type (Postgres)...");
    await db.query(pgQuery);
    console.log(
      "✅ notifications table updated successfully (related_entity_id -> TEXT)"
    );
    process.exit(0);
  } catch (error) {
    console.warn("⚠️ Query failed:", error.message);

    // If error is basic syntax (SQLite), we ignore it as SQLite likely doesn't have the UUID constraint
    if (
      error.message.includes("syntax") ||
      error.message.includes('near "ALTER"')
    ) {
      console.log("Assuming SQLite (no change needed or syntax diff).");
    } else {
      console.error("Error details:", error);
    }
    process.exit(0);
  }
}

fixNotificationSchema();
