# SACCO Testing Documentation

## Overview

This project includes comprehensive unit and integration tests to ensure code quality and reliability.

## Test Structure

```
tests/
├── setup.js                    # Global test configuration
├── testDb.js                   # Test database helpers
├── unit/                       # Unit tests
│   ├── models/                 # Model unit tests
│   │   ├── User.test.js
│   │   └── Role.test.js
│   ├── services/               # Service unit tests
│   │   └── approvalWorkflowService.test.js
│   └── middleware/             # Middleware unit tests
│       └── checkRole.test.js
└── integration/                # Integration tests
    ├── api/                    # API endpoint tests
    │   ├── auth.test.js
    │   └── roles.test.js
    └── workflows/              # Workflow integration tests
        └── loanApproval.test.js
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Verbose Output
```bash
npm run test:verbose
```

## Test Database Setup

### Prerequisites

1. **PostgreSQL** must be installed and running
2. Create a test database:

```sql
CREATE DATABASE sacco_test;
```

3. Run migrations on test database:

```bash
# Set DATABASE_URL to test database
export DATABASE_URL="postgresql://user:pass@localhost:5432/sacco_test"

# Run RBAC migration
psql sacco_test < src/models/migrations/rbac_schema.sql

# Run approval workflow migration
psql sacco_test < src/models/migrations/approval_workflow_schema.sql
```

4. Configure test environment:

Create `.env.test` file (see `.env.test` template)

## What's Tested

### Unit Tests

#### Models
- **User Model**: Create, find, verify password, assign roles, mark registration paid
- **Role Model**: Get all, find by ID/name, manage permissions, get users

#### Services
- **Approval Workflow Service**: Initialize workflow, process approvals, workflow progress, pending approvals

#### Middleware
- **checkRole**: Role validation, access control, error handling

### Integration Tests

#### Authentication API
- ✅ Login with valid credentials
- ✅ Login with invalid credentials
- ✅ Inactive user login prevention
- ✅ User registration
- ✅ Duplicate email prevention
- ✅ Password validation
- ✅ Logout and cookie clearing

#### Roles & Permissions API
- ✅ View all roles (admin only)
- ✅ Access control for non-admin users
- ✅ View role details with permissions
- ✅ Assign permissions to roles
- ✅ Remove permissions from roles
- ✅ Role-based dashboard access
  - Finance dashboard for Finance role
  - Risk dashboard for Risk role
  - Access denial for unauthorized roles

#### Loan Approval Workflow
- ✅ Complete approval flow (Risk → Finance)
- ✅ Loan rejection handling
- ✅ Self-approval prevention
- ✅ Duplicate approval prevention
- ✅ Workflow selection based on loan amount
- ✅ Approval history tracking with timestamps

## Test Coverage

Run tests with coverage report:

```bash
npm test
```

Coverage reports are generated in the `coverage/` directory.

View HTML coverage report:

```bash
open coverage/lcov-report/index.html
```

## Writing New Tests

### Unit Test Example

```javascript
describe('ModelName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should do something', async () => {
    // Arrange
    const mockData = { /* ... */ };
    db.query.mockResolvedValueOnce({ rows: [mockData] });

    // Act
    const result = await Model.method();

    // Assert
    expect(result).toEqual(mockData);
    expect(db.query).toHaveBeenCalled();
  });
});
```

### Integration Test Example

```javascript
describe('API Endpoint', () => {
  let testData, cookies;

  beforeEach(async () => {
    await cleanDatabase();
    testData = await seedTestData();

    const login = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'Test@1234' });

    cookies = login.headers['set-cookie'];
  });

  it('should do something', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .set('Cookie', cookies);

    expect(response.status).toBe(200);
  });
});
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Use `beforeEach` to reset state
3. **Mocking**: Mock external dependencies in unit tests
4. **Real DB**: Integration tests use real test database
5. **Clear Names**: Test names should describe what they test
6. **AAA Pattern**: Arrange, Act, Assert

## Continuous Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Pull requests
- CI/CD pipeline

## Troubleshooting

### Test Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Verify test database exists
psql -l | grep sacco_test

# Check connection
psql sacco_test -c "SELECT 1"
```

### Port Already in Use

If test server fails to start:

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Tests Hanging

If tests don't exit:

```bash
# Force exit after timeout (already configured in jest.config.js)
# Check for open database connections
```

## Code Coverage Goals

- **Overall Coverage**: > 80%
- **Critical Paths**: > 90% (authentication, payments, approvals)
- **Models**: > 85%
- **Services**: > 80%
- **API Endpoints**: > 75%

## Contributing

When adding new features:

1. Write unit tests for models/services
2. Write integration tests for API endpoints
3. Ensure all tests pass before committing
4. Update this documentation if needed

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
