const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../sacco.db');

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});

function run(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) return reject(err);
            resolve(this);
        });
    });
}

function get(query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function all(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

async function seed() {
    try {
        console.log('Starting seed...');

        // 1. CLEAR EXISTING DATA
        const tables = [
            'admin_notifications', 'member_profile_forms', 'welfare_payments', 'shares',
            'savings', 'sacco_savings', 'reports', 'registration_fees', 'payment_transactions',
            'notifications', 'messages', 'member_documents', 'loan_repayments', 'loan_guarantors',
            'loans', 'admin_verifications', 'admin_actions', 'users'
        ];

        // Disable foreign keys temporarily to allow truncating in any order
        await run('PRAGMA foreign_keys = OFF');

        for (const table of tables) {
            // Check if table exists before deleting
            const tableExists = await get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [table]);
            if (tableExists) {
                await run(`DELETE FROM ${table}`);
                // Reset autoincrement
                await run(`DELETE FROM sqlite_sequence WHERE name=?`, [table]);
                console.log(`Cleared table: ${table}`);
            }
        }

        await run('PRAGMA foreign_keys = ON');

        // 2. SEED USERS (10 records: 2 admin, 8 members)
        const passwordHash = await bcrypt.hash('password123', 10);
        const users = [];

        // Admins
        for (let i = 1; i <= 2; i++) {
            const id = uuidv4();
            await run(`
                INSERT INTO users (id, email, password_hash, full_name, phone_number, role, is_active, registration_paid, email_verified)
                VALUES (?, ?, ?, ?, ?, ?, 1, 1, 1)
            `, [id, `admin${i}@sacco.com`, passwordHash, `Admin User ${i}`, `070000000${i}`, 'admin']);
            users.push({ id, role: 'admin' });
        }

        // Members
        const specificUserEmail = 'karani.mq@gmail.com';
        const specificUserId = uuidv4();

        await run(`
            INSERT INTO users (id, email, password_hash, full_name, phone_number, role, is_active, registration_paid, email_verified)
            VALUES (?, ?, ?, ?, ?, ?, 1, 1, 1)
        `, [specificUserId, specificUserEmail, passwordHash, 'KaraniMQ Test User', '0700112233', 'member']);
        users.push({ id: specificUserId, role: 'member' });
        console.log(`Seeded specific user: ${specificUserEmail}`);

        for (let i = 1; i <= 8; i++) {
            const id = uuidv4();
            await run(`
                INSERT INTO users (id, email, password_hash, full_name, phone_number, role, is_active, registration_paid, email_verified)
                VALUES (?, ?, ?, ?, ?, ?, 1, 1, 1)
            `, [id, `member${i}@sacco.com`, passwordHash, `Member User ${i}`, `071100000${i}`, 'member']);
            users.push({ id, role: 'member' });
        }
        console.log('Seeded 10 users');

        // Filter for members
        const members = users.filter(u => u.role === 'member');
        const admins = users.filter(u => u.role === 'admin');

        // 3. SEED REGISTRATION FEES (10 records)
        // Assume all seeded users paid
        for (const user of users) {
            await run(`
                INSERT INTO registration_fees (id, user_id, amount, payment_date, transaction_ref)
                VALUES (?, ?, ?, datetime('now'), ?)
            `, [uuidv4(), user.id, 1000, `REG-${Date.now()}-${Math.floor(Math.random() * 1000)}`]);
        }
        console.log('Seeded 10 registration fees');

        // 4. SEED SHARES (10 records)
        for (let i = 0; i < 10; i++) {
            const user = members[i % members.length]; // Distribute among members
            await run(`
                INSERT INTO shares (id, user_id, quantity, amount_paid, purchase_date, status)
                VALUES (?, ?, ?, ?, datetime('now'), 'active')
            `, [uuidv4(), user.id, 10, 5000]);
        }
        console.log('Seeded 10 shares');

        // 5. SEED WELFARE PAYMENTS (10 records)
        for (let i = 0; i < 10; i++) {
            const user = members[i % members.length];
            await run(`
                INSERT INTO welfare_payments (id, user_id, amount, payment_date, payment_method, transaction_ref)
                VALUES (?, ?, ?, datetime('now'), 'mpesa', ?)
            `, [uuidv4(), user.id, 300, `WEL-${Date.now()}-${i}`]);
        }
        console.log('Seeded 10 welfare payments');

        // 6. SEED PAYMENT TRANSACTIONS (10 records)
        for (let i = 0; i < 10; i++) {
            const user = users[i % users.length];
            await run(`
                INSERT INTO payment_transactions (id, user_id, amount, type, payment_method, transaction_ref, status)
                VALUES (?, ?, ?, 'shares', 'mpesa', ?, 'completed')
            `, [uuidv4(), user.id, 5000, `TXN-${Date.now()}-${i}`]);
        }
        console.log('Seeded 10 payment transactions');

        // 7. SEED SACCO SAVINGS (10 records - years)
        for (let i = 0; i < 10; i++) {
            const year = 2020 + i;
            await run(`
                INSERT INTO sacco_savings (id, year, total_interest_collected)
                VALUES (?, ?, ?)
            `, [uuidv4(), year, 10000 * (i + 1)]);
        }
        console.log('Seeded 10 sacco savings');

        // 8. SEED SAVINGS (10 records)
        for (let i = 0; i < 10; i++) {
            const user = members[i % members.length];
            await run(`
                INSERT INTO savings (id, user_id, year, amount, type)
                VALUES (?, ?, ?, ?, 'transfer')
            `, [uuidv4(), user.id, 2024, 5000]);
        }
        console.log('Seeded 10 savings');

        // 9. SEED LOANS (10 records)
        const loans = [];
        for (let i = 0; i < 10; i++) {
            const user = members[i % members.length];
            const loanId = uuidv4();
            await run(`
                INSERT INTO loans (id, borrower_id, requested_amount, approved_amount, interest_rate, repayment_months, status, balance_remaining, created_at, approved_at, due_date)
                VALUES (?, ?, ?, ?, 3.0, 6, 'active', ?, datetime('now'), datetime('now'), datetime('now', '+6 months'))
            `, [loanId, user.id, 10000, 10000, 10000]);
            loans.push(loanId);
        }
        console.log('Seeded 10 loans');

        // 10. SEED LOAN GUARANTORS (10 records)
        // Need to find a guarantor distinct from borrower, but for simplicity I'll just pick another member
        for (let i = 0; i < 10; i++) {
            const loanId = loans[i];
            // Find borrower of this loan
            const loan = await get(`SELECT borrower_id FROM loans WHERE id = ?`, [loanId]);
            const guarantor = members.find(m => m.id !== loan.borrower_id) || members[0];

            await run(`
                INSERT INTO loan_guarantors (id, loan_id, guarantor_id, shares_pledged, amount_covered, status, responded_at)
                VALUES (?, ?, ?, ?, ?, 'accepted', datetime('now'))
            `, [uuidv4(), loanId, guarantor.id, 5, 2500]);
        }
        console.log('Seeded 10 loan guarantors');

        // 11. SEED LOAN REPAYMENTS (10 records)
        for (let i = 0; i < 10; i++) {
            const loanId = loans[i];
            const loan = await get(`SELECT borrower_id FROM loans WHERE id = ?`, [loanId]);
            await run(`
                INSERT INTO loan_repayments (id, loan_id, user_id, amount_paid, principal_amount, interest_amount, payment_date, transaction_ref)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?)
            `, [uuidv4(), loanId, loan.borrower_id, 1100, 1000, 100, `REP-${Date.now()}-${i}`]);
        }
        console.log('Seeded 10 loan repayments');

        // 12. SEED MESSAGES (10 records)
        for (let i = 0; i < 10; i++) {
            const sender = users[i % users.length];
            const recipient = users[(i + 1) % users.length];
            await run(`
                INSERT INTO messages (id, sender_id, recipient_id, subject, body, is_read, created_at)
                VALUES (?, ?, ?, 'Hello', 'This is a test message', 0, datetime('now'))
            `, [uuidv4(), sender.id, recipient.id]);
        }
        console.log('Seeded 10 messages');

        // 13. SEED NOTIFICATIONS (10 records)
        for (let i = 0; i < 10; i++) {
            const user = users[i % users.length];
            await run(`
                INSERT INTO notifications (id, user_id, type, title, message, is_read, created_at)
                VALUES (?, ?, 'info', 'Welcome', 'Welcome to the system', 0, datetime('now'))
            `, [uuidv4(), user.id]);
        }
        console.log('Seeded 10 notifications');

        // 14. SEED ADMIN ACTIONS (10 records)
        const adminActions = [];
        for (let i = 0; i < 10; i++) {
            const admin = admins[i % admins.length];
            const actionId = uuidv4();
            await run(`
                INSERT INTO admin_actions (id, initiated_by, action_type, entity_type, entity_id, reason, status, action_data, created_at)
                VALUES (?, ?, 'update', 'user', ?, 'Routine check', 'pending', '{}', datetime('now'))
            `, [actionId, admin.id, uuidv4()]);
            adminActions.push(actionId);
        }
        console.log('Seeded 10 admin actions');

        // 15. SEED ADMIN VERIFICATIONS (10 records)
        for (let i = 0; i < 10; i++) {
            const actionId = adminActions[i];
            const verifier = admins[(i + 1) % admins.length]; // Different admin if possible
            await run(`
                INSERT INTO admin_verifications (id, action_id, verifier_id, decision, comment, created_at)
                VALUES (?, ?, ?, 'approved', 'Looks good', datetime('now'))
            `, [uuidv4(), actionId, verifier.id]);
        }
        console.log('Seeded 10 admin verifications');

        // 16. SEED REPORTS (10 records)
        for (let i = 0; i < 10; i++) {
            const admin = admins[i % admins.length];
            await run(`
                INSERT INTO reports (report_type, generated_by, filters, data, created_at)
                VALUES ('financial', ?, '{}', '{}', datetime('now'))
            `, [admin.id]);
        }
        console.log('Seeded 10 reports');

        console.log('Seeding completed successfully.');

    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        db.close();
    }
}

seed();
