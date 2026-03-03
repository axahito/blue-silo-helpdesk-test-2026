import { requireAuth, requireRole } from '../middleware/auth';
import jwt from 'jsonwebtoken';

describe('auth middleware', () => {
  const SECRET = process.env.JWT_SECRET || 'dev-secret';

  function mockReq(cookieToken?: string) {
    return { cookies: cookieToken ? { accessToken: cookieToken } : {}, } as any;
  }

  function mockRes() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  }

  test('requireAuth allows valid token', () => {
    const token = jwt.sign({ id: '1', username: 'u', role: 'L1' }, SECRET);
    const req: any = mockReq(token);
    const res = mockRes();
    const next = jest.fn();

    requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.username).toBe('u');
  });

  test('requireAuth rejects missing token', () => {
    const req: any = mockReq();
    const res = mockRes();
    const next = jest.fn();

    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('requireAuth rejects invalid token', () => {
    const req: any = mockReq('invalid');
    const res = mockRes();
    const next = jest.fn();

    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('requireRole blocks unauthorized roles and allows authorized', () => {
    const req: any = { user: { role: 'L2' } };
    const res = mockRes();
    const next = jest.fn();

    const guard = requireRole(['L2'] as any);
    guard(req, res, next);
    expect(next).toHaveBeenCalled();

    const guard2 = requireRole(['L1'] as any);
    const res2 = mockRes();
    const next2 = jest.fn();
    guard2(req, res2, next2);
    expect(res2.status).toHaveBeenCalledWith(403);
  });
});
