import { createTicket, escalate, updateStatus } from '../controllers/tickets';
import { AuthRequest } from '../middleware/auth';

jest.mock('../utils/connect', () => ({
  getORM: jest.fn(),
}));

import { getORM } from '../utils/connect';

function mockResponse() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as unknown as any;
}

describe('tickets controller (unit)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('createTicket persists and returns created ticket with mandatory fields', async () => {
    const fakeTicket = { title: 'Test', priority: 'High', createdBy: 'user1', logs: [] };

    const em = {
      create: jest.fn().mockReturnValue(fakeTicket),
      persistAndFlush: jest.fn().mockResolvedValue(undefined),
    };
    (getORM as jest.Mock).mockReturnValue({ em: { fork: () => em } });

    const req = { body: { title: 'Test', priority: 'High' }, user: { username: 'user1' } } as unknown as AuthRequest;
    const res = mockResponse();

    await createTicket(req, res);

    expect(em.create).toHaveBeenCalled();
    expect(em.persistAndFlush).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeTicket);
  });

  test('escalate enforces role and critical rules', async () => {
    const ticketBase = { status: 'New', critical: 'C3', escalation: null, logs: [] } as any;

    // mock findOne to return a ticket with C3 (not allowed to escalate to L3)
    const em1 = { findOne: jest.fn().mockResolvedValue({ ...ticketBase }), persistAndFlush: jest.fn().mockResolvedValue(undefined) };
    (getORM as jest.Mock).mockReturnValueOnce({ em: { fork: () => em1 } });

    let req = { params: { id: '507f1f77bcf86cd799439011' }, body: { toRole: 'L3' }, user: { role: 'L2', username: 'bob' } } as unknown as AuthRequest;
    let res = mockResponse();
    await escalate(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    // escalate to L2 by non-L1 should be forbidden
    const em2 = { findOne: jest.fn().mockResolvedValue({ ...ticketBase }), persistAndFlush: jest.fn().mockResolvedValue(undefined) };
    (getORM as jest.Mock).mockReturnValueOnce({ em: { fork: () => em2 } });
    req = { params: { id: '507f1f77bcf86cd799439011' }, body: { toRole: 'L2' }, user: { role: 'L2', username: 'bob' } } as unknown as AuthRequest;
    res = mockResponse();
    await escalate(req, res);
    expect(res.status).toHaveBeenCalledWith(403);

    // successful escalate L2 -> L3 when critical is C1
    const em3 = { findOne: jest.fn().mockResolvedValue({ ...ticketBase, critical: 'C1' }), persistAndFlush: jest.fn().mockResolvedValue(undefined) };
    (getORM as jest.Mock).mockReturnValueOnce({ em: { fork: () => em3 } });
    req = { params: { id: '507f1f77bcf86cd799439011' }, body: { toRole: 'L3', note: 'please handle' }, user: { role: 'L2', username: 'bob' } } as unknown as AuthRequest;
    res = mockResponse();
    await escalate(req, res);
    expect(em3.persistAndFlush).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  test('updateStatus appends a log entry with action "status"', async () => {
    const ticket = { status: 'New', logs: [] } as any;
    const em = { findOne: jest.fn().mockResolvedValue(ticket), persistAndFlush: jest.fn().mockResolvedValue(undefined) };
    (getORM as jest.Mock).mockReturnValue({ em: { fork: () => em } });

    const req = { params: { id: '507f1f77bcf86cd799439011' }, body: { status: 'Attending', note: 'on it' }, user: { username: 'alice', role: 'L1' } } as unknown as AuthRequest;
    const res = mockResponse();

    await updateStatus(req, res);

    expect(em.findOne).toHaveBeenCalled();
    expect(em.persistAndFlush).toHaveBeenCalled();
    expect(ticket.logs.some((l: any) => l.action === 'status')).toBeTruthy();
    expect(res.json).toHaveBeenCalledWith(ticket);
  });
});
