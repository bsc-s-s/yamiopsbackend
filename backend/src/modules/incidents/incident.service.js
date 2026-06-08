import * as repo from './incident.repository.js';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError.js';
import { supabase } from '../../config/database.js';

export async function list(tenantId, filters = {}) {
  return repo.findAllByTenant(tenantId, filters);
}

export async function getById(id) {
  const incident = await repo.findById(id);
  if (!incident) throw new NotFoundError('Incidencia no encontrada');
  return incident;
}

export async function create(data) {
  return repo.create({
    tenant_id: data.tenant_id,
    property_id: data.property_id,
    room_id: data.room_id || null,
    title: data.title,
    description: data.description || '',
    priority: data.priority || 'normal',
    status: 'open',
    department: data.department || 'maintenance',
    assigned_to: data.assigned_to || null,
    reported_by: data.reported_by,
  });
}

export async function update(id, data) {
  await getById(id);
  return repo.update(id, data);
}

export async function assign(id, userId) {
  await getById(id);
  return repo.update(id, { assigned_to: userId, status: 'in_progress' });
}

export async function resolve(id) {
  const incident = await getById(id);
  if (incident.status === 'closed') {
    throw new ConflictError('La incidencia ya está cerrada');
  }
  return repo.update(id, { status: 'resolved', resolved_at: new Date().toISOString() });
}

export async function close(id) {
  await getById(id);
  return repo.update(id, { status: 'closed' });
}

export async function remove(id) {
  await getById(id);
  return repo.remove(id);
}

export async function getOpenCount(tenantId) {
  return repo.countOpenByTenant(tenantId);
}

export async function getCriticalCount(tenantId) {
  return repo.countCriticalByTenant(tenantId);
}
