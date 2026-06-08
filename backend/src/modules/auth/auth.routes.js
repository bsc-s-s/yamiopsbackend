import { Router } from 'express';
import * as controller from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { injectTenantId } from '../../middleware/tenant.js';
import { requirePermission } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { registerSchema, loginSchema, changePasswordSchema } from './auth.schema.js';

const router = Router();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.get('/profile', authenticate, controller.profile);
router.put('/profile', authenticate, controller.updateProfile);
router.put('/change-password', authenticate, validate(changePasswordSchema), controller.changePassword);
router.get('/', authenticate, injectTenantId, requirePermission('users:read'), controller.listUsers);

export default router;
