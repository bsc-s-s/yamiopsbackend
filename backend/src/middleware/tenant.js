import { ForbiddenError } from '../shared/errors/AppError.js';

export function injectTenantId(req, res, next) {
  const tenantId = req.headers['x-tenant-id'] || req.user?.tenant_id;
  if (!tenantId) {
    return next(new ForbiddenError('Se requiere tenant_id'));
  }
  req.tenant_id = tenantId;
  next();
}

export function ensureTenantAccess(req, res, next) {
  if (req.user?.role === 'super_admin') {
    return next();
  }
  if (req.user?.tenant_id !== req.tenant_id) {
    return next(new ForbiddenError('No tienes acceso a este tenant'));
  }
  next();
}
