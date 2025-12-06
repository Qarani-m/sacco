# Admin Platform Execution Plan

## Phase 0: Finalize Member Platform (Immediate)
**Goal:** Ensure the Member side is 100% functional so we can build Admin features on top of it.
- [ ] **Database**: Run `add_member_features.sql` migration.
- [ ] **Routes**: Register new routes in `members.js` (Registration Fee, Profile, Documents).
- [ ] **Middleware**: Update `registrationCheck.js` to enforce fee payment.
- [ ] **Verification**: Manual test of the full member onboarding flow.

## Phase 1: Admin Foundation & Gatekeeper Features
**Goal:** Enable Admins to log in and manage the influx of new members.
- [ ] **Admin Setup**: Seed the database with exactly 3 Admin users.
- [ ] **Auth**: Implement Admin Login/Logout (reuse existing auth with role check).
- [ ] **Dashboard**: Create Admin Dashboard with "Pending Actions" overview.
- [ ] **Document Verification**: UI to view member IDs and Approve/Reject them.
- [ ] **Member Management**: "Read-Only" view of members + "Edit" for one-time form data.

## Phase 2: The Multi-Admin Verification System (Core)
**Goal:** Implement the "2-of-3" or "3-of-3" approval logic for sensitive actions.
- [ ] **Schema**: Create `admin_actions` table (Action Type, Payload, Initiator, Approvals, Status).
- [ ] **Proposal UI**: When an admin clicks "Delete User", show "Propose Action" modal instead of immediate execution.
- [ ] **Approval UI**: Dashboard widget showing "Actions Waiting Your Approval".
- [ ] **Execution Logic**: Backend service to execute the action only when approval threshold is met.

## Phase 3: Admin Financials & Reports
**Goal:** Enable Admins to participate in the SACCO and monitor its health.
- [ ] **Admin Loans**: Loan request flow for admins (Block self-approval).
- [ ] **Share/Welfare**: Admin interfaces for buying shares and paying welfare.
- [ ] **Reports**: Generate PDF/CSV reports for Loans, Savings, and Member Activity.

## Phase 4: Communication & Polish
**Goal:** Facilitate Admin-Member interaction.
- [ ] **Reminders**: Admin UI to send "Payment Reminder" notifications.
- [ ] **Chat**: Simple chat interface for members to reply to reminders.
- [ ] **Final Polish**: UI consistency check, error handling, and mobile responsiveness.
