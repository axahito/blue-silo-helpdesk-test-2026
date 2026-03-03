import { Router } from 'express';
import * as ctrl from '../controllers/auth';
import { loginValidator, seedValidator } from '../middleware/validators';
import { requireAuth } from '../middleware/auth';

const r = Router();
r.post('/login', loginValidator, ctrl.login);
r.post('/seed', seedValidator, ctrl.seedUser);
r.post('/refresh', ctrl.refreshToken);
r.post('/logout', ctrl.logout);
r.get('/me', requireAuth, ctrl.getMe);

export default r;
