const db = require("../models/db");

async function fixAdminActionSchema() {
  console.log("Fixing admin_actions table schema...");

  // Postgres: Change column type to TEXT to support both UUIDs and Integers
  const pgQuery = `
        ALTER TABLE admin_actions 
        ALTER COLUMN entity_id TYPE TEXT;
    `;

  try {
    console.log("Attempting to alter column type (Postgres)...");
    await db.query(pgQuery);
    console.log(
      "✅ admin_actions table updated successfully (entity_id -> TEXT)"
    );
    process.exit(0);
  } catch (error) {
    console.warn("⚠️ Query failed:", error.message);

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

fixAdminActionSchema();
