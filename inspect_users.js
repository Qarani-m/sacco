const db = require('./src/models/db');
const sqlite = require('./src/models/sqlite');

async function inspectTable() {
    try {
        console.log("Connecting...");
        // Ensure connection
        await db.query('SELECT 1');

        console.log("Getting table info...");
        // Use raw sqlite query if possible or db.query
        // PRAGMA table_info returns: cid, name, type, notnull, dflt_value, pk
        const info = await db.query("PRAGMA table_info(users)");
        console.log("Columns:");
        info.rows.forEach(col => {
            console.log(`- ${col.name} (${col.type}) DEFAULT ${col.dflt_value} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PK' : ''}`);
        });

        // Also get foreign key list
        const fks = await db.query("PRAGMA foreign_key_list(users)");
        console.log("\nForeign Keys:");
        fks.rows.forEach(fk => {
            console.log(`- Field ${fk.from} -> ${fk.table}(${fk.to})`);
        });

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        if (error.message === "Database not initialized yet") {
            setTimeout(inspectTable, 1000);
        } else {
            process.exit(1);
        }
    }
}

inspectTable();
