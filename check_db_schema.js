const db = require('./src/models/db');

async function checkSchema() {
    try {
        console.log("Checking DB Schema...");
        // Wait for DB connection (db.js does it on load but async)
        // We'll just wait a bit or hope the query waits

        // We need to wait for the connection to be established. 
        // The db.js module exports a 'query' function that checks if queryFn is set.
        // It might fail if we call it too fast.

        // Let's perform a simple query to users table
        const result = await db.query("SELECT * FROM users LIMIT 1");
        console.log("Users table columns:", Object.keys(result.rows[0]));

        const hasColumn = Object.keys(result.rows[0]).includes('can_be_guarantor');
        console.log("Has 'can_be_guarantor' column:", hasColumn);

        process.exit(0);
    } catch (error) {
        console.error("Error checking schema:", error);
        // If error is "Database not initialized yet", we might need to wait.
        if (error.message === "Database not initialized yet") {
            console.log("Waiting for DB to initialize...");
            setTimeout(checkSchema, 1000);
        } else {
            process.exit(1);
        }
    }
}

// Start checking
setTimeout(checkSchema, 2000);
