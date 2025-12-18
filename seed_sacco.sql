-- SACCO Database Seed Script
-- This script seeds the database with 50 records per table
-- Run this script in PostgreSQL connected to the 'sacco' database

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clear existing data (optional - uncomment if needed)
-- TRUNCATE TABLE admin_verifications, admin_actions, loan_repayments, loan_guarantors, loans, 
-- messages, notifications, payment_transactions, registration_fees, reports, savings, 
-- sacco_savings, shares, welfare_payments, users CASCADE;

-- ============================================
-- 1. SEED USERS TABLE (50 records)
-- ============================================
INSERT INTO users (id, email, password_hash, full_name, phone_number, role, is_active, registration_paid, email_verified)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin1@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'John Admin', '+254701000001', 'admin', true, true, true),
    ('00000000-0000-0000-0000-000000000002', 'admin2@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Jane Admin', '+254701000002', 'admin', true, true, true),
    ('00000000-0000-0000-0000-000000000003', 'admin3@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Peter Admin', '+254701000003', 'admin', true, true, true),
    ('00000000-0000-0000-0000-000000000004', 'member001@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Alice Wanjiru', '+254722000001', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000005', 'member002@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Bob Kamau', '+254722000002', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000006', 'member003@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Catherine Njeri', '+254722000003', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000007', 'member004@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'David Otieno', '+254722000004', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000008', 'member005@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Emma Akinyi', '+254722000005', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000009', 'member006@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Frank Mwangi', '+254722000006', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000010', 'member007@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Grace Wambui', '+254722000007', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000011', 'member008@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Henry Ochieng', '+254722000008', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000012', 'member009@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Irene Nyambura', '+254722000009', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000013', 'member010@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'James Kipchoge', '+254722000010', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000014', 'member011@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Karen Mutua', '+254722000011', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000015', 'member012@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Leonard Kiprotich', '+254722000012', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000016', 'member013@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Mary Wairimu', '+254722000013', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000017', 'member014@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Nathan Omondi', '+254722000014', 'member', true, false, true),
    ('00000000-0000-0000-0000-000000000018', 'member015@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Olivia Chebet', '+254722000015', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000019', 'member016@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Patrick Njenga', '+254722000016', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000020', 'member017@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Queen Achieng', '+254722000017', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000021', 'member018@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Robert Kimani', '+254722000018', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000022', 'member019@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Sarah Chepkoech', '+254722000019', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000023', 'member020@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Thomas Mbugua', '+254722000020', 'member', true, false, false),
    ('00000000-0000-0000-0000-000000000024', 'member021@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Udith Langat', '+254722000021', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000025', 'member022@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Violet Nyokabi', '+254722000022', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000026', 'member023@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'William Kariuki', '+254722000023', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000027', 'member024@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Yvonne Jepkosgei', '+254722000024', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000028', 'member025@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Zachary Gitau', '+254722000025', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000029', 'member026@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Abigail Nafula', '+254722000026', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000030', 'member027@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Brian Koech', '+254722000027', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000031', 'member028@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Cynthia Wangari', '+254722000028', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000032', 'member029@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Dennis Opiyo', '+254722000029', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000033', 'member030@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Esther Jemutai', '+254722000030', 'member', false, false, true),
    ('00000000-0000-0000-0000-000000000034', 'member031@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Felix Mutiso', '+254722000031', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000035', 'member032@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Gladys Cherotich', '+254722000032', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000036', 'member033@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Harrison Njoroge', '+254722000033', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000037', 'member034@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Ivy Adhiambo', '+254722000034', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000038', 'member035@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Joseph Ruto', '+254722000035', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000039', 'member036@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Kimberly Wanjiku', '+254722000036', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000040', 'member037@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Lewis Okoth', '+254722000037', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000041', 'member038@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Monica Jelimo', '+254722000038', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000042', 'member039@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Nicholas Karanja', '+254722000039', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000043', 'member040@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Pamela Anyango', '+254722000040', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000044', 'member041@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Quincy Sang', '+254722000041', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000045', 'member042@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Rose Muthoni', '+254722000042', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000046', 'member043@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Samuel Kiprop', '+254722000043', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000047', 'member044@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Tabitha Wangui', '+254722000044', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000048', 'member045@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Victor Owino', '+254722000045', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000049', 'member046@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Winnie Jeptoo', '+254722000046', 'member', true, true, true),
    ('00000000-0000-0000-0000-000000000050', 'member047@sacco.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Xavier Ndungu', '+254722000047', 'member', true, true, true);

-- ============================================
-- 2. SEED REGISTRATION_FEES TABLE (50 records)
-- ============================================
INSERT INTO registration_fees (user_id, amount, payment_date, transaction_ref)
SELECT 
    id,
    1000.00,
    created_at + interval '1 hour',
    'REG-' || LPAD((ROW_NUMBER() OVER())::text, 6, '0')
FROM users
WHERE registration_paid = true
LIMIT 50;

-- ============================================
-- 3. SEED SHARES TABLE (50 records)
-- ============================================
INSERT INTO shares (user_id, quantity, amount_paid, purchase_date, status)
SELECT 
    id,
    (RANDOM() * 100 + 10)::integer,
    (RANDOM() * 50000 + 5000)::numeric(10,2),
    created_at + interval '2 days',
    CASE WHEN RANDOM() < 0.8 THEN 'active' ELSE 'pledged_as_guarantee' END
FROM users
WHERE role = 'member'
LIMIT 50;

-- ============================================
-- 4. SEED WELFARE_PAYMENTS TABLE (50 records)
-- ============================================
INSERT INTO welfare_payments (user_id, amount, payment_date, payment_method, transaction_ref)
SELECT 
    id,
    300.00,
    created_at + (RANDOM() * interval '30 days'),
    CASE 
        WHEN RANDOM() < 0.6 THEN 'mpesa'
        WHEN RANDOM() < 0.9 THEN 'bank'
        ELSE 'cash'
    END,
    'WEL-' || LPAD((ROW_NUMBER() OVER())::text, 6, '0')
FROM users
WHERE role = 'member'
LIMIT 50;

-- ============================================
-- 5. SEED PAYMENT_TRANSACTIONS TABLE (50 records)
-- ============================================
INSERT INTO payment_transactions (user_id, amount, type, payment_method, transaction_ref, status, payment_transactions_type_check)
SELECT 
    id,
    (RANDOM() * 10000 + 500)::numeric(10,2),
    CASE 
        WHEN n % 4 = 0 THEN 'registration'
        WHEN n % 4 = 1 THEN 'shares'
        WHEN n % 4 = 2 THEN 'welfare'
        ELSE 'loan_repayment'
    END,
    CASE 
        WHEN RANDOM() < 0.6 THEN 'mpesa'
        WHEN RANDOM() < 0.9 THEN 'bank'
        ELSE 'cash'
    END,
    'TXN-' || LPAD(n::text, 6, '0'),
    CASE 
        WHEN RANDOM() < 0.85 THEN 'completed'
        WHEN RANDOM() < 0.95 THEN 'pending'
        ELSE 'failed'
    END,
    'shares'
FROM (
    SELECT id, ROW_NUMBER() OVER() as n
    FROM users
    WHERE role = 'member'
    LIMIT 50
) sub;

-- ============================================
-- 6. SEED SACCO_SAVINGS TABLE (50 records)
-- ============================================
INSERT INTO sacco_savings (year, total_interest_collected)
SELECT 
    year,
    (RANDOM() * 500000 + 100000)::numeric(10,2)
FROM generate_series(1975, 2024) as year
LIMIT 50;

-- ============================================
-- 7. SEED SAVINGS TABLE (50 records)
-- ============================================
INSERT INTO savings (user_id, year, amount, type)
SELECT 
    id,
    2024 - (RANDOM() * 5)::integer,
    (RANDOM() * 50000 + 5000)::numeric(10,2),
    CASE WHEN RANDOM() < 0.5 THEN 'surplus' ELSE 'transfer' END
FROM users
WHERE role = 'member'
LIMIT 50;

-- ============================================
-- 8. SEED LOANS TABLE (50 records)
-- ============================================
INSERT INTO loans (id, borrower_id, requested_amount, approved_amount, interest_rate, repayment_months, status, balance_remaining, approved_at, due_date)
SELECT 
    uuid_generate_v4(),
    id,
    (RANDOM() * 100000 + 10000)::numeric(10,2),
    CASE 
        WHEN n % 5 = 0 THEN NULL
        ELSE (RANDOM() * 80000 + 8000)::numeric(10,2)
    END,
    1.00,
    (RANDOM() * 5 + 1)::integer,
    CASE 
        WHEN n % 5 = 0 THEN 'pending'
        WHEN n % 5 = 1 THEN 'approved'
        WHEN n % 5 = 2 THEN 'active'
        WHEN n % 5 = 3 THEN 'paid'
        ELSE 'rejected'
    END,
    CASE 
        WHEN n % 5 IN (2, 3) THEN (RANDOM() * 50000)::numeric(10,2)
        ELSE NULL
    END,
    CASE 
        WHEN n % 5 != 0 THEN NOW() - (RANDOM() * interval '60 days')
        ELSE NULL
    END,
    CASE 
        WHEN n % 5 IN (1, 2) THEN NOW() + (RANDOM() * interval '180 days')
        ELSE NULL
    END
FROM (
    SELECT id, ROW_NUMBER() OVER() as n
    FROM users
    WHERE role = 'member'
    LIMIT 50
) sub;

-- ============================================
-- 9. SEED LOAN_GUARANTORS TABLE (50 records)
-- ============================================
WITH active_loans AS (
    SELECT id as loan_id, borrower_id, ROW_NUMBER() OVER() as rn
    FROM loans
    WHERE status IN ('approved', 'active')
    LIMIT 50
),
potential_guarantors AS (
    SELECT id, ROW_NUMBER() OVER() as rn
    FROM users
    WHERE role = 'member'
)
INSERT INTO loan_guarantors (loan_id, guarantor_id, shares_pledged, amount_covered, status, responded_at)
SELECT 
    al.loan_id,
    pg.id,
    (RANDOM() * 50 + 10)::integer,
    (RANDOM() * 20000 + 5000)::numeric(10,2),
    CASE 
        WHEN RANDOM() < 0.7 THEN 'accepted'
        WHEN RANDOM() < 0.9 THEN 'pending'
        ELSE 'declined'
    END,
    CASE 
        WHEN RANDOM() < 0.8 THEN NOW() - (RANDOM() * interval '30 days')
        ELSE NULL
    END
FROM active_loans al
JOIN potential_guarantors pg ON pg.rn = al.rn + 1
WHERE pg.id != (SELECT borrower_id FROM loans WHERE id = al.loan_id)
LIMIT 50;

-- ============================================
-- 10. SEED LOAN_REPAYMENTS TABLE (50 records)
-- ============================================
WITH active_loans AS (
    SELECT id, borrower_id
    FROM loans
    WHERE status IN ('active', 'paid')
    LIMIT 50
)
INSERT INTO loan_repayments (loan_id, user_id, amount_paid, principal_amount, interest_amount, payment_date, transaction_ref)
SELECT 
    id,
    borrower_id,
    (RANDOM() * 15000 + 3000)::numeric(10,2),
    (RANDOM() * 12000 + 2500)::numeric(10,2),
    (RANDOM() * 3000 + 500)::numeric(10,2),
    NOW() - (RANDOM() * interval '90 days'),
    'LNREP-' || LPAD((ROW_NUMBER() OVER())::text, 6, '0')
FROM active_loans;

-- ============================================
-- 11. SEED NOTIFICATIONS TABLE (50 records)
-- ============================================
INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id, is_read)
SELECT 
    id,
    CASE 
        WHEN n % 5 = 0 THEN 'loan_approved'
        WHEN n % 5 = 1 THEN 'payment_received'
        WHEN n % 5 = 2 THEN 'guarantor_request'
        WHEN n % 5 = 3 THEN 'share_purchase'
        ELSE 'system_announcement'
    END,
    CASE 
        WHEN n % 5 = 0 THEN 'Loan Approved'
        WHEN n % 5 = 1 THEN 'Payment Confirmed'
        WHEN n % 5 = 2 THEN 'Guarantor Request'
        WHEN n % 5 = 3 THEN 'Shares Purchased'
        ELSE 'System Announcement'
    END,
    CASE 
        WHEN n % 5 = 0 THEN 'Your loan application has been approved'
        WHEN n % 5 = 1 THEN 'Your payment has been received and processed'
        WHEN n % 5 = 2 THEN 'You have been requested as a loan guarantor'
        WHEN n % 5 = 3 THEN 'Your share purchase was successful'
        ELSE 'Important system update available'
    END,
    CASE 
        WHEN n % 5 = 0 THEN 'loan'
        WHEN n % 5 = 1 THEN 'payment'
        WHEN n % 5 = 2 THEN 'loan_guarantor'
        WHEN n % 5 = 3 THEN 'share'
        ELSE NULL
    END,
    uuid_generate_v4(),
    RANDOM() < 0.6
FROM (
    SELECT id, ROW_NUMBER() OVER() as n
    FROM users
    LIMIT 50
) sub;

-- ============================================
-- 12. SEED MESSAGES TABLE (50 records)
-- ============================================
WITH user_pairs AS (
    SELECT 
        u1.id as sender_id,
        u2.id as recipient_id,
        ROW_NUMBER() OVER() as n
    FROM users u1
    CROSS JOIN users u2
    WHERE u1.id != u2.id
    LIMIT 50
)
INSERT INTO messages (sender_id, recipient_id, subject, body, is_read, parent_message_id)
SELECT 
    sender_id,
    recipient_id,
    CASE 
        WHEN n % 4 = 0 THEN 'Loan Inquiry'
        WHEN n % 4 = 1 THEN 'Share Purchase Question'
        WHEN n % 4 = 2 THEN 'Guarantor Request'
        ELSE 'General Inquiry'
    END,
    CASE 
        WHEN n % 4 = 0 THEN 'I would like to inquire about loan eligibility requirements.'
        WHEN n % 4 = 1 THEN 'What is the current share price and purchasing process?'
        WHEN n % 4 = 2 THEN 'Could you please act as guarantor for my loan application?'
        ELSE 'I have a question about my account status.'
    END,
    RANDOM() < 0.5,
    NULL
FROM user_pairs;

-- ============================================
-- 13. SEED ADMIN_ACTIONS TABLE (50 records)
-- ============================================
WITH admin_users AS (
    SELECT id FROM users WHERE role = 'admin' LIMIT 3
)
INSERT INTO admin_actions (initiated_by, action_type, entity_type, entity_id, reason, status, action_data)
SELECT 
    (SELECT id FROM admin_users ORDER BY RANDOM() LIMIT 1),
    CASE 
        WHEN n % 3 = 0 THEN 'create'
        WHEN n % 3 = 1 THEN 'update'
        ELSE 'delete'
    END,
    CASE 
        WHEN n % 4 = 0 THEN 'loan'
        WHEN n % 4 = 1 THEN 'user'
        WHEN n % 4 = 2 THEN 'share'
        ELSE 'payment'
    END,
    uuid_generate_v4(),
    CASE 
        WHEN n % 3 = 0 THEN 'Creating new record as requested by member'
        WHEN n % 3 = 1 THEN 'Updating information due to member request'
        ELSE 'Deleting invalid or duplicate record'
    END,
    CASE 
        WHEN RANDOM() < 0.5 THEN 'pending'
        WHEN RANDOM() < 0.8 THEN 'approved'
        ELSE 'rejected'
    END,
    jsonb_build_object(
        'amount', (RANDOM() * 50000)::numeric(10,2),
        'notes', 'Administrative action',
        'priority', CASE WHEN RANDOM() < 0.3 THEN 'high' ELSE 'normal' END
    )
FROM generate_series(1, 50) as n;

-- ============================================
-- 14. SEED ADMIN_VERIFICATIONS TABLE (50 records)
-- ============================================
WITH admin_actions_list AS (
    SELECT id, ROW_NUMBER() OVER() as rn FROM admin_actions LIMIT 50
),
admin_users AS (
    SELECT id, ROW_NUMBER() OVER() as rn FROM users WHERE role = 'admin'
)
INSERT INTO admin_verifications (action_id, verifier_id, decision, comment)
SELECT 
    aa.id,
    au.id,
    CASE WHEN RANDOM() < 0.7 THEN 'approved' ELSE 'rejected' END,
    CASE 
        WHEN RANDOM() < 0.7 THEN 'Verified and approved. All documentation is in order.'
        ELSE 'Rejected due to insufficient documentation or policy violation.'
    END
FROM admin_actions_list aa
JOIN admin_users au ON au.rn = (aa.rn % 3) + 1
LIMIT 50;

-- ============================================
-- 15. SEED REPORTS TABLE (50 records)
-- ============================================
WITH admin_users AS (
    SELECT id FROM users WHERE role = 'admin'
)
INSERT INTO reports (report_type, generated_by, target_user_id, filters, data)
SELECT 
    CASE 
        WHEN n % 5 = 0 THEN 'monthly_financial'
        WHEN n % 5 = 1 THEN 'loan_performance'
        WHEN n % 5 = 2 THEN 'member_activity'
        WHEN n % 5 = 3 THEN 'share_distribution'
        ELSE 'payment_summary'
    END,
    (SELECT id FROM admin_users ORDER BY RANDOM() LIMIT 1),
    NULL,
    jsonb_build_object(
        'start_date', (NOW() - interval '30 days')::date,
        'end_date', NOW()::date,
        'category', 'financial'
    ),
    jsonb_build_object(
        'total_amount', (RANDOM() * 1000000)::numeric(10,2),
        'transaction_count', (RANDOM() * 500)::integer,
        'average_amount', (RANDOM() * 5000)::numeric(10,2),
        'status', 'completed'
    )
FROM generate_series(1, 50) as n;

-- Display summary
SELECT 'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Registration Fees', COUNT(*) FROM registration_fees
UNION ALL
SELECT 'Shares', COUNT(*) FROM shares
UNION ALL
SELECT 'Welfare Payments', COUNT(*) FROM welfare_payments
UNION ALL
SELECT 'Payment Transactions', COUNT(*) FROM payment_transactions
UNION ALL
SELECT 'SACCO Savings', COUNT(*) FROM sacco_savings
UNION ALL
SELECT 'Savings', COUNT(*) FROM savings
UNION ALL
SELECT 'Loans', COUNT(*) FROM loans
UNION ALL
SELECT 'Loan Guarantors', COUNT(*) FROM loan_guarantors
UNION ALL
SELECT 'Loan Repayments', COUNT(*) FROM loan_repayments
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Messages', COUNT(*) FROM messages
UNION ALL
SELECT 'Admin Actions', COUNT(*) FROM admin_actions
UNION ALL
SELECT 'Admin Verifications', COUNT(*) FROM admin_verifications
UNION ALL
SELECT 'Reports', COUNT(*) FROM reports;