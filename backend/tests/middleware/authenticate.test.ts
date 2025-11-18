// backend/tests/middleware/authenticate.test.ts
import { authenticate } from '../../src/middleware/authenticate';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../src/config/app';
import * as database from '../../src/config/database';

// Mock the database module
jest.mock('../../src/config/database');

describe('authenticate middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let mockQuery: jest.MockedFunction<typeof database.query>;

  beforeEach(() => {
    req = {
      headers: {},
      cookies: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    mockQuery = database.query as jest.MockedFunction<typeof database.query>;
    jest.clearAllMocks();
  });

  it('should authenticate valid token from Authorization header', async () => {
    const token = jwt.sign({ userId: 'test-user-id', role: 'lawyer' }, config.jwtSecret);
    req.headers = { authorization: `Bearer ${token}` };

    // Mock database response
    mockQuery.mockResolvedValue({
      rows: [{
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'lawyer',
        organization: null
      }],
      rowCount: 1,
      command: '',
      oid: 0,
      fields: []
    });

    await authenticate(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user?.id).toBe('test-user-id');
  });

  it('should reject request without token', async () => {
    await authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject invalid token', async () => {
    req.headers = { authorization: 'Bearer invalid-token' };

    await authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
