# 🎯 SACCO Management System - Pre-Presentation Testing Guide

**Version:** 1.0.0  
**Last Updated:** December 29, 2025  
**Purpose:** Help you understand and test all features before the presentation

---

## 📚 Table of Contents

1. [Quick Start Setup](#-quick-start-setup)
2. [System Overview](#-system-overview)
3. [Feature Testing Guide](#-feature-testing-guide)
4. [Test Scenarios with Expected Outputs](#-test-scenarios-with-expected-outputs)
5. [Verification Checklist](#-verification-checklist)
6. [Troubleshooting](#-troubleshooting)
7. [Demo Preparation](#-demo-preparation)

---

## 🚀 Quick Start Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL or SQLite
- Terminal/Command Line access

### Installation Steps

```bash
# 1. Navigate to project directory
cd /home/martin/Desktop/New\ Folder/sacco

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Copy .env.example to .env and configure
cp .env.example .env

# 4. Run database migrations
node src/models/migrations/run_rbac_migration.js

# 5. Start the server
npm start
```

### Default Login Credentials

**Admin Account:**
- Email: `admin@sacco.com`
- Password: `Admin@123`

**Member Account:**
- Email: `member@sacco.com`
- Password: `Member@123`

---

## 🏗️ System Overview

### What is SACCO?
A comprehensive financial management platform for Savings and Credit Cooperative Organizations (SACCOs). It handles member management, loans, shares, savings, welfare contributions, and M-Pesa payment integration.

### Key Technologies
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL / SQLite
- **Frontend:** EJS Templates + Tailwind CSS
- **Payment:** M-Pesa API Integration
- **Authentication:** JWT + HTTP-only cookies

### System Architecture

```
┌─────────────────┐
│   Web Browser   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Express Server │
│   (Port 3000)   │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│Database│ │M-Pesa API│
└────────┘ └──────────┘
```

---

## 🎯 Feature Testing Guide

### Feature 1: **Role-Based Access Control (RBAC)**

#### Description
The system supports 6 different roles with specific permissions:
1. **Admin** - Full system access
2. **Finance** - Financial operations and reporting
3. **Risk** - Loan approval and risk assessment
4. **Customer Service** - Member support
5. **Disbursement Officer** - Loan disbursement
6. **Member** - Standard member access

#### How to Test

**Step 1:** Login as Admin
```
URL: http://localhost:3000/auth/login
Email: admin@sacco.com
Password: Admin@123
```

**Step 2:** Navigate to Role Management
```
URL: http://localhost:3000/roles
```

**Step 3:** View Roles and Permissions
- You should see a list of all 6 roles
- Each role displays its assigned permissions
- Admin can assign/remove permissions

**Expected Output:**
- ✅ Roles page loads successfully
- ✅ All 6 roles are visible
- ✅ Permissions are grouped by module (loans, members, reports, etc.)
- ✅ Admin can modify role permissions

**Test Different Role Access:**
1. Create a new user with "Finance" role
2. Logout and login with that user
3. Try accessing `/admin/dashboard` → Should be **denied (403)**
4. Try accessing `/reports` → Should be **allowed**

---

### Feature 2: **Loan Approval Workflow**

#### Description
Loans are automatically routed through different approval workflows based on amount:
- **Small Loans (< KES 50,000):** Risk Officer approval only
- **Medium Loans (KES 50,000 - 200,000):** Risk + Finance approval
- **Large Loans (> KES 200,000):** Risk + Finance + Admin approval

#### How to Test

**Test Case 1: Small Loan**

**Step 1:** Login as Member
```
Email: member@sacco.com
Password: Member@123
```

**Step 2:** Request a Loan
```
URL: http://localhost:3000/loans/request
Amount: KES 30,000
Purpose: Business expansion
Duration: 12 months
```

**Step 3:** Submit the Request

**Expected Output:**
- ✅ Loan request created successfully
- ✅ Status shows "Pending Approval"
- ✅ Workflow assigned: "Small Loans"
- ✅ Next approver: Risk Officer

**Step 4:** Approve as Risk Officer
1. Logout from member account
2. Login as admin (or create a Risk Officer user)
3. Navigate to `/loans` or `/admin/loan-approvals`
4. Find the pending loan
5. Click "Approve"

**Expected Output:**
- ✅ Loan status changes to "Approved"
- ✅ Member receives notification
- ✅ Loan appears in member's dashboard

---

**Test Case 2: Medium Loan (Multi-Step Approval)**

**Step 1:** Request KES 100,000 loan (as member)

**Expected Output:**
- ✅ Workflow assigned: "Medium Loans"
- ✅ Requires 2 approvals (Risk + Finance)

**Step 2:** Risk Officer Approves
- ✅ Status changes to "Partially Approved"
- ✅ Next approver: Finance Officer

**Step 3:** Finance Officer Approves
- ✅ Status changes to "Approved"
- ✅ Loan is fully approved

---

**Test Case 3: Self-Approval Prevention**

**Step 1:** Login as Admin
**Step 2:** Request a loan as Admin
**Step 3:** Try to approve your own loan

**Expected Output:**
- ❌ System blocks approval
- ❌ Error message: "You cannot approve your own loan"

---

### Feature 3: **Payment Allocation System**

#### Description
The system automatically allocates payments with smart rules:
- **Minimum Share Capital:** KES 5,000 (5 shares @ KES 1,000 each)
- **Allocation Priority:** Welfare → Shares (until minimum) → Savings
- **Once minimum shares reached:** Welfare → Savings (no more shares)

#### How to Test

**Test Case 1: Member Below Minimum Shares**

**Step 1:** Check Current Shares
```
Login as member
Navigate to: http://localhost:3000/members/dashboard
Check "Share Capital" section
```

**Assumption:** Member has 0 shares

**Step 2:** Make a Payment
```
URL: http://localhost:3000/payment-allocation/allocate-payment
Amount: KES 10,000
```

**Expected Allocation:**
```
Welfare:        KES 3
Shares:         KES 5,000 (5 shares purchased)
Savings:        KES 4,997
─────────────────────────
Total:          KES 10,000
```

**Step 3:** Verify in Database/Dashboard
- ✅ Member now has 5 shares
- ✅ Savings balance increased by KES 4,997
- ✅ Welfare contribution recorded: KES 3

---

**Test Case 2: Member At/Above Minimum Shares**

**Assumption:** Member already has 5 or more shares

**Step 1:** Make Another Payment
```
Amount: KES 10,000
```

**Expected Allocation:**
```
Welfare:        KES 3
Shares:         KES 0 (minimum already reached)
Savings:        KES 9,997
─────────────────────────
Total:          KES 10,000
```

**Expected Output:**
- ✅ No new shares purchased
- ✅ All funds (except welfare) go to savings
- ✅ Share count remains at 5

---

**Test Case 3: Member Self-Service Allocation**

**Step 1:** Access Custom Allocation Form
```
URL: http://localhost:3000/payment-allocation/allocate-payment
```

**Step 2:** Specify Custom Amounts
```
Shares:         KES 2,000
Savings:        KES 5,000
Welfare:        KES 1,000
Loan Repayment: KES 2,000
─────────────────────────
Total:          KES 10,000
```

**Step 3:** Initiate M-Pesa Payment

**Expected Output:**
- ✅ Total calculates correctly in real-time
- ✅ M-Pesa STK push sent to phone
- ✅ Payment allocated as specified (after callback)

---

### Feature 4: **Guarantorship System**

#### Description
Members can guarantee each other's loans by pledging their shares. Guaranteed shares are locked until the loan is repaid.

#### How to Test

**Step 1:** Member A Requests Guarantor

**Login as Member A:**
```
URL: http://localhost:3000/guarantors/request
Select Member B as guarantor
Requested Shares: 3
```

**Expected Output:**
- ✅ Guarantor request created
- ✅ Member B receives notification

**Step 2:** Member B Approves Guarantorship

**Login as Member B:**
```
Navigate to: http://localhost:3000/guarantors/pending
View request from Member A
Approve with 3 shares
```

**Expected Output:**
- ✅ 3 shares locked for Member B
- ✅ Member A's loan eligibility increased
- ✅ Both members receive notifications

**Step 3:** Verify Share Locking

**Check Member B's Dashboard:**
```
Total Shares: 10
Locked Shares: 3
Available Shares: 7
```

**Expected Output:**
- ✅ Locked shares cannot be withdrawn
- ✅ Locked shares shown separately in dashboard

---

### Feature 5: **M-Pesa Payment Integration**

#### Description
Members can make payments via M-Pesa STK Push. The system processes callbacks and allocates funds automatically.

#### How to Test

**Step 1:** Initiate Payment
```
Login as member
Navigate to: http://localhost:3000/payments/mpesa
Amount: KES 1,000
Phone: 254712345678
```

**Step 2:** Complete M-Pesa Prompt
- Check your phone for STK push
- Enter M-Pesa PIN
- Confirm payment

**Expected Output:**
- ✅ STK push received on phone
- ✅ Payment confirmation message
- ✅ Transaction recorded in database

**Step 3:** Verify Callback Processing
```
Check: http://localhost:3000/payments/history
```

**Expected Output:**
- ✅ Payment appears in transaction history
- ✅ Status: "Completed"
- ✅ Funds allocated correctly (Welfare → Shares → Savings)

---

### Feature 6: **Member Registration & Approval**

#### Description
New members register and wait for admin approval. Upon approval, they pay a registration fee to activate their account.

#### How to Test

**Step 1:** Register New Member
```
URL: http://localhost:3000/auth/register
Fill in all required fields
Submit registration
```

**Expected Output:**
- ✅ Registration successful
- ✅ Status: "Pending Approval"
- ✅ Cannot login yet

**Step 2:** Admin Approves Member
```
Login as admin
Navigate to: http://localhost:3000/admin/pending-approvals
Find new member
Click "Approve"
```

**Expected Output:**
- ✅ Member status changes to "Approved"
- ✅ Member receives notification
- ✅ Member can now login

**Step 3:** Member Pays Registration Fee
```
Login as new member
Navigate to payment page
Pay registration fee (e.g., KES 500)
```

**Expected Output:**
- ✅ Account fully activated
- ✅ Can access all member features

---

### Feature 7: **Shares Management**

#### Description
Members can purchase shares (KES 1,000 each) and track their share capital.

#### How to Test

**Step 1:** View Current Shares
```
Login as member
Navigate to: http://localhost:3000/shares
```

**Expected Output:**
- ✅ Current share count displayed
- ✅ Total share value shown
- ✅ Share purchase history visible

**Step 2:** Purchase Shares
```
Click "Purchase Shares"
Quantity: 5
Total: KES 5,000
```

**Expected Output:**
- ✅ Shares added to account
- ✅ Transaction recorded
- ✅ Share capital updated

---

### Feature 8: **Savings Tracking**

#### Description
Members can make savings deposits and track their savings balance.

#### How to Test

**Step 1:** View Savings
```
URL: http://localhost:3000/members/dashboard
Check "Personal Savings" section
```

**Expected Output:**
- ✅ Current savings balance displayed
- ✅ Recent savings transactions shown

**Step 2:** Make Savings Deposit
```
Navigate to payment allocation
Allocate funds to savings
Complete payment
```

**Expected Output:**
- ✅ Savings balance increases
- ✅ Transaction appears in history

---

### Feature 9: **Welfare Contributions**

#### Description
Members contribute a small welfare fee (KES 3) with each payment.

#### How to Test

**Step 1:** View Welfare Contributions
```
URL: http://localhost:3000/welfare
```

**Expected Output:**
- ✅ Total welfare contributions displayed
- ✅ Contribution history shown

**Step 2:** Make Payment (Welfare Auto-Deducted)
```
Make any payment
Check welfare section
```

**Expected Output:**
- ✅ KES 3 automatically deducted
- ✅ Welfare balance updated

---

### Feature 10: **Notifications System**

#### Description
Members receive notifications for important events (loan approvals, guarantor requests, etc.).

#### How to Test

**Step 1:** View Notifications
```
URL: http://localhost:3000/messages
```

**Expected Output:**
- ✅ List of all notifications
- ✅ Unread notifications highlighted
- ✅ Notification types: Loan updates, Guarantor requests, Admin announcements

**Step 2:** Trigger Notification
```
Request a loan (as member)
Check notifications (as admin)
```

**Expected Output:**
- ✅ Admin receives "New loan request" notification
- ✅ Notification appears in real-time

---

### Feature 11: **Reports & Analytics**

#### Description
Admins and authorized users can view financial reports and analytics.

#### How to Test

**Step 1:** Access Reports
```
Login as admin
Navigate to: http://localhost:3000/reports
```

**Expected Output:**
- ✅ Multiple report types available:
  - Loan reports
  - Member reports
  - Financial summaries
  - Transaction reports

**Step 2:** Generate Report
```
Select report type: "Loan Summary"
Date range: Last 30 days
Click "Generate"
```

**Expected Output:**
- ✅ Report displays correctly
- ✅ Data is accurate
- ✅ Export options available (PDF/Excel)

---

## 🧪 Test Scenarios with Expected Outputs

### Scenario 1: Complete Member Journey

**Objective:** Test the full lifecycle of a new member

| Step | Action | Expected Output |
|------|--------|----------------|
| 1 | Register new member | ✅ Registration successful, status "Pending" |
| 2 | Admin approves | ✅ Status changes to "Approved" |
| 3 | Member pays registration fee | ✅ Account activated |
| 4 | Member makes first payment (KES 10,000) | ✅ Welfare: 3, Shares: 5,000, Savings: 4,997 |
| 5 | Member requests loan (KES 30,000) | ✅ Loan created, workflow assigned |
| 6 | Risk officer approves | ✅ Loan approved |
| 7 | Member receives loan | ✅ Loan disbursed, balance updated |

---

### Scenario 2: Multi-Approval Loan Workflow

**Objective:** Test medium loan requiring 2 approvals

| Step | Action | Expected Output |
|------|--------|----------------|
| 1 | Member requests KES 100,000 loan | ✅ Workflow: "Medium Loans" assigned |
| 2 | Risk officer approves | ✅ Status: "Partially Approved", next: Finance |
| 3 | Finance officer approves | ✅ Status: "Approved" |
| 4 | Disbursement officer disburses | ✅ Loan disbursed to member |

---

### Scenario 3: Guarantorship Chain

**Objective:** Test guarantor system with multiple members

| Step | Action | Expected Output |
|------|--------|----------------|
| 1 | Member A requests guarantor from B | ✅ Request created |
| 2 | Member B approves (3 shares) | ✅ 3 shares locked for B |
| 3 | Member A requests loan | ✅ Loan eligibility includes guaranteed shares |
| 4 | Loan approved and disbursed | ✅ Guarantor shares remain locked |
| 5 | Member A repays loan | ✅ Guarantor shares unlocked |

---

### Scenario 4: Payment Allocation Edge Cases

**Test Case 4.1: Exact Minimum Shares**

| Input | Expected Allocation |
|-------|-------------------|
| Payment: KES 5,003 | Welfare: 3, Shares: 5,000, Savings: 0 |
| Current Shares: 0 | New Shares: 5 |

**Test Case 4.2: Above Minimum**

| Input | Expected Allocation |
|-------|-------------------|
| Payment: KES 10,000 | Welfare: 3, Shares: 0, Savings: 9,997 |
| Current Shares: 5 | New Shares: 5 (no change) |

**Test Case 4.3: Partial Share Purchase**

| Input | Expected Allocation |
|-------|-------------------|
| Payment: KES 3,000 | Welfare: 3, Shares: 2,997, Savings: 0 |
| Current Shares: 0 | New Shares: 2 (partial, not full 5) |

---

## ✅ Verification Checklist

### Pre-Presentation Checklist

#### System Setup
- [ ] Server starts without errors (`npm start`)
- [ ] Database migrations completed successfully
- [ ] All environment variables configured
- [ ] M-Pesa credentials valid (if testing payments)

#### Authentication & Authorization
- [ ] Admin login works
- [ ] Member login works
- [ ] Role-based access enforced (Finance can't access Admin pages)
- [ ] Logout works correctly

#### RBAC (Role-Based Access Control)
- [ ] All 6 roles visible in `/roles`
- [ ] Permissions displayed correctly
- [ ] Admin can assign/remove permissions
- [ ] Permission checks work on routes

#### Loan Workflows
- [ ] Small loan (< 50k) requires 1 approval
- [ ] Medium loan (50k-200k) requires 2 approvals
- [ ] Large loan (> 200k) requires 3 approvals
- [ ] Self-approval is blocked
- [ ] Workflow routing is automatic

#### Payment Allocation
- [ ] Automatic allocation works (Welfare → Shares → Savings)
- [ ] Share minimum threshold enforced (KES 5,000)
- [ ] No shares purchased after minimum reached
- [ ] Member self-service allocation form works
- [ ] Total calculates correctly in real-time

#### Guarantorship
- [ ] Guarantor requests can be created
- [ ] Guarantors receive notifications
- [ ] Guarantor approval locks shares
- [ ] Locked shares shown separately
- [ ] Shares unlock after loan repayment

#### M-Pesa Integration
- [ ] STK push initiated successfully
- [ ] Callback endpoint receives data
- [ ] Payments recorded in database
- [ ] Funds allocated correctly

#### Member Management
- [ ] New member registration works
- [ ] Admin approval process works
- [ ] Registration fee payment works
- [ ] Member dashboard displays correctly

#### Shares & Savings
- [ ] Share purchases recorded
- [ ] Share capital calculated correctly
- [ ] Savings deposits work
- [ ] Transaction history accurate

#### Welfare
- [ ] Welfare fee (KES 3) auto-deducted
- [ ] Welfare contributions tracked
- [ ] Welfare balance accurate

#### Notifications
- [ ] Notifications sent for loan events
- [ ] Notifications sent for guarantor requests
- [ ] Unread notifications highlighted
- [ ] Notification history accessible

#### Reports
- [ ] Reports page accessible (admin/finance)
- [ ] Loan reports generate correctly
- [ ] Member reports accurate
- [ ] Financial summaries correct
- [ ] Export functionality works

#### UI/UX
- [ ] All pages load without errors
- [ ] Navigation works smoothly
- [ ] Forms validate input correctly
- [ ] Success/error messages display
- [ ] Responsive design works on mobile

#### Error Handling
- [ ] No 500 errors on any page
- [ ] 404 page displays for invalid routes
- [ ] CSRF protection works
- [ ] Validation errors show helpful messages

---

## 🔧 Troubleshooting

### Common Issues

#### Issue 1: Server Won't Start

**Symptoms:**
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
npm install
```

---

#### Issue 2: Database Connection Error

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
1. Check PostgreSQL is running
2. Verify `.env` database credentials
3. Try SQLite fallback (check `src/config/database.js`)

---

#### Issue 3: RBAC Tables Missing

**Symptoms:**
```
Error: relation "roles" does not exist
```

**Solution:**
```bash
node src/models/migrations/run_rbac_migration.js
```

---

#### Issue 4: CSRF Token Error

**Symptoms:**
```
403 Forbidden - Invalid CSRF Token
```

**Solution:**
1. Clear browser cookies
2. Refresh the page
3. Ensure forms include `csrfToken` hidden field

---

#### Issue 5: M-Pesa Callback Not Working

**Symptoms:**
- Payment initiated but not recorded
- Callback endpoint returns 404

**Solution:**
1. Check callback URL in `.env`
2. Verify M-Pesa whitelist includes your IP
3. Check logs for callback errors

---

#### Issue 6: Loan Workflow Not Triggering

**Symptoms:**
- Loan created but no workflow assigned

**Solution:**
```bash
# Run workflow migration
node src/models/migrations/run_approval_workflow_migration.js
```

---

## 🎬 Demo Preparation

### Before the Presentation

#### 1. Prepare Test Data
```bash
# Seed database with sample data
npm run seed-sqlite
```

**Create Test Users:**
- Admin user (already exists)
- Finance user
- Risk user
- 3-5 member users with varying data

#### 2. Test All Features
- Go through the verification checklist
- Test each scenario at least once
- Fix any bugs found

#### 3. Prepare Demo Script

**Suggested Flow (30 minutes):**

1. **Introduction (2 min)**
   - System overview
   - Key features

2. **RBAC Demo (5 min)**
   - Show 6 roles
   - Demo permission enforcement
   - Show role-based dashboards

3. **Loan Workflow (10 min)**
   - Create small loan → single approval
   - Create medium loan → multi-approval
   - Show workflow routing

4. **Payment Allocation (8 min)**
   - Demo automatic allocation
   - Show share threshold
   - Demo member self-service

5. **Guarantorship (5 min)**
   - Request guarantor
   - Approve and show share locking

6. **Q&A (remainder)**

#### 4. Backup Plan
- Take screenshots of all features
- Record video walkthrough
- Export sample reports
- Have database backup ready

#### 5. Environment Check
- [ ] Server runs on port 3000
- [ ] No console errors
- [ ] All routes accessible
- [ ] Database populated with test data
- [ ] M-Pesa credentials valid (if demoing payments)

---

## 📊 Quick Reference

### Important URLs

| Feature | URL |
|---------|-----|
| Login | http://localhost:3000/auth/login |
| Admin Dashboard | http://localhost:3000/admin/dashboard |
| Member Dashboard | http://localhost:3000/members/dashboard |
| Roles Management | http://localhost:3000/roles |
| Loan Requests | http://localhost:3000/loans/request |
| Payment Allocation | http://localhost:3000/payment-allocation/allocate-payment |
| Guarantors | http://localhost:3000/guarantors |
| Reports | http://localhost:3000/reports |
| Notifications | http://localhost:3000/messages |

### Key Commands

```bash
# Start server
npm start

# Run migrations
node src/models/migrations/run_rbac_migration.js
node src/models/migrations/run_approval_workflow_migration.js

# Seed database
npm run seed-sqlite

# Build CSS
npm run build
```

### Database Quick Checks

```sql
-- Check roles
SELECT * FROM roles;

-- Check permissions
SELECT * FROM permissions;

-- Check workflows
SELECT * FROM approval_workflows;

-- Check loans
SELECT * FROM loans ORDER BY created_at DESC LIMIT 10;

-- Check members
SELECT id, name, email, role FROM users WHERE role = 'member';
```

---

## 📝 Notes for Presentation

### Key Selling Points
1. ✅ **Complete RBAC** - 6 roles, 35+ permissions
2. ✅ **Smart Loan Workflows** - Automatic routing by amount
3. ✅ **Intelligent Payment Allocation** - Share threshold enforcement
4. ✅ **Guarantorship System** - Share locking mechanism
5. ✅ **M-Pesa Integration** - Real-time payment processing
6. ✅ **Self-Service Features** - Member control over allocations

### Technical Highlights
- Modern tech stack (Node.js, Express, PostgreSQL)
- Security-first design (JWT, CSRF protection, Helmet)
- Scalable architecture (MVC pattern)
- Comprehensive error handling
- Responsive UI (Tailwind CSS)

### Future Enhancements
- USSD integration for feature phones
- Mobile app (React Native)
- Advanced analytics dashboard
- Automated loan scoring
- SMS notifications
- Multi-currency support

---

## ✨ Final Checklist Before Demo

- [ ] Server running smoothly
- [ ] All test users created
- [ ] Sample data populated
- [ ] All features tested
- [ ] Screenshots/videos prepared
- [ ] Backup plan ready
- [ ] Questions anticipated
- [ ] Confident with system flow
- [ ] Know where each feature is located
- [ ] Understand expected outputs for each test

---

**Good luck with your presentation! 🚀**

For questions or issues, refer to:
- [README.md](README.md)
- [RBAC_QUICKSTART.md](RBAC_QUICKSTART.md)
- [docs/WEDNESDAY_DEMO_CHECKLIST.md](docs/WEDNESDAY_DEMO_CHECKLIST.md)
