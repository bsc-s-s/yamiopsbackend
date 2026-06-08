import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('verbatim');

export const supabase = createClient(env.supabaseUrl, env.supabaseKey, {
  auth: { persistSession: false },
  db: { schema: 'public' },
});

export async function checkConnection() {
  const { error } = await supabase.from('tenants').select('id', { count: 'exact', head: true });
  if (error && error.code === '42P01') {
    console.log('⚠️ Tablas no existen. Ejecuta el schema.sql en Supabase SQL Editor.');
    return false;
  }
  if (error) {
    console.log('⚠️ Error de conexión:', error.message);
    return false;
  }
  console.log('✅ Conectado a Supabase PostgreSQL');
  return true;
}
