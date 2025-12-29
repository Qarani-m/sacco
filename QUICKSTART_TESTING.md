# Quick Start: Testing

## 🚀 Setup Test Database (One-Time Setup)

### Option 1: Automated Setup (Recommended)

Run this single command to set up everything:

```bash
npm run test:setup
```

This will:
- ✅ Check PostgreSQL is running
- ✅ Create `sacco_test` database
- ✅ Run all migrations
- ✅ Verify setup

### Option 2: Manual Setup

If the automated setup doesn't work:

```bash
# 1. Create database
createdb sacco_test

# Or using psql
psql -U postgres -c "CREATE DATABASE sacco_test;"

# 2. Run migrations
psql sacco_test < src/models/migrations/rbac_schema.sql
psql sacco_test < src/models/migrations/approval_workflow_schema.sql
```

## 🧪 Run Tests

Once setup is complete, run tests:

```bash
# All tests with coverage
npm test

# Only unit tests (these don't need database)
npm run test:unit

# Only integration tests
npm run test:integration

# Watch mode (for development)
npm run test:watch
```

## 📊 Current Test Results

Based on your last run:

✅ **31 Unit Tests Passed**
- User Model (8 tests)
- Role Model (7 tests)
- Approval Workflow Service (9 tests)
- checkRole Middleware (6 tests)

⏳ **24 Integration Tests** (will pass after setup)
- Authentication API (8 tests)
- Roles & Permissions API (9 tests)
- Loan Approval Workflow (7 tests)

## ⚡ Quick Troubleshooting

### "Database does not exist"
```bash
npm run test:setup
```

### "PostgreSQL not running"
```bash
# Ubuntu/Debian
sudo service postgresql start

# macOS (with Homebrew)
brew services start postgresql

# Check if running
pg_isready
```

### "Permission denied"
```bash
# Make sure you have a postgres user
createuser -s postgres

# Or create with password
createuser -s -P postgres
```

### "Port 5432 already in use"
```bash
# Check what's using the port
lsof -i :5432

# Or use different port
export DB_PORT=5433
npm run test:setup
```

## 🎯 Next Steps

After tests pass:

1. **View Coverage**: Open `coverage/lcov-report/index.html`
2. **Add Tests**: Create tests for new features in `tests/`
3. **CI/CD**: Tests run automatically on commits
4. **Coverage Goals**: Aim for >80% coverage

## 📝 Test Structure

```
tests/
├── unit/           # Fast, isolated tests (no DB needed)
│   ├── models/
│   ├── services/
│   └── middleware/
└── integration/    # Full stack tests (need DB)
    ├── api/
    └── workflows/
```

## 🔧 Configuration

Test settings are in:
- `jest.config.js` - Jest configuration
- `.env.test` - Test environment variables
- `tests/setup.js` - Global test setup
- `tests/testDb.js` - Database helpers

## ✨ Writing Your First Test

```javascript
// tests/unit/models/MyModel.test.js
describe('MyModel', () => {
  it('should do something', () => {
    const result = MyModel.doSomething();
    expect(result).toBe(expected);
  });
});
```

Run it:
```bash
npm test -- MyModel.test.js
```

## 🎉 That's It!

You're ready to test! Run `npm run test:setup` once, then `npm test` anytime.
