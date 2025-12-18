const db = require("../models/db");

async function fixDb() {
  console.log("Fixing database schema (Simplified)...");

  // Postgres syntax - No FK
  const pgQuery = `
        CREATE TABLE IF NOT EXISTS member_profile_forms (
            id SERIAL PRIMARY KEY,
            user_id TEXT NOT NULL,
            national_id TEXT,
            date_of_birth DATE,
            address TEXT,
            occupation TEXT,
            next_of_kin_name TEXT,
            next_of_kin_phone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

  // SQLite syntax - No FK
  const sqliteQuery = `
        CREATE TABLE IF NOT EXISTS member_profile_forms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            national_id TEXT,
            date_of_birth DATE,
            address TEXT,
            occupation TEXT,
            next_of_kin_name TEXT,
            next_of_kin_phone TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

  // Allow time for DB connection
  setTimeout(async () => {
    try {
      console.log("Attempting PostgreSQL syntax (No FK)...");
      await db.query(pgQuery);
      console.log(
        "✅ member_profile_forms table created successfully (Postgres)"
      );
      process.exit(0);
    } catch (pgError) {
      console.warn("⚠️ Postgres query failed:", pgError.message);

      try {
        console.log("Attempting SQLite syntax (No FK)...");
        await db.query(sqliteQuery);
        console.log(
          "✅ member_profile_forms table created successfully (SQLite)"
        );
        process.exit(0);
      } catch (sqliteError) {
        console.error("❌ FATAL: Could not create table.");
        process.exit(1);
      }
    }
  }, 2000);
}

fixDb();
