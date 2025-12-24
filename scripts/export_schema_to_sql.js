const fs = require("fs");
const path = require("path");
const { schema } = require("../models/schema");

const outputPathDocker = path.resolve(__dirname, "../models/db_docker.sql");
const outputPathMain = path.resolve(__dirname, "../models/db.sql");

console.log("Exporting schema to SQL files...");

// Add UUID extension if missing (Postgres specific but good for Docker init)
let sqlContent = "-- Auto-generated from schema.js\n\n";
sqlContent += 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n';
sqlContent += schema;

fs.writeFileSync(outputPathDocker, sqlContent);
console.log("✅ Exported to models/db_docker.sql");

fs.writeFileSync(outputPathMain, sqlContent);
console.log("✅ Exported to models/db.sql");
