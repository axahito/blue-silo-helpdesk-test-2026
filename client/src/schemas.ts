import { z } from 'zod';

// client copy of server schemas - keep in sync with server/src/schemas.ts
export const createTicketSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.string().optional(),
  expectedCompletion: z
    .string()
    .optional()
    .refine((s: string | undefined) => !s || !isNaN(Date.parse(s)), {
      message: 'Invalid ISO8601 date',
    }),
  priority: z.enum(['Low', 'Med', 'High']),
});
export type CreateTicket = z.infer<typeof createTicketSchema>;

export const updateStatusSchema = z.object({
  status: z.enum(['New', 'Attending', 'Completed']),
  note: z.string().optional(),
});
export type UpdateStatus = z.infer<typeof updateStatusSchema>;

export const addLogSchema = z.object({
  note: z.string().min(1),
});
export type AddLog = z.infer<typeof addLogSchema>;

export const escalateSchema = z.object({
  toRole: z.enum(['L1', 'L2', 'L3']),
  note: z.string().optional(),
});
export type Escalate = z.infer<typeof escalateSchema>;

export const assignCriticalSchema = z.object({
  critical: z.enum(['C1', 'C2', 'C3', 'None']),
  note: z.string().optional(),
});
export type AssignCritical = z.infer<typeof assignCriticalSchema>;

export const addResolutionSchema = z.object({
  resolution: z.string().min(1),
});
export type AddResolution = z.infer<typeof addResolutionSchema>;

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(4),
});
export type Login = z.infer<typeof loginSchema>;

export const seedSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(4),
  role: z.enum(['L1', 'L2', 'L3']).optional(),
});
export type Seed = z.infer<typeof seedSchema>;
