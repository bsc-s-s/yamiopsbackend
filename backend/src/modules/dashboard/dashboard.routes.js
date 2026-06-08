import { Router } from 'express';
import * as controller from './dashboard.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { injectTenantId } from '../../middleware/tenant.js';
import { requirePermission } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate, injectTenantId);

router.get('/resume', requirePermission('dashboard:read'), controller.getResume);
router.get('/occupancy-timeline', requirePermission('dashboard:read'), controller.getOccupancyTimeline);

export default router;
