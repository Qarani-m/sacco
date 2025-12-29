/**
 * Unit tests for checkRole middleware
 */

const checkRole = require('../../../src/middleware/checkRole');
const Role = require('../../../src/models/Role');

jest.mock('../../../src/models/Role');

describe('checkRole Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {
        id: 'user-123',
        role_id: 'role-123'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next() if user has required role', async () => {
    const middleware = checkRole('Admin');

    Role.findById.mockResolvedValueOnce({
      id: 'role-123',
      name: 'Admin'
    });

    await middleware(req, res, next);

    expect(Role.findById).toHaveBeenCalledWith('role-123');
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should render 403 if user does not have required role', async () => {
    const middleware = checkRole('Admin');

    Role.findById.mockResolvedValueOnce({
      id: 'role-123',
      name: 'Member'
    });

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.render).toHaveBeenCalledWith(
      'errors/403',
      expect.objectContaining({
        title: 'Access Denied',
        message: expect.stringContaining('Admin role')
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow if user has one of multiple allowed roles', async () => {
    const middleware = checkRole(['Admin', 'Finance']);

    Role.findById.mockResolvedValueOnce({
      id: 'role-123',
      name: 'Finance'
    });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should render 403 if user is not authenticated', async () => {
    const middleware = checkRole('Admin');
    req.user = null;

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.render).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should render 403 if user has no role_id', async () => {
    const middleware = checkRole('Admin');
    req.user.role_id = null;

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.render).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    const middleware = checkRole('Admin');

    Role.findById.mockRejectedValueOnce(new Error('Database error'));

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith(
      'errors/500',
      expect.objectContaining({
        title: 'Server Error'
      })
    );
  });
});
