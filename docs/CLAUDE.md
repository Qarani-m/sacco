# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SACCO (Savings and Credit Cooperative) management system built with Node.js, Express, PostgreSQL, and EJS templating. The system manages member registrations, shares, loans, welfare contributions, and savings with a priority-based payment allocation system.

## Development Commands

### Docker Setup (Recommended)

**Quick Start:**
```bash
# Windows
docker-start.bat

# Linux/Mac
chmod +x docker-start.sh
./docker-start.sh
```

**Manual Docker Commands:**
```bash
# Start all services (production mode)
docker-compose up -d

# Start with development hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Start with database management tool (pgAdmin)
docker-compose --profile tools up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Full cleanup (removes volumes)
docker-compose down -v
```

**Docker Services:**
- Application: http://localhost:3000
- PostgreSQL: localhost:5432 (user: postgres, password: postgres)
- pgAdmin (optional): http://localhost:5050 (email: admin@sacco.com, password: admin)

See `README.Docker.md` for detailed Docker documentation.

### Local Development (Without Docker)

**Start Development Server:**
```bash
npm start
```
Runs the application with nodemon on port 3000 (configurable via PORT env variable).

**Build Tailwind CSS:**
```bash
# Development mode (watch for changes)
npm run dev

# Production build (minified)
npm run build
```

**Database Setup:**
Execute the schema:
```bash
psql -U [username] -d sacco -f models/db.sql
```

Run migrations:
```bash
node models/migrations/run_member_migration.js
```

**Seed Test Users:**
Visit: http://localhost:3000/auth/seed

## Architecture

### Authentication & Authorization

**Two Authentication Patterns:**
1. **Cookie-based (Web)**: Uses JWT stored in HTTP-only cookies
   - Middleware: `middleware/auth.js`
   - Token verification happens in `app.js` global middleware (lines 87-100)
   - User data exposed via `res.locals.user` and `res.locals.isAdmin`

2. **Bearer Token (API)**: Uses Authorization header
   - Middleware: `middleware/adminAuth.js`
   - Admin-only endpoints using Bearer tokens

**CSRF Protection**: All forms require CSRF tokens via `csurf` middleware. Token available as `res.locals.csrfToken`.

### Database Layer

**Connection**: PostgreSQL connection pool configured in `models/db.js` with environment variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

**Model Pattern**: Static class methods for database operations (see `models/User.js`, `models/Loan.js`)
- Models use raw SQL queries via `db.query(text, params)`
- UUIDs for primary keys (`uuid_generate_v4()`)
- All queries use parameterized statements to prevent SQL injection

### Payment Allocation System

**Critical Service**: `services/paymentAllocationService.js` implements the priority-based payment allocation:

1. **Priority 1 - Loan Repayment**: Active loans paid first
   - 1% interest automatically routed to SACCO collective savings
   - Fully paid loans trigger guarantor share release via `LoanGuarantor.releaseByLoan()`

2. **Priority 2 - Welfare**: KSh 300 per payment

3. **Priority 3 - Share Purchase**: KSh 1,000 per share (max 50 shares per member)
   - Shares can be pledged as loan guarantees (status: 'active' or 'pledged_as_guarantee')

4. **Priority 4 - Personal Savings**: Any remaining balance

**Transaction Flow**: Call `PaymentAllocationService.allocatePayment(userId, amount, transactionRef)` for all incoming payments.

### Loan System

**Guarantor Requirements**: Loans require guarantors who pledge their shares (handled in `models/LoanGuarantor.js`).

**Loan States**: `pending` → `active` → `paid` (or `rejected`)

**Interest Calculation**:
- Interest rate stored per loan (default 1% from env `LOAN_INTEREST_RATE`)
- Total repayment = principal × (1 + (interest_rate/100) × repayment_months)
- Max repayment period: 6 months

**Key Methods**:
- `Loan.approve(loanId, approvedAmount)` - Uses transactions to update loan and calculate balance
- `Loan.recordRepayment(loanId, amount)` - Updates balance, auto-marks as 'paid' when balance ≤ 0

### Admin System

**Admin Actions**: Require 2/3 admin approval for sensitive operations
- Tracked in `admin_actions` and `admin_verifications` tables
- See `models/AdminAction.js` for approval workflow

**Admin Seeding**: `User.seedAdmins()` creates default admin accounts if < 3 exist

### Route Structure

Routes organized by domain:
- `/auth` - Login, registration, email verification
- `/admin` - Admin dashboard, member management, loan approvals
- `/members` - Member dashboard, profile
- `/shares` - Share purchases and management
- `/loans` - Loan requests and viewing
- `/guarantors` - Guarantor requests/responses
- `/welfare` - Welfare contributions
- `/payments` - Payment processing
- `/messages` - Internal messaging system
- `/reports` - Report generation

### View System

**Layout Engine**: EJS with `express-ejs-layouts`
- Main layout: `views/layouts/main.ejs`
- Admin layout: `views/layouts/admin.ejs`
- Headers: `views/layouts/member-header.ejs` and `views/layouts/admin-header.ejs`

**Flash Messages**: Available in all views via `res.locals`:
- `success_msg`, `error_msg`, `error`

### Security

**Implemented:**
- Helmet.js for security headers (CSP configured for CDN assets)
- CSRF protection on all forms
- JWT with bcrypt password hashing
- Rate limiting via `middleware/rateLimiter.js`
- SQL injection prevention via parameterized queries

**Registration Fee Check**: `middleware/registrationCheck.js` blocks access to loans/shares until KSh 1,000 registration paid.

## Environment Variables

Required in `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sacco
DB_USER=root
DB_PASSWORD=root
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret
NODE_ENV=development
PORT=3000
LOAN_INTEREST_RATE=3
```

## Important Implementation Notes

- **Transaction Safety**: Use PostgreSQL transactions (`client.query('BEGIN')`) for multi-step operations like loan approval
- **Guarantor Shares**: Check share status before allowing pledges - shares with status 'pledged_as_guarantee' are locked
- **Email Verification**: Token-based system in User model (`generateVerificationToken`, `verifyEmail`)
- **Balance Tracking**: Loan balance includes principal + interest; use `Loan.recordRepayment()` to ensure correct accounting
