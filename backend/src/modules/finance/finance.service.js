import * as repo from './finance.repository.js';
import { NotFoundError } from '../../shared/errors/AppError.js';

export async function list(tenantId, filters = {}) {
  return repo.findAllByTenant(tenantId, filters);
}

export async function getById(id) {
  const record = await repo.findById(id);
  if (!record) throw new NotFoundError('Movimiento no encontrado');
  return record;
}

export async function create(data) {
  return repo.create({
    tenant_id: data.tenant_id,
    property_id: data.property_id || null,
    type: data.type,
    category: data.category || 'other',
    description: data.description,
    amount: parseFloat(data.amount),
    payment_method: data.payment_method || 'cash',
    reference: data.reference || '',
    reservation_id: data.reservation_id || null,
    recorded_by: data.recorded_by,
  });
}

export async function update(id, data) {
  await getById(id);
  return repo.update(id, data);
}

export async function remove(id) {
  await getById(id);
  return repo.remove(id);
}

export async function getSummary(tenantId, dateFrom, dateTo) {
  return repo.getSummary(tenantId, dateFrom, dateTo);
}

export async function getDailyCash(tenantId, date) {
  return repo.getDailyCash(tenantId, date);
}
