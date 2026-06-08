import { supabase } from '../../config/database.js';

export async function findAllByTenant(tenantId, filters = {}) {
  let query = supabase
    .from('reservations')
    .select('*, customers(*), rooms(*), properties(name)')
    .eq('tenant_id', tenantId);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.property_id) query = query.eq('property_id', filters.property_id);
  if (filters.date_from) query = query.gte('check_in', filters.date_from);
  if (filters.date_to) query = query.lte('check_out', filters.date_to);

  query = query.order('check_in', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function findById(id) {
  const { data, error } = await supabase
    .from('reservations')
    .select('*, customers(*), rooms(*), properties(name)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function create(data) {
  const { data: result, error } = await supabase
    .from('reservations')
    .insert([data])
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function update(id, updates) {
  const { data, error } = await supabase
    .from('reservations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function remove(id) {
  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}

export async function findActiveByTenant(tenantId) {
  const { data, error } = await supabase
    .from('reservations')
    .select('*, customers(*), rooms(*)')
    .eq('tenant_id', tenantId)
    .in('status', ['confirmed', 'checked_in'])
    .order('check_in');
  if (error) throw error;
  return data;
}

export async function findTodayCheckouts(tenantId) {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('reservations')
    .select('*, customers(*), rooms(*)')
    .eq('tenant_id', tenantId)
    .eq('check_out', today)
    .eq('status', 'checked_in');
  if (error) throw error;
  return data;
}
