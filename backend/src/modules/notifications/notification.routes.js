import { Router } from 'express';
import * as controller from './notification.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { injectTenantId } from '../../middleware/tenant.js';
import { requirePermission } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate, injectTenantId);

router.get('/', requirePermission('notifications:read'), controller.list);
router.post('/', requirePermission('notifications:write'), controller.create);
router.post('/send', requirePermission('notifications:write'), controller.send);
router.post('/:id/retry', requirePermission('notifications:write'), controller.retryFailed);

export default router;
