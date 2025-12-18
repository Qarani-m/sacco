const fs = require("fs");
const path = require("path");
const { schema } = require("../models/schema");

const outputPath = path.resolve(__dirname, "../models/db_docker.sql");

console.log("Exporting schema to models/db_docker.sql...");

// Add UUID extension if missing (Postgres specific but good for Docker init)
let sqlContent = "-- Auto-generated from schema.js\n\n";
sqlContent += 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n';
sqlContent += schema;

fs.writeFileSync(outputPath, sqlContent);

console.log("✅ Schema exported successfully.");
