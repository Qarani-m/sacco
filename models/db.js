const { Pool } = require("pg");
require("dotenv").config();
const sqlite = require("./sqlite");

let currentDb = "postgres";
let queryFn;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "sacco",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Initialize connection
(async () => {
  // 1. Try Local PostgreSQL
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL database");
    client.release();
    queryFn = (text, params) => pool.query(text, params);

    pool.on("error", (err) => {
      console.error("Unexpected PostgreSQL error:", err);
    });
    return;
  } catch (err) {
    console.warn("⚠️ PostgreSQL connection failed:", err.message);
  }

  // 2. Try Neon (Serverless Postgres)
  if (process.env.DATABASE_URL) {
    console.log("🔄 Attempting fallback to Neon (Serverless Postgres)...");
    try {
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(process.env.DATABASE_URL);

      // Test connection
      await sql`SELECT 1`;

      currentDb = "neon";
      console.log("✅ Connected to Neon database");

      queryFn = async (text, params) => {
        // Neon driver accepts (query, params) signature
        const rows = await sql(text, params);
        // Adapt to pg-style result object
        return {
          rows: rows,
          rowCount: rows.length,
          // Neon doesn't easily give fields/command info in basic mode, but rows is most important
        };
      };
      return;
    } catch (neonErr) {
      console.warn("⚠️ Neon connection failed:", neonErr.message);
    }
  } else {
    console.log("ℹ️ No DATABASE_URL provided, skipping Neon fallback.");
  }

  // 3. Fallback to SQLite
  console.log("🔄 Attempting fallback to SQLite...");
  try {
    await sqlite.connect();
    currentDb = "sqlite";
    queryFn = sqlite.query;
    console.log("✅ Fallback to SQLite successful");
  } catch (sqliteErr) {
    console.error("❌ FATAL: All database connections failed");
    console.error("SQLite Error:", sqliteErr);
    process.exit(-1);
  }
})();

module.exports = {
  query: (text, params) => {
    if (!queryFn) {
      // Connection pending
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (queryFn) resolve(queryFn(text, params));
          else reject(new Error("Database initializing..."));
        }, 1000);
      });
    }
    return queryFn(text, params);
  },
  pool, // Export pool for legacy direct usage if any, but warn it might be unused in SQLite mode
};
