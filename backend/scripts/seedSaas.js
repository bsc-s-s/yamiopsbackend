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

async function seed() {
  console.log('🌱 Sembrando datos iniciales...');

  const { data: existingTenant } = await supabase.from('tenants').select('id').eq('slug', 'yami-ops').maybeSingle();
  if (existingTenant) {
    console.log('⚠️ Tenant ya existe, saltando seed');
    return;
  }

  const { data: tenant, error: tErr } = await supabase
    .from('tenants')
    .insert([{ name: 'YAMI OPS', slug: 'yami-ops', plan: 'pro', is_active: true }])
    .select()
    .single();

  if (tErr) { console.error('Error tenant:', tErr); return; }
  console.log('✅ Tenant creado:', tenant.id);

  const passwordHash = await bcrypt.hash('admin123', 12);
  const { data: user, error: uErr } = await supabase
    .from('users')
    .insert([{ tenant_id: tenant.id, email: 'admin@yamiops.com', password_hash: passwordHash, name: 'Admin YAMI', role: 'admin', is_active: true }])
    .select()
    .single();

  if (uErr) { console.error('Error user:', uErr); return; }
  console.log('✅ Admin creado:', user.email);

  const { data: p1 } = await supabase
    .from('properties')
    .insert([{ tenant_id: tenant.id, name: 'Cota 1600', type: 'hostel', check_in_time: '14:00', check_out_time: '12:00' }])
    .select()
    .single();

  const { data: p2 } = await supabase
    .from('properties')
    .insert([{ tenant_id: tenant.id, name: 'Cota 2000 - La Borda', type: 'cabin', check_in_time: '15:00', check_out_time: '11:00' }])
    .select()
    .single();

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

  console.log('🎉 Seed completado!');
  console.log('📧 Email: admin@yamiops.com');
  console.log('🔑 Password: admin123');
}

seed().catch(console.error);
