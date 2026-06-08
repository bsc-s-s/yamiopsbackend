import { supabase } from '../../config/database.js';

export async function findAllByTenant(tenantId, filters = {}) {
  let query = supabase
    .from('incidents')
    .select('*, reported_by_user:users!reported_by(name), assigned_to_user:users!assigned_to(name), rooms(name), properties(name)')
    .eq('tenant_id', tenantId);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.priority) query = query.eq('priority', filters.priority);
  if (filters.department) query = query.eq('department', filters.department);
  if (filters.property_id) query = query.eq('property_id', filters.property_id);

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function findById(id) {
  const { data, error } = await supabase
    .from('incidents')
    .select('*, reported_by_user:users!reported_by(name), assigned_to_user:users!assigned_to(name), rooms(name), properties(name)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function create(data) {
  const { data: result, error } = await supabase
    .from('incidents')
    .insert([data])
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function update(id, updates) {
  const { data, error } = await supabase
    .from('incidents')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function remove(id) {
  const { error } = await supabase
    .from('incidents')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}

export async function countOpenByTenant(tenantId) {
  const { count, error } = await supabase
    .from('incidents')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .not('status', 'in', '("resolved","closed")');
  if (error) throw error;
  return count;
}

export async function countCriticalByTenant(tenantId) {
  const { count, error } = await supabase
    .from('incidents')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('priority', 'critical')
    .not('status', 'in', '("resolved","closed")');
  if (error) throw error;
  return count;
}
