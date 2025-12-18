const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dbPath = path.resolve(__dirname, "../sacco.db");
const { schema } = require("./schema");

let db;

const bcrypt = require("bcryptjs");

// UUID will be imported dynamically
let uuidv4;

function connect() {
  return new Promise(async (resolve, reject) => {
    // Dynamic import for UUID (ESM)
    if (!uuidv4) {
      const uuidModule = await import("uuid");
      uuidv4 = uuidModule.v4;
    }

    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Error opening SQLite database:", err);
        reject(err);
      } else {
        console.log("Connected to SQLite database at", dbPath);
        db.exec(schema, async (err) => {
          if (err) {
            console.error("Error initializing SQLite schema:", err);
            reject(err);
          } else {
            console.log("SQLite schema initialized");

            // Auto-seed if empty
            try {
              db.get(
                "SELECT count(*) as count FROM users",
                async (err, row) => {
                  if (err) {
                    console.error("Error checking users:", err);
                    // Non-fatal, just resolve
                    resolve(db);
                    return;
                  }

                  if (row && row.count === 0) {
                    console.log("Seeding SQLite database...");
                    const salt = await bcrypt.genSalt(10);
                    const passwordHash = await bcrypt.hash("password123", salt);
                    const adminId = uuidv4();
                    const memberId = uuidv4();

                    const stmt = db.prepare(
                      "INSERT INTO users (id, email, password_hash, full_name, phone_number, role, is_active, email_verified) VALUES (?, ?, ?, ?, ?, ?, 1, 1)"
                    );

                    stmt.run(
                      adminId,
                      "admin@sacco.com",
                      passwordHash,
                      "System Admin",
                      "0700000000",
                      "admin"
                    );
                    stmt.run(
                      memberId,
                      "member@sacco.com",
                      passwordHash,
                      "John Doe",
                      "0711111111",
                      "member"
                    );
                    stmt.finalize();

                    console.log(
                      "✅ SQLite seeded with admin@sacco.com & member@sacco.com (pass: password123)"
                    );
                  }
                  resolve(db);
                }
              );
            } catch (seedErr) {
              console.error("Seeding error:", seedErr);
              resolve(db);
            }
          }
        });
      }
    });
  });
}

function query(text, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) {
      return reject(new Error("Database not initialized"));
    }

    // Convert Postgres-style parameters ($1, $2) to SQLite style (?)
    let paramIndex = 0;
    const sqliteText = text.replace(/\$\d+/g, () => "?");

    // Handle RETURNING clause (rough approximation for simple cases)
    const isInsert = /^\s*INSERT\s+/i.test(text);
    const isUpdate = /^\s*UPDATE\s+/i.test(text);
    const returningMatch = text.match(/RETURNING\s+(.*)/i);
    const hasReturning = !!returningMatch;

    if (hasReturning) {
      // Remove RETURNING clause for SQLite execution
      const cleanText = sqliteText.replace(/RETURNING\s+.*/i, "");

      db.run(cleanText, params, function (err) {
        if (err) return reject(err);

        if (isInsert && this.lastID) {
          // For auto-increment ID, fetch the row
          // BUT our schema uses UUIDs mostly, which are generated in app or DB defaults?
          // The schema.js doesn't show default UUIDs in SQLite, so models MUST generate them.

          // If the model provided a UUID, we can't easily fetch back without knowing it.
          // Assumption: Models provide IDs or we rely on 'changes'.

          resolve({
            rows: [{ id: this.lastID, ...params }], // Mock return
            rowCount: this.changes,
          });
        } else {
          // Start of complex RETURNING handling
          // For now, return what we can.
          // Ideally models should be updated to not rely on RETURNING if possible,
          // or we do a subsequent SELECT if we have the ID.

          resolve({
            rows: [{}], // Empty object as fallback checking
            rowCount: this.changes,
          });
        }
      });
    } else if (/^\s*SELECT\s+/i.test(text)) {
      db.all(sqliteText, params, (err, rows) => {
        if (err) return reject(err);
        resolve({ rows, rowCount: rows.length });
      });
    } else {
      db.run(sqliteText, params, function (err) {
        if (err) return reject(err);
        resolve({ rows: [], rowCount: this.changes });
      });
    }
  });
}

// Ensure UUIDs are generated if needed before insert?
// Actually, it's better to hook into the existing query logic.

module.exports = {
  connect,
  query,
};
