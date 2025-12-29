/**
 * Global test setup
 * Runs before all tests
 */

const { v4: uuidv4 } = require('uuid');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.SESSION_SECRET = 'test-session-secret';

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Global test helpers
global.generateTestUserId = () => uuidv4();
global.generateTestToken = (payload) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Mock database connection for unit tests
jest.mock('../src/models/db', () => ({
  query: jest.fn(),
  getCurrentDb: jest.fn(() => 'test'),
  pool: null
}));
