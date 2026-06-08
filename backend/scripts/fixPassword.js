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
  const password = 'admin123';
  const passwordHash = await bcrypt.hash(password, 12);

  const { data: user, error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('email', 'admin@yamiops.com')
    .select()
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  const verify = await bcrypt.compare(password, passwordHash);
  console.log('✅ Hash verified:', verify);
  console.log('✅ Password actualizado para:', user.email);
}

fix().catch(console.error);
