import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodTypeAny } from 'zod';
import {
  createTicketSchema,
  updateStatusSchema,
  addLogSchema,
  escalateSchema,
  assignCriticalSchema,
  addResolutionSchema,
  loginSchema,
  seedSchema,
} from '../schemas';

// generic middleware that can validate `req.body`, `req.params`, or `req.query`
// using a zod schema.  you can extend it later to validate multiple sources.
export function validateBody<T extends ZodTypeAny>(
  schema: T
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err: any) {
      // zod error format is already pretty friendly, map out if needed
      return res.status(400).json({ errors: err.errors });
    }
  };
}

// exported middleware ------------------------------------------------
export const createTicketValidator = validateBody(createTicketSchema);
export const updateStatusValidator = validateBody(updateStatusSchema);
export const addLogValidator = validateBody(addLogSchema);
export const escalateValidator = validateBody(escalateSchema);
export const assignCriticalValidator = validateBody(assignCriticalSchema);
export const addResolutionValidator = validateBody(addResolutionSchema);
export const loginValidator = validateBody(loginSchema);
export const seedValidator = validateBody(seedSchema);

