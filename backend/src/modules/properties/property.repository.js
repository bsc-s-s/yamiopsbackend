import { supabase } from '../../config/database.js';

export async function findAllByTenant(tenantId) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name');
  if (error) throw error;
  return data;
}

export async function findById(id) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function create(data) {
  const { data: result, error } = await supabase
    .from('properties')
    .insert([data])
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function update(id, updates) {
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function remove(id) {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}

export async function findRoomsByProperty(propertyId) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('property_id', propertyId)
    .order('name');
  if (error) throw error;
  return data;
}

export async function findRoomById(id) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createRoom(data) {
  const { data: result, error } = await supabase
    .from('rooms')
    .insert([data])
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateRoom(id, updates) {
  const { data, error } = await supabase
    .from('rooms')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRoomStatus(id, status) {
  const { data, error } = await supabase
    .from('rooms')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function countByTenant(tenantId) {
  const { count, error } = await supabase
    .from('rooms')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);
  if (error) throw error;
  return count;
}
