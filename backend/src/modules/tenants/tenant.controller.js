import * as service from './tenant.service.js';
import { success } from '../../shared/utils/response.js';

export async function list(req, res, next) {
  try {
    const tenants = await service.list();
    success(res, tenants);
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const tenant = await service.getById(req.params.id);
    success(res, tenant);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const tenant = await service.create(req.body);
    success(res, tenant, 'Empresa creada correctamente', 201);
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const tenant = await service.update(req.params.id, req.body);
    success(res, tenant, 'Empresa actualizada');
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await service.remove(req.params.id);
    success(res, null, 'Empresa eliminada');
  } catch (err) { next(err); }
}

export async function getStats(req, res, next) {
  try {
    const stats = await service.getStats(req.params.id);
    success(res, stats);
  } catch (err) { next(err); }
}
