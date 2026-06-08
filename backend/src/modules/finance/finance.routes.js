import { Router } from 'express';
import * as controller from './finance.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { injectTenantId } from '../../middleware/tenant.js';
import { requirePermission } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate, injectTenantId);

router.get('/', requirePermission('finance:read'), controller.list);
router.get('/summary', requirePermission('finance:read'), controller.getSummary);
router.get('/daily-cash', requirePermission('finance:read'), controller.getDailyCash);
router.get('/:id', requirePermission('finance:read'), controller.getById);
router.post('/', requirePermission('finance:write'), controller.create);
router.put('/:id', requirePermission('finance:write'), controller.update);
router.delete('/:id', requirePermission('finance:delete'), controller.remove);

export default router;
