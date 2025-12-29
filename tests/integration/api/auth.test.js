/**
 * Integration tests for Authentication API
 */

const request = require('supertest');
const app = require('../../../src/app');
const { initTestDb, cleanDatabase, seedTestData, closeTestDb } = require('../../testDb');

describe('Authentication API Integration Tests', () => {
  beforeAll(async () => {
    await initTestDb();
  });

  beforeEach(async () => {
    await cleanDatabase();
    await seedTestData();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'Test@1234'
        });

      expect(response.status).toBe(302); // Redirect after login
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('token=');
    });

    it('should return error with invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(302); // Redirect with error
    });

    it('should return error with non-existent email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Test@1234'
        });

      expect(response.status).toBe(302);
    });

    it('should not login inactive user', async () => {
      // Create inactive user first
      const { getQuery } = require('../../testDb');
      const query = getQuery();
      const bcrypt = require('bcrypt');
      const hash = await bcrypt.hash('Test@1234', 10);

      await query(`
        INSERT INTO users (id, email, password_hash, full_name, phone_number, role, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, ['inactive-user', 'inactive@test.com', hash, 'Inactive User', '0700000099', 'member', false]);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'inactive@test.com',
          password: 'Test@1234'
        });

      expect(response.status).toBe(302); // Redirect with error
    });
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/admin/register')
        .send({
          email: 'newuser@test.com',
          password: 'NewUser@1234',
          full_name: 'New User',
          phone_number: '0700000099',
          role_id: 'role-member'
        });

      // Check if user was created
      const { getQuery } = require('../../testDb');
      const query = getQuery();
      const result = await query('SELECT * FROM users WHERE email = $1', ['newuser@test.com']);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].full_name).toBe('New User');
    });

    it('should not register user with existing email', async () => {
      const response = await request(app)
        .post('/admin/register')
        .send({
          email: 'admin@test.com', // Already exists
          password: 'Test@1234',
          full_name: 'Duplicate User',
          phone_number: '0700000099'
        });

      expect(response.status).toBe(302); // Redirect with error
    });

    it('should validate password requirements', async () => {
      const response = await request(app)
        .post('/admin/register')
        .send({
          email: 'newuser@test.com',
          password: 'weak', // Weak password
          full_name: 'New User',
          phone_number: '0700000099'
        });

      expect(response.status).toBe(302); // Redirect with validation error
    });
  });

  describe('GET /auth/logout', () => {
    it('should logout and clear cookies', async () => {
      // Login first
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'Test@1234'
        });

      const cookies = loginResponse.headers['set-cookie'];

      // Logout
      const response = await request(app)
        .get('/auth/logout')
        .set('Cookie', cookies);

      expect(response.status).toBe(302); // Redirect to login
      expect(response.headers['set-cookie'][0]).toContain('token=;');
    });
  });
});
