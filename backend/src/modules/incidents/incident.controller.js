import * as service from './incident.service.js';
import { success } from '../../shared/utils/response.js';

export async function list(req, res, next) {
  try {
    const incidents = await service.list(req.tenant_id, req.query);
    success(res, incidents);
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const incident = await service.getById(req.params.id);
    success(res, incident);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const incident = await service.create({ ...req.body, tenant_id: req.tenant_id, reported_by: req.user.id });
    success(res, incident, 'Incidencia creada', 201);
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const incident = await service.update(req.params.id, req.body);
    success(res, incident, 'Incidencia actualizada');
  } catch (err) { next(err); }
}

export async function assign(req, res, next) {
  try {
    const incident = await service.assign(req.params.id, req.body.user_id);
    success(res, incident, 'Incidencia asignada');
  } catch (err) { next(err); }
}

export async function resolve(req, res, next) {
  try {
    const incident = await service.resolve(req.params.id);
    success(res, incident, 'Incidencia resuelta');
  } catch (err) { next(err); }
}

export async function close(req, res, next) {
  try {
    const incident = await service.close(req.params.id);
    success(res, incident, 'Incidencia cerrada');
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await service.remove(req.params.id);
    success(res, null, 'Incidencia eliminada');
  } catch (err) { next(err); }
}
