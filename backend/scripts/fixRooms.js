import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import dns from 'dns';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('verbatim');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function fix() {
  const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', 'yami-ops').single();
  if (!tenant) { console.log('❌ Tenant no encontrado'); return; }

  const { data: properties } = await supabase.from('properties').select('id, name').eq('tenant_id', tenant.id);
  const p1 = properties.find(p => p.name === 'Cota 1600');
  const p2 = properties.find(p => p.name === 'Cota 2000 - La Borda');

  await supabase.from('rooms').delete().eq('tenant_id', tenant.id);

  const roomsCota1 = [];
  for (let i = 101; i <= 111; i++) {
    roomsCota1.push({ tenant_id: tenant.id, property_id: p1.id, name: String(i), type: i >= 106 ? 'double' : 'dormitory', capacity: i >= 106 ? 2 : 6, price_per_night: i >= 106 ? 60 : 25, status: 'available' });
  }
  const { error: r1Err } = await supabase.from('rooms').insert(roomsCota1);
  if (r1Err) console.error('Error rooms Cota1600:', r1Err);
  else console.log(`✅ ${roomsCota1.length} habitaciones en Cota 1600`);

  const roomsCota2 = [];
  for (let i = 201; i <= 208; i++) {
    roomsCota2.push({ tenant_id: tenant.id, property_id: p2.id, name: String(i), type: 'suite', capacity: 2, price_per_night: 85, status: 'available' });
  }
  const { error: r2Err } = await supabase.from('rooms').insert(roomsCota2);
  if (r2Err) console.error('Error rooms Cota2000:', r2Err);
  else console.log(`✅ ${roomsCota2.length} suites en Cota 2000`);

  const { data: rooms } = await supabase.from('rooms').select('count').eq('tenant_id', tenant.id);
  console.log(`📊 Total habitaciones: ${rooms?.length || 0}`);
}

fix().catch(console.error);
