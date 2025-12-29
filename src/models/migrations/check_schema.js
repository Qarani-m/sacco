const db = require('../db');

async function checkSchema() {
    try {
        const tables = ['sacco_savings_ledger', 'documents', 'member_profile_forms', 'payment_transactions'];
        
        for (const table of tables) {
            const query = `
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `;
            const result = await db.query(query, [table]);
            console.log(`\nTable: ${table}`);
            if (result.rows.length === 0) {
                console.log('  (Table does not exist)');
            } else {
                result.rows.forEach(row => {
                    console.log(`  - ${row.column_name} (${row.data_type})`);
                });
            }
        }
        process.exit(0);
    } catch (error) {
        console.error('Check schema failed:', error);
        process.exit(1);
    }
}

checkSchema();
