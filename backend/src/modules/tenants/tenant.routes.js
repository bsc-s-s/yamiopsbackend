import { Router } from 'express';
import * as controller from './tenant.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

const createTenantSchema = {
  body: {
    name: { required: true, type: 'string' },
    email: { required: false, type: 'string' },
    phone: { required: false, type: 'string' },
    plan: { required: false, type: 'string', enum: ['free', 'starter', 'pro', 'enterprise'] },
  },
};

router.get('/', authenticate, requirePermission('tenants:read'), controller.list);
router.get('/:id', authenticate, requirePermission('tenants:read'), controller.getById);
router.get('/:id/stats', authenticate, requirePermission('tenants:read'), controller.getStats);
router.post('/', authenticate, requirePermission('tenants:write'), validate(createTenantSchema), controller.create);
router.put('/:id', authenticate, requirePermission('tenants:write'), controller.update);
router.delete('/:id', authenticate, requirePermission('tenants:delete'), controller.remove);

export default router;
