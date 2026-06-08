import * as service from './notification.service.js';
import { success } from '../../shared/utils/response.js';

export async function list(req, res, next) {
  try {
    const notifications = await service.list(req.tenant_id, req.query);
    success(res, notifications);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const notification = await service.create({ ...req.body, tenant_id: req.tenant_id });
    success(res, notification, 'Notificación creada', 201);
  } catch (err) { next(err); }
}

export async function send(req, res, next) {
  try {
    const result = await service.send({ ...req.body, tenant_id: req.tenant_id });
    success(res, result, result.status === 'sent' ? 'Notificación enviada' : 'Error al enviar');
  } catch (err) { next(err); }
}

export async function retryFailed(req, res, next) {
  try {
    const result = await service.retryFailed(req.params.id);
    success(res, result, 'Reintento de envío realizado');
  } catch (err) { next(err); }
}
