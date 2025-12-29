# Wednesday Demo - Testing Checklist

## ✅ Pre-Demo Setup

- [x] Database migrations run successfully
- [x] RBAC tables created (6 roles, 31 permissions)
- [x] Workflow tables created (3 workflows, 6 steps)
- [x] Loan approval controller updated
- [x] Payment allocation fix implemented

## 🧪 Test Scenarios

### 1. Member Registration & Approval
- [ ] Register new member
- [ ] Verify admin receives notification
- [ ] Admin approves member
- [ ] Member pays registration fee
- [ ] Account activated

### 2. Loan Request with Workflow (Small Loan < 50k)
- [ ] Member requests KES 30,000 loan
- [ ] Workflow assigned: Small Loans (Risk approval only)
- [ ] Risk officer receives notification
- [ ] Risk officer approves
- [ ] Loan status changes to "approved"
- [ ] Member receives notification

### 3. Loan Request with Workflow (Medium Loan 50k-200k)
- [ ] Member requests KES 100,000 loan
- [ ] Workflow assigned: Medium Loans (Risk + Finance)
- [ ] Risk officer approves (Step 1)
- [ ] Finance officer receives notification
- [ ] Finance officer approves (Step 2)
- [ ] Loan fully approved

### 4. Loan Request with Workflow (Large Loan > 200k)
- [ ] Member requests KES 300,000 loan
- [ ] Workflow assigned: Large Loans (Risk + Finance + Admin)
- [ ] Risk approves → Finance approves → Admin approves
- [ ] Loan fully approved

### 5. Self-Approval Prevention
- [ ] Member creates loan
- [ ] Same member (with admin role) tries to approve
- [ ] System blocks with error message

### 6. Guarantorship
- [ ] Member A requests guarantor from Member B
- [ ] Member B receives notification
- [ ] Member B approves with specific share count
- [ ] Shares locked for Member B
- [ ] Member A's loan eligibility updated

### 7. Payment Allocation - Below Minimum Shares
- [ ] Member with 0 shares pays KES 10,000
- [ ] Expected: Welfare (3) + Shares (5,000) + Savings (4,997)
- [ ] Verify allocation in database

### 8. Payment Allocation - At Minimum Shares
- [ ] Member with 5 shares pays KES 10,000
- [ ] Expected: Welfare (3) + Savings (9,997) [NO shares purchased]
- [ ] Verify shares remain at 5

### 9. Member Self-Service Payment Allocation
- [ ] Access `/payment-allocation/allocate-payment`
- [ ] Specify custom amounts
- [ ] Total calculates correctly
- [ ] Initiate M-Pesa payment
- [ ] Verify allocation (when callback implemented)

### 10. RBAC - Role-Based Access
- [ ] Create Finance user
- [ ] Finance can access financial reports
- [ ] Finance cannot access admin settings
- [ ] Create Risk user
- [ ] Risk can approve loans
- [ ] Risk cannot manage roles

## 🐛 Known Issues

1. **Custom Payment Allocation Callback** - Session-based allocation not fully implemented
   - Workaround: Automatic allocation still works
   
2. **Notification Delivery** - Need to verify all notifications work
   
3. **UI Updates** - Some views may not show workflow progress

## 📝 Demo Script

1. **Introduction** (2 min)
   - Overview of implemented features
   - Highlight client requests vs implementation

2. **RBAC Demonstration** (5 min)
   - Show 6 roles
   - Show permission assignments
   - Demo role-based access

3. **Loan Workflow** (10 min)
   - Create small loan → single approval
   - Create medium loan → two approvals
   - Show workflow routing by amount

4. **Payment Allocation** (8 min)
   - Demo share capital threshold
   - Show automatic allocation
   - Demo member self-service form

5. **Guarantorship** (5 min)
   - Request guarantor
   - Guarantor approves
   - Show share locking

6. **Q&A** (30 min)
   - Answer questions
   - Gather feedback
   - Discuss next steps

## ⚠️ Backup Plan

If live demo fails:
- Use screenshots/recordings
- Walk through code
- Show database state
- Explain architecture

## 📊 Success Metrics

- All 3 workflow types work
- RBAC permissions enforced
- Share threshold respected
- Guarantorship functional
- No critical errors during demo
