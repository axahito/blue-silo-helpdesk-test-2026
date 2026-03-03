import { Router } from 'express';
import * as ctrl from '../controllers/tickets';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { Role } from '../types/types';
import { createTicketValidator, updateStatusValidator, addLogValidator, escalateValidator, assignCriticalValidator, addResolutionValidator } from '../middleware/validators';

const router = Router();

router.post('/', requireAuth, requireRole([Role.L1, Role.L2, Role.L3]), createTicketValidator, ctrl.createTicket);
router.get('/', requireAuth, ctrl.listTickets);
router.get('/:id', requireAuth, ctrl.getTicket);
router.post('/:id/status', requireAuth, requireRole([Role.L1]), updateStatusValidator, ctrl.updateStatus);
router.post('/:id/log', requireAuth, addLogValidator, ctrl.addLog);
router.post('/:id/escalate', requireAuth, escalateValidator, ctrl.escalate);
router.post('/:id/critical', requireAuth, requireRole([Role.L2, Role.L3]), assignCriticalValidator, ctrl.assignCritical);
router.post('/:id/resolve', requireAuth, requireRole([Role.L3]), addResolutionValidator, ctrl.addResolution);

export default router;
