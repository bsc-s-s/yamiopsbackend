import { supabase } from '../../config/database.js';

export async function findAllByTenant(tenantId, filters = {}) {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('tenant_id', tenantId);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.type) query = query.eq('type', filters.type);

  query = query.order('created_at', { ascending: false }).limit(50);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function findById(id) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function create(data) {
  const { data: result, error } = await supabase
    .from('notifications')
    .insert([data])
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function update(id, updates) {
  const { data, error } = await supabase
    .from('notifications')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function countPending() {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');
  if (error) throw error;
  return count;
}
