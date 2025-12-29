/**
 * Unit tests for User model
 */

const User = require('../../../src/models/User');
const db = require('../../../src/models/db');

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test@1234',
        full_name: 'Test User',
        phone_number: '0700000000',
        role: 'member'
      };

      const mockUser = {
        id: 'user-123',
        email: userData.email,
        full_name: userData.full_name,
        phone_number: userData.phone_number,
        role: userData.role,
        is_active: false,
        registration_paid: false
      };

      db.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await User.create(userData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([
          expect.any(String), // id
          userData.email,
          expect.any(String), // hashed password
          userData.full_name,
          userData.phone_number,
          userData.role
        ])
      );

      expect(result).toEqual(mockUser);
    });

    it('should default to member role if not specified', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test@1234',
        full_name: 'Test User',
        phone_number: '0700000000'
      };

      db.query.mockResolvedValueOnce({ rows: [{ id: 'user-123', role: 'member' }] });

      await User.create(userData);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['member'])
      );
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User'
      };

      db.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await User.findByEmail('test@example.com');

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1',
        ['test@example.com']
      );
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if user not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await User.findByEmail('nonexistent@example.com');

      expect(result).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };

      db.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await User.findById('user-123');

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = $1',
        ['user-123']
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('assignRole', () => {
    it('should assign role to user', async () => {
      const userId = 'user-123';
      const roleId = 'role-456';
      const mockResult = {
        id: userId,
        role_id: roleId
      };

      db.query.mockResolvedValueOnce({ rows: [mockResult] });

      const result = await User.assignRole(userId, roleId);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        [roleId, userId]
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('markRegistrationPaid', () => {
    it('should mark registration as paid', async () => {
      const userId = 'user-123';
      const mockResult = {
        id: userId,
        registration_paid: true
      };

      db.query.mockResolvedValueOnce({ rows: [mockResult] });

      const result = await User.markRegistrationPaid(userId);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        [userId]
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const bcrypt = require('bcrypt');
      const password = 'Test@1234';
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await User.verifyPassword(password, hashedPassword);

      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('Test@1234', 10);

      const result = await User.verifyPassword('WrongPassword', hashedPassword);

      expect(result).toBe(false);
    });
  });

  describe('updateGuarantorStatus', () => {
    it('should update guarantor status', async () => {
      const userId = 'user-123';
      const canBeGuarantor = true;
      const maxShares = 5;

      const mockResult = {
        id: userId,
        can_be_guarantor: canBeGuarantor,
        max_shares_to_guarantee: maxShares
      };

      db.query.mockResolvedValueOnce({ rows: [mockResult] });

      const result = await User.updateGuarantorStatus(userId, canBeGuarantor, maxShares);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        [canBeGuarantor, maxShares, userId]
      );
      expect(result).toEqual(mockResult);
    });
  });
});
