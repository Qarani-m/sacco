# Testing Setup Guide

## Your Current Results

✅ **31 Unit Tests Passed** - These work without a database!
❌ **24 Integration Tests Failed** - Need database setup

## Quick Fix Options

You have **3 options** to run integration tests:

---

## ✅ Option 1: Use Neon Test Database (Easiest)

Since you're already using Neon, create a separate test database on Neon:

### Step 1: Create Test Database on Neon

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new database called `sacco_test`
3. Copy the connection string

### Step 2: Update `.env.test`

```env
# Use your Neon test database
DATABASE_URL=postgresql://user:password@your-project.neon.tech/sacco_test?sslmode=require
```

### Step 3: Run Migrations

```bash
# Set to test database
export DATABASE_URL="your-neon-test-database-url"

# Visit this URL to seed workflows
# http://localhost:3000/api/seed-workflows

# Or manually run SQL
psql "your-neon-test-database-url" < src/models/migrations/rbac_schema.sql
psql "your-neon-test-database-url" < src/models/migrations/approval_workflow_schema.sql
```

### Step 4: Run Tests

```bash
npm test
```

---

## ✅ Option 2: Install PostgreSQL Locally (Best for Development)

### Ubuntu/Debian

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo service postgresql start

# Create test database
sudo -u postgres createdb sacco_test

# Run migrations
sudo -u postgres psql sacco_test < src/models/migrations/rbac_schema.sql
sudo -u postgres psql sacco_test < src/models/migrations/approval_workflow_schema.sql

# Update .env.test
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=sacco_test

# Run tests
npm test
```

### macOS

```bash
# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Create test database
createdb sacco_test

# Run migrations
psql sacco_test < src/models/migrations/rbac_schema.sql
psql sacco_test < src/models/migrations/approval_workflow_schema.sql

# Run tests
npm test
```

---

## ✅ Option 3: Run Unit Tests Only (Quickest)

Unit tests don't need a database and already work!

```bash
# Run only unit tests (31 tests)
npm run test:unit
```

This gives you **immediate feedback** while developing.

---

## 🎯 Recommended Approach

**For your presentation and development:**

1. **Now**: Run unit tests only
   ```bash
   npm run test:unit
   ```

2. **Later**: Set up Neon test database (Option 1)
   - Takes 5 minutes
   - No local installation needed
   - Matches your production setup

3. **Optional**: Install PostgreSQL locally (Option 2)
   - Better for development
   - Faster tests
   - Works offline

---

## 📊 Test Coverage Summary

### ✅ Working Now (Unit Tests)
- 31 tests passing
- No database needed
- Fast (~2 seconds)
- Tests models, services, middleware

### ⏳ After Database Setup (Integration Tests)
- 24 additional tests
- Tests full API flows
- Tests authentication
- Tests workflows
- Tests role-based access

---

## 🚀 Quick Commands

```bash
# Unit tests only (works now)
npm run test:unit

# All tests (needs database setup)
npm test

# Watch mode for development
npm run test:watch

# View coverage report
open coverage/lcov-report/index.html
```

---

## 💡 Pro Tips

1. **During Development**: Use `npm run test:unit` - fast feedback
2. **Before Commits**: Run `npm test` - full validation
3. **CI/CD Pipeline**: Both unit and integration tests
4. **Coverage Goal**: >80% overall, >90% for critical paths

---

## 🔍 What Each Test Type Covers

### Unit Tests (Work Now ✅)
```
✓ User model operations
✓ Role model operations
✓ Workflow service logic
✓ Authorization middleware
✓ Password hashing
✓ Permission checks
```

### Integration Tests (After Setup)
```
⏳ Login/logout flows
⏳ Registration with validation
⏳ Role-based access control
⏳ Complete loan approval workflow
⏳ Multi-step approvals
⏳ Permission management
```

---

## Need Help?

Choose the option that works best for you:
- **Quick demo**: Option 3 (unit tests only)
- **Production-like**: Option 1 (Neon)
- **Full development**: Option 2 (local PostgreSQL)

All options give you confidence in your code! 🎉
