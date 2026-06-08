import * as repo from './tenant.repository.js';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError.js';

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function list() {
  return repo.findAll();
}

export async function getById(id) {
  const tenant = await repo.findById(id);
  if (!tenant) throw new NotFoundError('Empresa no encontrada');
  return tenant;
}

export async function create(data) {
  const slug = generateSlug(data.name);
  const existing = await repo.findBySlug(slug);
  if (existing) throw new ConflictError('Ya existe una empresa con ese nombre');
  return repo.create({
    name: data.name,
    slug,
    email: data.email || '',
    phone: data.phone || '',
    plan: data.plan || 'free',
    is_active: true,
    settings: data.settings || {},
  });
}

export async function update(id, data) {
  await getById(id);
  const updates = {};
  if (data.name) updates.name = data.name;
  if (data.email !== undefined) updates.email = data.email;
  if (data.phone !== undefined) updates.phone = data.phone;
  if (data.plan) updates.plan = data.plan;
  if (data.is_active !== undefined) updates.is_active = data.is_active;
  if (data.settings) updates.settings = data.settings;
  return repo.update(id, updates);
}

export async function remove(id) {
  await getById(id);
  return repo.remove(id);
}

export async function getStats(id) {
  const tenant = await getById(id);
  const { supabase } = await import('../../config/database.js');
  const { count: properties } = await supabase.from('properties').select('*', { count: 'exact', head: true }).eq('tenant_id', id);
  const { count: users } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('tenant_id', id);
  const { count: rooms } = await supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('tenant_id', id);
  return { ...tenant, stats: { properties, users, rooms } };
}
