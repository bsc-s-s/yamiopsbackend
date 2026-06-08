import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function initDB() {
  const { data, error } = await supabase.from('habitaciones_1600').select('id', { count: 'exact', head: true });
  if (error && error.code === '42P01') {
    console.log('⚠️ Tablas no existen. Creando esquema...');
  } else if (!error) {
    console.log('✅ Conectado a Supabase');
  }
}

export function initSchema() {
  console.log('📋 Para crear las tablas, pega database/schema.sql en Supabase SQL Editor y haz clic en RUN');
}
