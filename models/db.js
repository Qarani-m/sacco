const { Pool } = require("pg");
require("dotenv").config();
const sqlite = require("./sqlite");
const { v4: uuidv4 } = require("uuid");

let currentDb = null;
let queryFn = null;
let pool = null;

/* =========================
   USER SEEDING
========================= */
async function seedUsers(query) {
  const passwordHash =
    "$2b$10$sUGv219.b/53Jc./R/C.9.NNINW38t0qWVfw0F3rmh3wB/nftmfQW";

  const users = [
    {
      email: "admin@sacco.com",
      full_name: "System Admin",
      phone_number: "0700000000",
      role: "admin",
    },
    {
      email: "member@sacco.com",
      full_name: "John Doe",
      phone_number: "0711111111",
      role: "member",
    },
  ];

  for (const user of users) {
    try {
      const result = await query(
        "SELECT id FROM users WHERE email = $1",
        [user.email]
      );

      if (!result.rows || result.rows.length === 0) {
        console.log(`🌱 Seeding user: ${user.email}`);
        await query(
          `INSERT INTO users
           (id, email, password_hash, full_name, phone_number, role,
            is_active, email_verified, registration_paid)
           VALUES ($1,$2,$3,$4,$5,$6,1,1,1)`,
          [
            uuidv4(),
            user.email,
            passwordHash,
            user.full_name,
            user.phone_number,
            user.role,
          ]
        );
        console.log(`✅ Seeded: ${user.email}`);
      }
    } catch (err) {
      console.warn(`⚠️ Seed failed for ${user.email}:`, err.message);
    }
  }
}

/* =========================
   DATABASE INITIALIZATION
========================= */
async function connectDatabase() {
  /* ---------- 1. PostgreSQL ---------- */
  try {
    pool = new Pool({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "sacco",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postsgres",
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    const client = await pool.connect();
    client.release();

    queryFn = (text, params) => pool.query(text, params);
    currentDb = "postgres";

    console.log("✅ Connected to PostgreSQL");
    await seedUsers(queryFn);
    return;
  } catch (err) {
    console.warn("⚠️ PostgreSQL failed:", err.message);
  }

  /* ---------- 2. SQLite ---------- */
  try {
    console.log("🔄 Attempting fallback to SQLite...");
    await sqlite.connect();

    queryFn = sqlite.query;
    currentDb = "sqlite";

    console.log("✅ Connected to SQLite");
    await seedUsers(queryFn);
    return;
  } catch (err) {
    console.warn("⚠️ SQLite failed:", err.message);
  }

  /* ---------- 3. Neon (LAST) ---------- */
  if (process.env.DATABASE_URL) {
    try {
      console.log("🔄 Attempting fallback to Neon...");
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(process.env.DATABASE_URL);

      await sql`SELECT 1`;

      queryFn = async (text, params) => {
        const res = await sql.query(text, params);
        return {
          rows: res.rows,
          rowCount: res.rowCount ?? res.rows.length,
        };
      };

      currentDb = "neon";

      console.log("✅ Connected to Neon");
      await seedUsers(queryFn);
      return;
    } catch (err) {
      console.error("❌ Neon failed:", err.message);
    }
  } else {
    console.log("ℹ️ DATABASE_URL not set, skipping Neon");
  }

  console.error("❌ FATAL: No database connection available");
  process.exit(1);
}

/* =========================
   START CONNECTION
========================= */
connectDatabase();

/* =========================
   EXPORTS
========================= */
module.exports = {
  query(text, params) {
    if (!queryFn) {
      return Promise.reject(
        new Error("Database not initialized yet")
      );
    }
    return queryFn(text, params);
  },
  getCurrentDb() {
    return currentDb;
  },
  pool,
};
