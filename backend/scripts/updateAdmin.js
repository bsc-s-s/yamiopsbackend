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

async function update() {
  const email = 'yamivivares2019@gmail.com';
  const password = 'yami2019#';
  const passwordHash = await bcrypt.hash(password, 12);

  const { data: existing, error: findError } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', 'admin@yamiops.com')
    .single();

  if (findError) {
    console.error('Error buscando admin:', findError);
    return;
  }

  const { data, error } = await supabase
    .from('users')
    .update({ email, password_hash: passwordHash })
    .eq('id', existing.id)
    .select()
    .single();

  if (error) {
    console.error('Error actualizando:', error);
    return;
  }

  const verify = await bcrypt.compare(password, passwordHash);
  console.log('Hash verified:', verify);
  console.log('✅ Admin actualizado:', data.email);
}

update().catch(console.error);
