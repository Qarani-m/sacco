const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dbPath = path.resolve(__dirname, "../../data/sacco.db");
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
        db.exec(schema, (err) => {
          if (err) {
            console.error("Error initializing SQLite schema:", err);
            reject(err);
          } else {
            console.log("SQLite schema initialized");
            resolve(db);
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
      const returningColumns = returningMatch[1].trim();

      db.run(cleanText, params, function (err) {
        if (err) return reject(err);

        const lastID = this.lastID;
        const changes = this.changes;

        if ((isInsert || isUpdate) && changes > 0) {
          // Extract table name from the query
          let tableName;
          let idValue = null;

          if (isInsert) {
            const insertMatch = text.match(/INSERT\s+INTO\s+(\w+)/i);
            tableName = insertMatch ? insertMatch[1] : null;

            // For INSERT with explicit id column (UUID), extract id from params
            // Check if the query includes 'id' in the column list
            const columnsMatch = text.match(/INSERT\s+INTO\s+\w+\s*\((.*?)\)/i);
            if (columnsMatch) {
              const columns = columnsMatch[1].split(',').map(c => c.trim());
              const idIndex = columns.indexOf('id');
              if (idIndex !== -1 && params[idIndex]) {
                idValue = params[idIndex]; // Use the UUID from params
              }
            }

            // Fallback to lastID for INTEGER PRIMARY KEY tables
            if (!idValue && lastID) {
              idValue = lastID;
            }
          } else if (isUpdate) {
            const updateMatch = text.match(/UPDATE\s+(\w+)/i);
            tableName = updateMatch ? updateMatch[1] : null;

            // For UPDATE, try to extract id from WHERE clause
            const whereMatch = text.match(/WHERE\s+id\s*=\s*\$(\d+)/i);
            if (whereMatch) {
              const paramIndex = parseInt(whereMatch[1]) - 1;
              if (params[paramIndex]) {
                idValue = params[paramIndex];
              }
            }
          }

          if (tableName && idValue) {
            // Fetch the inserted/updated row using the id
            const selectQuery = `SELECT ${returningColumns} FROM ${tableName} WHERE id = ? `;
            db.get(selectQuery, [idValue], (err, row) => {
              if (err) {
                console.error("Error fetching RETURNING data:", err);
                return resolve({
                  rows: [{}],
                  rowCount: changes,
                });
              }
              resolve({
                rows: row ? [row] : [{}],
                rowCount: changes,
              });
            });
          } else {
            // No table name or id value, return empty object
            resolve({
              rows: [{}],
              rowCount: changes,
            });
          }
        } else {
          resolve({
            rows: [{}],
            rowCount: changes,
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
