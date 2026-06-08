import { supabase } from '../../config/database.js';

export async function findAll() {
  const { data, error } = await supabase.from('tenants').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function findById(id) {
  const { data, error } = await supabase.from('tenants').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function findBySlug(slug) {
  const { data, error } = await supabase.from('tenants').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data;
}

export async function create(tenantData) {
  const { data, error } = await supabase.from('tenants').insert([tenantData]).select().single();
  if (error) throw error;
  return data;
}

export async function update(id, updates) {
  const { data, error } = await supabase.from('tenants').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function remove(id) {
  const { error } = await supabase.from('tenants').delete().eq('id', id);
  if (error) throw error;
  return true;
}
