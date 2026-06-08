import * as service from './finance.service.js';
import { success } from '../../shared/utils/response.js';

export async function list(req, res, next) {
  try {
    const records = await service.list(req.tenant_id, req.query);
    success(res, records);
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const record = await service.getById(req.params.id);
    success(res, record);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const record = await service.create({ ...req.body, tenant_id: req.tenant_id, recorded_by: req.user.id });
    success(res, record, 'Movimiento registrado', 201);
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const record = await service.update(req.params.id, req.body);
    success(res, record, 'Movimiento actualizado');
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await service.remove(req.params.id);
    success(res, null, 'Movimiento eliminado');
  } catch (err) { next(err); }
}

export async function getSummary(req, res, next) {
  try {
    const summary = await service.getSummary(req.tenant_id, req.query.date_from, req.query.date_to);
    success(res, summary);
  } catch (err) { next(err); }
}

export async function getDailyCash(req, res, next) {
  try {
    const records = await service.getDailyCash(req.tenant_id, req.query.date);
    success(res, records);
  } catch (err) { next(err); }
}
