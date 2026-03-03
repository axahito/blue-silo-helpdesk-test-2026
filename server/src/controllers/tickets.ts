import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getORM } from '../utils/connect';
import { Ticket } from '../entities/Ticket';
import { Role } from '../types/types';
import { ObjectId } from '@mikro-orm/mongodb';

function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

export async function createTicket(req: AuthRequest, res: Response) {
  try {
    const data = req.body;
    const createdBy = req.user?.username || data.createdBy || 'anonymous';
    
    const orm = getORM();
    const em = orm.em.fork();
    
    const ticket = em.create(Ticket, { ...data, createdBy, logs: [] });
    await em.persistAndFlush(ticket);
    
    res.status(201).json(ticket);
  } catch (err) {
    console.error('[tickets] createTicket error:', err);
    res.status(500).json({ message: 'Failed to create ticket', error: err });
  }
}

export async function listTickets(req: Request, res: Response) {
  try {
    console.log('[tickets] listTickets called');
    const { status, priority, escalation } = req.query as any;
    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (escalation) filter.escalation = escalation;
    
    const orm = getORM();
    const em = orm.em.fork();
    
    const tickets = await em.find(Ticket, filter, { orderBy: { createdAt: -1 }, limit: 200 });
    res.json(tickets);
  } catch (err) {
    console.error('[tickets] listTickets error:', err);
    res.status(500).json({ message: 'Failed to list tickets', error: err });
  }
}

export async function getTicket(req: Request, res: Response) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Not found' });
    }
    
    const orm = getORM();
    const em = orm.em.fork();
    
    const ticket = await em.findOne(Ticket, { _id: new ObjectId(req.params.id) });
    if (!ticket) return res.status(404).json({ message: 'Not found' });
    res.json(ticket);
  } catch (err: any) {
    console.error('[tickets] getTicket error:', err);
    res.status(500).json({ message: 'Failed to get ticket', error: err });
  }
}

export async function updateStatus(req: AuthRequest, res: Response) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Not found' });
    }
    
    const { status, note } = req.body;
    const orm = getORM();
    const em = orm.em.fork();
    
    const ticket = await em.findOne(Ticket, { _id: new ObjectId(req.params.id) });
    if (!ticket) return res.status(404).json({ message: 'Not found' });
    // prevent updates on completed tickets
    if (ticket.status === 'Completed') return res.status(400).json({ message: 'Ticket already completed' });

    ticket.status = status;
    const by = req.user?.username || 'system';
    const role = req.user?.role || Role.L1;
    ticket.logs = ticket.logs.concat({ by, role: role as Role, note: note || `Status -> ${status}`, date: new Date().toISOString(), action: 'status' });
    await em.persistAndFlush(ticket);
    res.json(ticket);
  } catch (err: any) {
    console.error('[tickets] updateStatus error:', err);
    res.status(500).json({ message: 'Failed to update status', error: err });
  }
}

export async function addLog(req: AuthRequest, res: Response) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Not found' });
    }
    
    const { note } = req.body;
    const orm = getORM();
    const em = orm.em.fork();
    
    const ticket = await em.findOne(Ticket, { _id: new ObjectId(req.params.id) });
    if (!ticket) return res.status(404).json({ message: 'Not found' });

    if (ticket.status === 'Completed') return res.status(400).json({ message: 'Cannot add log to a completed ticket' });

    const by = req.user?.username || 'unknown';
    const role = req.user?.role || Role.L2;
    ticket.logs = ticket.logs.concat({ by, role: role as Role, note, date: new Date().toISOString(), action: 'log' });
    await em.persistAndFlush(ticket);
    res.json(ticket);
  } catch (err: any) {
    console.error('[tickets] addLog error:', err);
    res.status(500).json({ message: 'Failed to add log', error: err });
  }
}

export async function escalate(req: AuthRequest, res: Response) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Not found' });
    }
    
    const { toRole, note } = req.body;
    const orm = getORM();
    const em = orm.em.fork();
    
    const ticket = await em.findOne(Ticket, { _id: new ObjectId(req.params.id) });
    if (!ticket) return res.status(404).json({ message: 'Not found' });

    if (ticket.status === 'Completed') return res.status(400).json({ message: 'Cannot escalate a completed ticket' });

    const requesterRole = req.user?.role;
    // Only L1 -> L2 and L2 -> L3 escalations allowed
    if (toRole === 'L2' && requesterRole !== Role.L1) {
      return res.status(403).json({ message: 'Only L1 can escalate to L2' });
    }
    if (toRole === 'L3' && requesterRole !== Role.L2) {
      return res.status(403).json({ message: 'Only L2 can escalate to L3' });
    }
    // Escalation to L3 requires critical C1 or C2
    if (toRole === 'L3' && !(ticket.critical === 'C1' || ticket.critical === 'C2')) {
      return res.status(400).json({ message: 'Only critical C1 or C2 tickets can be escalated to L3' });
    }

    ticket.escalation = toRole;
    const by = req.user?.username || 'system';
    const role = req.user?.role || Role.L1;
    ticket.logs = ticket.logs.concat({ by, role: role as Role, note: note || `Escalated to ${toRole}`, date: new Date().toISOString(), action: 'escalate' });
    await em.persistAndFlush(ticket);
    res.json(ticket);
  } catch (err: any) {
    console.error('[tickets] escalate error:', err);
    res.status(500).json({ message: 'Failed to escalate', error: err });
  }
}

export async function assignCritical(req: AuthRequest, res: Response) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Not found' });
    }
    
    const { critical, note } = req.body;
    const orm = getORM();
    const em = orm.em.fork();
    
    const ticket = await em.findOne(Ticket, { _id: new ObjectId(req.params.id) });
    if (!ticket) return res.status(404).json({ message: 'Not found' });

    if (ticket.status === 'Completed') return res.status(400).json({ message: 'Cannot set critical on a completed ticket' });

    ticket.critical = critical;
    const by = req.user?.username || 'system';
    const role = req.user?.role || Role.L2;
    ticket.logs = ticket.logs.concat({ by, role: role as Role, note: note || `Critical set ${critical}`, date: new Date().toISOString(), action: 'critical' });
    await em.persistAndFlush(ticket);
    res.json(ticket);
  } catch (err: any) {
    console.error('[tickets] assignCritical error:', err);
    res.status(500).json({ message: 'Failed to set critical', error: err });
  }
}

export async function addResolution(req: AuthRequest, res: Response) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Not found' });
    }
    
    const { resolution } = req.body;
    const orm = getORM();
    const em = orm.em.fork();
    
    const ticket = await em.findOne(Ticket, { _id: new ObjectId(req.params.id) });
    if (!ticket) return res.status(404).json({ message: 'Not found' });

    if (ticket.status === 'Completed') return res.status(400).json({ message: 'Ticket already completed' });

    // Must be escalated to L3 and critical C1 or C2
    if (ticket.escalation !== 'L3' || !(ticket.critical === 'C1' || ticket.critical === 'C2')) {
      return res.status(403).json({ message: 'L3 can only resolve escalated critical (C1–C2) tickets' });
    }

    const by = req.user?.username || 'system';
    const role = req.user?.role || Role.L3;
    ticket.logs = ticket.logs.concat({ by, role: role as Role, note: resolution, date: new Date().toISOString(), action: 'resolution' });
    ticket.status = 'Completed';
    await em.persistAndFlush(ticket);
    res.json(ticket);
  } catch (err: any) {
    console.error('[tickets] addResolution error:', err);
    res.status(500).json({ message: 'Failed to add resolution', error: err });
  }
}
