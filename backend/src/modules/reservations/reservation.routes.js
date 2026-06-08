import { Router } from 'express';
import * as controller from './reservation.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { injectTenantId } from '../../middleware/tenant.js';
import { requirePermission } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate, injectTenantId);

router.get('/', requirePermission('reservations:read'), controller.list);
router.get('/active', requirePermission('reservations:read'), controller.getActive);
router.get('/today-checkouts', requirePermission('reservations:read'), controller.getTodayCheckouts);
router.get('/:id', requirePermission('reservations:read'), controller.getById);
router.post('/', requirePermission('reservations:write'), controller.create);
router.put('/:id', requirePermission('reservations:write'), controller.update);
router.post('/:id/checkin', requirePermission('reservations:write'), controller.checkin);
router.post('/:id/checkout', requirePermission('reservations:write'), controller.checkout);
router.post('/:id/cancel', requirePermission('reservations:write'), controller.cancel);
router.delete('/:id', requirePermission('reservations:delete'), controller.remove);

export default router;
