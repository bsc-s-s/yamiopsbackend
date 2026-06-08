import { PERMISSIONS } from '../shared/constants/roles.js';
import { ForbiddenError } from '../shared/errors/AppError.js';

export function requirePermission(permission) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) {
      return next(new ForbiddenError('Usuario sin rol'));
    }
    const permissions = PERMISSIONS[role];
    if (!permissions || (!permissions.includes('*') && !permissions.includes(permission))) {
      return next(new ForbiddenError(`Permiso requerido: ${permission}`));
    }
    next();
  };
}
