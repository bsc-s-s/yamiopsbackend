import { Router } from 'express';
import * as controller from './incident.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { injectTenantId } from '../../middleware/tenant.js';
import { requirePermission } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate, injectTenantId);

router.get('/', requirePermission('incidents:read'), controller.list);
router.get('/:id', requirePermission('incidents:read'), controller.getById);
router.post('/', requirePermission('incidents:write'), controller.create);
router.put('/:id', requirePermission('incidents:write'), controller.update);
router.post('/:id/assign', requirePermission('incidents:write'), controller.assign);
router.post('/:id/resolve', requirePermission('incidents:write'), controller.resolve);
router.post('/:id/close', requirePermission('incidents:write'), controller.close);
router.delete('/:id', requirePermission('incidents:delete'), controller.remove);

export default router;
