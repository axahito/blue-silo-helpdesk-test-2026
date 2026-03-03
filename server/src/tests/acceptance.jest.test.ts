import { createTicket, listTickets } from '../controllers/tickets';
import { getORM } from '../utils/connect';

jest.mock('../utils/connect', () => ({ getORM: jest.fn() }));

function mockResponse() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as any;
}

describe('Jest-only acceptance smoke (server)', () => {
  test('createTicket then listTickets with priority filter returns created ticket', async () => {
    const tickets: any[] = [];
    const em = {
      create: jest.fn().mockImplementation((Model: any, data: any) => {
        const t = { ...data, _id: `t${tickets.length}`, logs: [], createdAt: new Date(), updatedAt: new Date() };
        tickets.push(t);
        return t;
      }),
      persistAndFlush: jest.fn().mockResolvedValue(undefined),
      find: jest.fn().mockImplementation(async (_: any, filter: any) => {
        if (!filter || Object.keys(filter).length === 0) return tickets.slice().reverse();
        return tickets.filter(t => Object.keys(filter).every(k => t[k] === filter[k]));
      }),
    };

    (getORM as jest.Mock).mockReturnValue({ em: { fork: () => em } });

    const reqCreate: any = { body: { title: 'AC Ticket', priority: 'High' }, user: { username: 'alice' } };
    const resCreate = mockResponse();
    await createTicket(reqCreate, resCreate);
    expect(em.create).toHaveBeenCalled();
    expect(resCreate.status).toHaveBeenCalledWith(201);

    const reqList: any = { query: { priority: 'High' } };
    const resList = mockResponse();
    await listTickets(reqList, resList);
    expect(resList.json).toHaveBeenCalled();
    const returned = (resList.json as jest.Mock).mock.calls[0][0];
    expect(Array.isArray(returned)).toBe(true);
    expect(returned.some((t: any) => t.title === 'AC Ticket')).toBeTruthy();
  });
});
