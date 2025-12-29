/**
 * Unit tests for Role model
 */

const Role = require('../../../src/models/Role');
const db = require('../../../src/models/db');

describe('Role Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all active roles', async () => {
      const mockRoles = [
        { id: 'role-1', name: 'Admin', is_active: true },
        { id: 'role-2', name: 'Member', is_active: true }
      ];

      db.query.mockResolvedValueOnce({ rows: mockRoles });

      const result = await Role.getAll();

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE is_active = true')
      );
      expect(result).toEqual(mockRoles);
    });
  });

  describe('findById', () => {
    it('should find role by ID', async () => {
      const mockRole = {
        id: 'role-123',
        name: 'Admin',
        description: 'Administrator role'
      };

      db.query.mockResolvedValueOnce({ rows: [mockRole] });

      const result = await Role.findById('role-123');

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        ['role-123']
      );
      expect(result).toEqual(mockRole);
    });
  });

  describe('findByName', () => {
    it('should find role by name', async () => {
      const mockRole = {
        id: 'role-123',
        name: 'Admin'
      };

      db.query.mockResolvedValueOnce({ rows: [mockRole] });

      const result = await Role.findByName('Admin');

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        ['Admin']
      );
      expect(result).toEqual(mockRole);
    });
  });

  describe('getPermissions', () => {
    it('should return permissions for a role', async () => {
      const mockPermissions = [
        { id: 'perm-1', name: 'users.view', module: 'users' },
        { id: 'perm-2', name: 'users.create', module: 'users' }
      ];

      db.query.mockResolvedValueOnce({ rows: mockPermissions });

      const result = await Role.getPermissions('role-123');

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('JOIN role_permissions'),
        ['role-123']
      );
      expect(result).toEqual(mockPermissions);
    });
  });

  describe('assignPermission', () => {
    it('should assign permission to role', async () => {
      const roleId = 'role-123';
      const permissionId = 'perm-456';
      const mockResult = { role_id: roleId, permission_id: permissionId };

      db.query.mockResolvedValueOnce({ rows: [mockResult] });

      const result = await Role.assignPermission(roleId, permissionId);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO role_permissions'),
        [roleId, permissionId]
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('removePermission', () => {
    it('should remove permission from role', async () => {
      const roleId = 'role-123';
      const permissionId = 'perm-456';

      db.query.mockResolvedValueOnce({ rows: [] });

      await Role.removePermission(roleId, permissionId);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM role_permissions'),
        [roleId, permissionId]
      );
    });
  });

  describe('getUsers', () => {
    it('should return users with specific role', async () => {
      const mockUsers = [
        { id: 'user-1', full_name: 'User One', role_id: 'role-123' },
        { id: 'user-2', full_name: 'User Two', role_id: 'role-123' }
      ];

      db.query.mockResolvedValueOnce({ rows: mockUsers });

      const result = await Role.getUsers('role-123');

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE role_id = $1'),
        ['role-123']
      );
      expect(result).toEqual(mockUsers);
    });
  });
});
