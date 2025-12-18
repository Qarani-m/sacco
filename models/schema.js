const schema = `
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    is_active INTEGER DEFAULT 1,
    registration_paid INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verification_token TEXT,
    verification_token_expires DATETIME,
    email_verified INTEGER DEFAULT 0,
    CHECK (role IN ('member', 'admin'))
);

CREATE TABLE IF NOT EXISTS admin_actions (
    id TEXT PRIMARY KEY,
    initiated_by TEXT NOT NULL,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    action_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(initiated_by) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (action_type IN ('create', 'update', 'delete')),
    CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE TABLE IF NOT EXISTS admin_verifications (
    id TEXT PRIMARY KEY,
    action_id TEXT NOT NULL,
    verifier_id TEXT NOT NULL,
    decision TEXT NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(action_id, verifier_id),
    FOREIGN KEY(action_id) REFERENCES admin_actions(id) ON DELETE CASCADE,
    FOREIGN KEY(verifier_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (decision IN ('approved', 'rejected'))
);

CREATE TABLE IF NOT EXISTS loans (
    id TEXT PRIMARY KEY,
    borrower_id TEXT NOT NULL,
    requested_amount REAL NOT NULL,
    approved_amount REAL,
    interest_rate REAL NOT NULL DEFAULT 3.00,
    repayment_months INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    balance_remaining REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    due_date DATETIME,
    FOREIGN KEY(borrower_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (repayment_months <= 6),
    CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'paid'))
);

CREATE TABLE IF NOT EXISTS loan_guarantors (
    id TEXT PRIMARY KEY,
    loan_id TEXT NOT NULL,
    guarantor_id TEXT NOT NULL,
    shares_pledged INTEGER NOT NULL,
    amount_covered REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME,
    FOREIGN KEY(loan_id) REFERENCES loans(id) ON DELETE CASCADE,
    FOREIGN KEY(guarantor_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (status IN ('pending', 'accepted', 'declined'))
);

CREATE TABLE IF NOT EXISTS loan_repayments (
    id TEXT PRIMARY KEY,
    loan_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    amount_paid REAL NOT NULL,
    principal_amount REAL NOT NULL,
    interest_amount REAL NOT NULL,
    payment_date DATETIME NOT NULL,
    transaction_ref TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(loan_id) REFERENCES loans(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS member_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_by TEXT,
    reviewed_at DATETIME,
    rejection_reason TEXT,
    UNIQUE(member_id, document_type),
    FOREIGN KEY(member_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    CHECK (status IN ('pending', 'approved', 'rejected', 'in_review'))
);

CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    recipient_id TEXT NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    parent_message_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(parent_message_id) REFERENCES messages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_entity_type TEXT,
    related_entity_id TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_ref TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (payment_method IN ('mpesa', 'bank', 'cash')),
    CHECK (status IN ('pending', 'completed', 'failed')),
    CHECK (type IN ('registration', 'shares', 'welfare', 'loan_repayment'))
);

CREATE TABLE IF NOT EXISTS registration_fees (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 1000.00,
    payment_date DATETIME NOT NULL,
    transaction_ref TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_type TEXT NOT NULL,
    generated_by TEXT NOT NULL,
    target_user_id INTEGER,
    filters TEXT, -- Stored as JSON string
    data TEXT NOT NULL, -- Stored as JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(generated_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS sacco_savings (
    id TEXT PRIMARY KEY,
    year INTEGER UNIQUE NOT NULL,
    total_interest_collected REAL NOT NULL DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS savings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    year INTEGER NOT NULL,
    amount REAL NOT NULL DEFAULT 0.00,
    type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (type IN ('surplus', 'transfer'))
);

CREATE TABLE IF NOT EXISTS shares (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    amount_paid REAL NOT NULL,
    purchase_date DATETIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (status IN ('active', 'pledged_as_guarantee'))
);

CREATE TABLE IF NOT EXISTS welfare_payments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 300.00,
    payment_date DATETIME NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_ref TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS member_profile_forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    national_id TEXT,
    date_of_birth DATE,
    address TEXT,
    occupation TEXT,
    next_of_kin_name TEXT,
    next_of_kin_phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_notifications (
    id SERIAL PRIMARY KEY,
    admin_id TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    reference_id INTEGER,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(admin_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

module.exports = {
  schema,
};
