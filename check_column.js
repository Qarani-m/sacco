const db = require('./src/models/db');

async function checkColumn() {
    try {
        console.log("Checking max_shares_to_guarantee...");
        // Wait for connection
        await new Promise(r => setTimeout(r, 2000));

        try {
            const result = await db.query("SELECT max_shares_to_guarantee FROM users LIMIT 1");
            console.log("Column exists!");
        } catch (e) {
            console.log("Column SELECT failed:", e.message);
        }

        const allCols = await db.query("PRAGMA table_info(users)");
        console.log("All columns from PRAGMA:");
        allCols.rows.forEach(c => console.log(c.name));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkColumn();
