/**
 * Integration tests for Roles and Permissions API
 */

const request = require('supertest');
const app = require('../../../src/app');
const { initTestDb, cleanDatabase, seedTestData, closeTestDb } = require('../../testDb');

describe('Roles and Permissions API Integration Tests', () => {
  let testData;
  let adminCookie;

  beforeAll(async () => {
    await initTestDb();
  });

  beforeEach(async () => {
    await cleanDatabase();
    testData = await seedTestData();

    // Login as admin
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'Test@1234'
      });

    adminCookie = loginResponse.headers['set-cookie'];
  });

  afterAll(async () => {
    await closeTestDb();
  });

  describe('GET /roles', () => {
    it('should return all roles for admin user', async () => {
      const response = await request(app)
        .get('/roles')
        .set('Cookie', adminCookie);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Role Management');
    });

    it('should deny access for non-admin user', async () => {
      // Login as member
      const memberLogin = await request(app)
        .post('/auth/login')
        .send({
          email: 'member@test.com',
          password: 'Test@1234'
        });

      const response = await request(app)
        .get('/roles')
        .set('Cookie', memberLogin.headers['set-cookie']);

      expect(response.status).toBe(403);
      expect(response.text).toContain('Access Denied');
    });
  });

  describe('GET /roles/:roleId', () => {
    it('should show role details with permissions', async () => {
      const response = await request(app)
        .get(`/roles/${testData.roles.admin.id}`)
        .set('Cookie', adminCookie);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Admin');
    });

    it('should return 404 for non-existent role', async () => {
      const response = await request(app)
        .get('/roles/non-existent-role')
        .set('Cookie', adminCookie);

      expect(response.status).toBe(302); // Redirect with error
    });
  });

  describe('POST /roles/:roleId/permissions/assign', () => {
    it('should assign permission to role', async () => {
      const { getQuery } = require('../../testDb');
      const query = getQuery();

      // Create a test permission
      const permResult = await query(`
        INSERT INTO permissions (name, description, module, action)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, ['test.permission', 'Test Permission', 'test', 'view']);

      const permissionId = permResult.rows[0].id;

      const response = await request(app)
        .post(`/roles/${testData.roles.member.id}/permissions/assign`)
        .set('Cookie', adminCookie)
        .send({ permissionId });

      expect(response.status).toBe(302); // Redirect after success

      // Verify permission was assigned
      const checkResult = await query(`
        SELECT * FROM role_permissions
        WHERE role_id = $1 AND permission_id = $2
      `, [testData.roles.member.id, permissionId]);

      expect(checkResult.rows).toHaveLength(1);
    });
  });

  describe('POST /roles/:roleId/permissions/remove', () => {
    it('should remove permission from role', async () => {
      const { getQuery } = require('../../testDb');
      const query = getQuery();

      // Create and assign a test permission
      const permResult = await query(`
        INSERT INTO permissions (name, description, module, action)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, ['test.permission2', 'Test Permission 2', 'test', 'delete']);

      const permissionId = permResult.rows[0].id;

      await query(`
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES ($1, $2)
      `, [testData.roles.member.id, permissionId]);

      const response = await request(app)
        .post(`/roles/${testData.roles.member.id}/permissions/remove`)
        .set('Cookie', adminCookie)
        .send({ permissionId });

      expect(response.status).toBe(302);

      // Verify permission was removed
      const checkResult = await query(`
        SELECT * FROM role_permissions
        WHERE role_id = $1 AND permission_id = $2
      `, [testData.roles.member.id, permissionId]);

      expect(checkResult.rows).toHaveLength(0);
    });
  });

  describe('Role-based Access Control', () => {
    it('should allow Finance user to access finance dashboard', async () => {
      const financeLogin = await request(app)
        .post('/auth/login')
        .send({
          email: 'finance@test.com',
          password: 'Test@1234'
        });

      const response = await request(app)
        .get('/finance/dashboard')
        .set('Cookie', financeLogin.headers['set-cookie']);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Finance Dashboard');
    });

    it('should deny Member user access to risk dashboard', async () => {
      const memberLogin = await request(app)
        .post('/auth/login')
        .send({
          email: 'member@test.com',
          password: 'Test@1234'
        });

      const response = await request(app)
        .get('/risk/dashboard')
        .set('Cookie', memberLogin.headers['set-cookie']);

      expect(response.status).toBe(403);
    });

    it('should allow Risk user to access risk dashboard', async () => {
      const riskLogin = await request(app)
        .post('/auth/login')
        .send({
          email: 'risk@test.com',
          password: 'Test@1234'
        });

      const response = await request(app)
        .get('/risk/dashboard')
        .set('Cookie', riskLogin.headers['set-cookie']);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Risk Management Dashboard');
    });
  });
});
