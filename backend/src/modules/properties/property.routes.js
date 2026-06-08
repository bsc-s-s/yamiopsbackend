import { Router } from 'express';
import * as controller from './property.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { injectTenantId } from '../../middleware/tenant.js';
import { requirePermission } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate, injectTenantId);

router.get('/', requirePermission('properties:read'), controller.listProperties);
router.get('/:id', requirePermission('properties:read'), controller.getProperty);
router.post('/', requirePermission('properties:write'), controller.createProperty);
router.put('/:id', requirePermission('properties:write'), controller.updateProperty);
router.delete('/:id', requirePermission('properties:delete'), controller.removeProperty);

router.get('/:propertyId/rooms', requirePermission('rooms:read'), controller.listRooms);
router.get('/:propertyId/rooms/:roomId', requirePermission('rooms:read'), controller.getRoom);
router.post('/:propertyId/rooms', requirePermission('rooms:write'), controller.createRoom);
router.put('/:propertyId/rooms/:roomId', requirePermission('rooms:write'), controller.updateRoom);
router.put('/:propertyId/rooms/:roomId/status', requirePermission('rooms:write'), controller.changeRoomStatus);

export default router;
