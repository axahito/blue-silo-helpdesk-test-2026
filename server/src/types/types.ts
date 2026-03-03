export enum Role {
  L1 = 'L1',
  L2 = 'L2',
  L3 = 'L3',
}

export type Priority = 'Low' | 'Med' | 'High';
export type Status = 'New' | 'Attending' | 'Completed';
export type Critical = 'C1' | 'C2' | 'C3' | 'None';

export interface LogEntry {
  by: string;
  role: Role;
  note: string;
  date: string; // ISO
  action?: string;
}

export interface Ticket {
  _id?: string;
  title: string;
  description: string;
  category?: string;
  expectedCompletion?: string | null; // ISO
  priority: Priority;
  status: Status;
  escalation?: Role | null;
  critical?: Critical;
  logs: LogEntry[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  _id?: string;
  username: string;
  passwordHash: string;
  role: Role;
}
