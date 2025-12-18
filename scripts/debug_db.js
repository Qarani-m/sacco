const db = require("../models/db");

async function debugDb() {
  console.log("Debugging database...");

  // Query to list tables in Postgres
  const pgQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    `;

  setTimeout(async () => {
    try {
      const res = await db.query(pgQuery);
      console.log(
        "Tables found:",
        res.rows.map((r) => r.table_name)
      );
    } catch (err) {
      console.error("Check tables failed:", err.message);
    }
    process.exit(0);
  }, 2000);
}

debugDb();
