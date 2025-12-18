const db = require("../models/db");

async function fixDb() {
  console.log("Creating admin_notifications table (Simplified)...");

  // Postgres syntax - No FK
  const pgQuery = `
        CREATE TABLE IF NOT EXISTS admin_notifications (
            id SERIAL PRIMARY KEY,
            admin_id TEXT NOT NULL,
            notification_type TEXT NOT NULL,
            reference_id INTEGER,
            message TEXT NOT NULL,
            read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

  // SQLite syntax - No FK
  const sqliteQuery = `
        CREATE TABLE IF NOT EXISTS admin_notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id TEXT NOT NULL,
            notification_type TEXT NOT NULL,
            reference_id INTEGER,
            message TEXT NOT NULL,
            read BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

  // Allow time for DB connection
  setTimeout(async () => {
    try {
      console.log("Attempting PostgreSQL syntax (No FK)...");
      await db.query(pgQuery);
      console.log(
        "✅ admin_notifications table created successfully (Postgres)"
      );
      process.exit(0);
    } catch (pgError) {
      console.warn("⚠️ Postgres query failed:", pgError.message);

      try {
        console.log("Attempting SQLite syntax (No FK)...");
        await db.query(sqliteQuery);
        console.log(
          "✅ admin_notifications table created successfully (SQLite)"
        );
        process.exit(0);
      } catch (sqliteError) {
        console.error("❌ FATAL: Could not create table.");
        console.error("Postgres Error:", pgError.message);
        console.error("SQLite Error:", sqliteError.message);
        process.exit(1);
      }
    }
  }, 2000);
}

fixDb();
