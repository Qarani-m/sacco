const db = require('./src/models/db');

async function checkRolesTable() {
    try {
        console.log("Checking DB Schema...");

        // Check if roles table exists
        const tablesResult = await db.query(`
            SELECT name FROM sqlite_master WHERE type='table' AND name='roles';
        `);
        console.log("Roles table exists?", tablesResult.rows.length > 0);

        if (tablesResult.rows.length > 0) {
            const roles = await db.query("SELECT * FROM roles");
            console.log("Existing roles:", roles.rows);
        }

        // Check users checks
        const usersSql = await db.query(`
            SELECT sql FROM sqlite_master WHERE type='table' AND name='users';
        `);
        console.log("Users table SQL:", usersSql.rows[0].sql);

        process.exit(0);
    } catch (error) {
        console.error("Error checking schema:", error);
        if (error.message === "Database not initialized yet") {
            setTimeout(checkRolesTable, 1000);
        } else {
            process.exit(1);
        }
    }
}

setTimeout(checkRolesTable, 2000);
