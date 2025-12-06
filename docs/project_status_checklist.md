# Project Implementation Checklist

Based on the Sacco System Recommendations.

## 🟢 Member Platform

### Authentication & Onboarding
- [x] **Registration Fee Prompt**: Prompt to pay KSh 1,000/= upon login.
- [x] **Feature Activation**: Loan and shares sections activated only after registration fee payment.
- [x] **One-Time Form**: Member fills a form once upon login (National ID, DOB, etc.), editable only by admin thereafter.
- [x] **Profile Update**: Upload ID photos (Front & Back).
- [x] **Document Verification State**: View state as "Verification in Progress" until verified by admin.

### Financial Operations
- [x] **Purchase Shares**: Buy shares up to KSh 50,000/= (1 share = KSh 1,000/=).
- [x] **Pay Welfare**: Pay welfare fee of KSh 300/=.
- [x] **Payment Prompts**: Phone prompt (STK Push simulation) for payments.
- [x] **Payment Priority System**: Payments allocated to Loans (1st) -> Welfare (2nd) -> Shares (3rd) -> Member Savings (Last).
- [x] **SACCO Savings**: 1% loan interest goes to SACCO savings account.
- [x] **Member Savings**: Surplus amount after other obligations goes to individual member savings.

### Loans & Guarantees
- [x] **Request Loan**: Request loan not exceeding share amount.
- [x] **Guarantor Inquiry**: Send private inquiry to other members for guaranteeing.
- [x] **Guarantor Response**: Members accept/decline inquiries.
- [x] **Share Transfer for Loan**: Guarantors transfer shares to cover loan shortfall.
- [x] **Guarantor Eligibility**: Guarantor cannot have an underlying loan.
- [x] **Loan Interest**: 1% interest charged on loans.
- [x] **Loan Tracking**: Track loans due.

### Communication
- [x] **Notifications**: Receive notifications from other members and admins.

---

## 🔴 Admin Platform (Custom)

### Admin Users & Auth
- [ ] **3 Admin Users**: System limited to exactly 3 admin users.
- [ ] **Admin Authentication**: Secure login for admins.

### Multi-Admin Verification (CRUD)
- [ ] **CRUD Operations**: Create, Read, Update, Delete operations.
- [ ] **Multi-Admin Approval**: No admin completes an operation independently (except creating user account). Actions require verification by other admins.
- [ ] **Action Reasoning**: Provide a reason for actions (e.g., deleting/updating account), saved for reference.
- [ ] **Admin Notifications**: Notifications sent to other admins to verify/decline actions.

### Member Management
- [ ] **Verify Documents**: View uploaded IDs, confirm or reject with reason.
- [ ] **Edit Member Data**: Exclusive right to edit member one-time form data.

### Financials & Loans
- [ ] **Admin Financials**: Admins can obtain loans, purchase shares, and pay welfare like members.
- [ ] **Admin Loan Request**: Admin cannot approve their own loan; other two admins must approve.
- [ ] **Reports Generation**: Generate Loan reports, Savings reports, etc.

### Communication
- [ ] **Member Reminders**: Send reminders to members.
- [ ] **Chat Feature**: Members can respond to reminders (Chat).

---

## 🟡 General / System-Wide
- [x] **Design System**: Black and white minimal design.
- [ ] **Reports**: Specific report formats (Directives pending).
