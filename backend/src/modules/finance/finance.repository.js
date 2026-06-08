import { supabase } from '../../config/database.js';

export async function findAllByTenant(tenantId, filters = {}) {
  let query = supabase
    .from('financial_records')
    .select('*, properties(name), reservations(id)')
    .eq('tenant_id', tenantId);

  if (filters.type) query = query.eq('type', filters.type);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.date_from) query = query.gte('recorded_at', filters.date_from);
  if (filters.date_to) query = query.lte('recorded_at', filters.date_to);
  if (filters.property_id) query = query.eq('property_id', filters.property_id);

  query = query.order('recorded_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function findById(id) {
  const { data, error } = await supabase
    .from('financial_records')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function create(data) {
  const { data: result, error } = await supabase
    .from('financial_records')
    .insert([data])
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function update(id, updates) {
  const { data, error } = await supabase
    .from('financial_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function remove(id) {
  const { error } = await supabase
    .from('financial_records')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}

export async function getSummary(tenantId, dateFrom, dateTo) {
  let query = supabase
    .from('financial_records')
    .select('type, amount, category')
    .eq('tenant_id', tenantId);

  if (dateFrom) query = query.gte('recorded_at', dateFrom);
  if (dateTo) query = query.lte('recorded_at', dateTo);

  const { data, error } = await query;
  if (error) throw error;

  const income = data.filter(r => r.type === 'income').reduce((s, r) => s + parseFloat(r.amount), 0);
  const expense = data.filter(r => r.type === 'expense').reduce((s, r) => s + parseFloat(r.amount), 0);

  const byCategory = data.reduce((acc, r) => {
    const cat = r.category || 'other';
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += parseFloat(r.amount);
    return acc;
  }, {});

  return {
    income,
    expense,
    balance: income - expense,
    byCategory: Object.entries(byCategory).map(([category, total]) => ({ category, total })),
  };
}

export async function getDailyCash(tenantId, date) {
  const { data, error } = await supabase
    .from('financial_records')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('recorded_at', date || new Date().toISOString().split('T')[0])
    .order('recorded_at');
  if (error) throw error;
  return data;
}
