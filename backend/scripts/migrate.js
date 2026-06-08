import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import dns from 'dns';
import { fileURLToPath } from 'url';
import path from 'path';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('verbatim');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function migrate() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const dbHost = supabaseUrl.replace('https://', '').replace('/rest/v1', '');
  const dbName = 'postgres';
  const dbUser = 'postgres';
  const dbPassword = 'S3guridad2023#';

  const encodedPassword = encodeURIComponent(dbPassword);
  const directIP = '2a05:d018:10e0:3300:e9d:5cd6:46c2:60b6';
  const connectionString = `postgresql://${dbUser}:${encodedPassword}@[${directIP}]:5432/${dbName}?sslmode=require&connect_timeout=15`;

  const client = new pg.Client({ connectionString });

  try {
    console.log('🔌 Conectando a Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado');

    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📦 Ejecutando schema...');
    await client.query(schema);
    console.log('✅ Schema ejecutado correctamente');
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message.includes('password') || err.message.includes('authentication')) {
      console.log('⚠️  Error de autenticación. Verifica la contraseña en Supabase.');
    }
    if (err.message.includes('connect') || err.message.includes('timeout')) {
      console.log('⚠️  No se pudo conectar. Es posible que el host solo tenga IPv6.');
      console.log('👉 Ejecuta el schema.sql manualmente en Supabase SQL Editor.');
    }
  } finally {
    try { await client.end(); } catch {}
  }
}

migrate();
