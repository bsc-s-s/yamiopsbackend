import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import dns from 'dns';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('verbatim');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function seedDemo() {
  const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', 'yami-ops').single();
  if (!tenant) { console.log('❌ Tenant no encontrado'); return; }

  const { data: user } = await supabase.from('users').select('id').eq('email', 'admin@yamiops.com').single();
  const { data: properties } = await supabase.from('properties').select('id, name').eq('tenant_id', tenant.id);
  const p1 = properties.find(p => p.name === 'Cota 1600');
  const p2 = properties.find(p => p.name === 'Cota 2000 - La Borda');

  const { data: rooms1 } = await supabase.from('rooms').select('id, name').eq('property_id', p1.id);
  const { data: rooms2 } = await supabase.from('rooms').select('id, name').eq('property_id', p2.id);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const customers = [
    { tenant_id: tenant.id, name: 'Carlos Martínez', email: 'carlos@email.com', phone: '+34600111222' },
    { tenant_id: tenant.id, name: 'Ana García López', email: 'ana@email.com', phone: '+34600333444' },
    { tenant_id: tenant.id, name: 'John Smith', email: 'john@email.com', phone: '+34600555666', nationality: 'UK' },
    { tenant_id: tenant.id, name: 'María Rodríguez', email: 'maria@email.com', phone: '+34600777888' },
    { tenant_id: tenant.id, name: 'Peter Johnson', email: 'peter@email.com', phone: '+34600999000', nationality: 'US' },
  ];
  const { data: createdCustomers } = await supabase.from('customers').insert(customers).select();
  console.log(`✅ ${createdCustomers.length} clientes creados`);

  const reservations = [
    { tenant_id: tenant.id, property_id: p1.id, customer_id: createdCustomers[0].id, room_id: rooms1[5].id, check_in: yesterday, check_out: tomorrow, guests: 2, status: 'checked_in', total_amount: 120, paid_amount: 120, source: 'manual', created_by: user.id },
    { tenant_id: tenant.id, property_id: p1.id, customer_id: createdCustomers[1].id, room_id: rooms1[6].id, check_in: yesterday, check_out: today, guests: 2, status: 'checked_in', total_amount: 60, paid_amount: 60, source: 'phone', created_by: user.id },
    { tenant_id: tenant.id, property_id: p1.id, customer_id: createdCustomers[2].id, room_id: rooms1[0].id, check_in: yesterday, check_out: today, guests: 4, status: 'checked_in', total_amount: 75, paid_amount: 75, source: 'web', created_by: user.id },
    { tenant_id: tenant.id, property_id: p2.id, customer_id: createdCustomers[3].id, room_id: rooms2[0].id, check_in: tomorrow, check_out: new Date(Date.now() + 3*86400000).toISOString().split('T')[0], guests: 2, status: 'confirmed', total_amount: 255, paid_amount: 100, source: 'whatsapp', created_by: user.id },
    { tenant_id: tenant.id, property_id: p2.id, customer_id: createdCustomers[4].id, room_id: rooms2[1].id, check_in: new Date(Date.now() + 2*86400000).toISOString().split('T')[0], check_out: new Date(Date.now() + 5*86400000).toISOString().split('T')[0], guests: 2, status: 'confirmed', total_amount: 340, paid_amount: 0, source: 'booking', created_by: user.id },
  ];
  const { data: createdReservations } = await supabase.from('reservations').insert(reservations).select();
  console.log(`✅ ${createdReservations.length} reservas creadas`);

  await supabase.from('rooms').update({ status: 'occupied' }).eq('id', rooms1[5].id);
  await supabase.from('rooms').update({ status: 'occupied' }).eq('id', rooms1[6].id);
  await supabase.from('rooms').update({ status: 'occupied' }).eq('id', rooms1[0].id);

  const incidents = [
    { tenant_id: tenant.id, property_id: p1.id, room_id: rooms1[2].id, title: 'Ducha sin agua caliente', description: 'Los huéspedes reportan que no sale agua caliente en la habitación 103', priority: 'high', status: 'open', department: 'maintenance', reported_by: user.id },
    { tenant_id: tenant.id, property_id: p1.id, title: 'Bombilla fundida pasillo', description: 'La bombilla del pasillo principal parpadea y necesita reemplazo', priority: 'low', status: 'open', department: 'maintenance', reported_by: user.id },
    { tenant_id: tenant.id, property_id: p1.id, room_id: rooms1[0].id, title: 'Calefacción no funciona', description: 'Radiador de la hab 101 no enciende', priority: 'critical', status: 'in_progress', department: 'maintenance', assigned_to: user.id, reported_by: user.id },
    { tenant_id: tenant.id, property_id: p2.id, title: 'WiFi intermitente', description: 'Varios huéspedes de Cota 2000 reportan caídas de conexión', priority: 'high', status: 'open', department: 'reception', reported_by: user.id },
    { tenant_id: tenant.id, property_id: p2.id, room_id: rooms2[2].id, title: 'Puerta no cierra bien', description: 'La cerradura de la Suite 203 está desajustada', priority: 'medium', status: 'open', department: 'maintenance', reported_by: user.id },
    { tenant_id: tenant.id, property_id: p1.id, title: 'Limpieza profunda cocina', description: 'Se necesita limpieza profunda de la cocina comunitaria', priority: 'medium', status: 'resolved', department: 'cleaning', assigned_to: user.id, reported_by: user.id, resolved_at: new Date().toISOString() },
  ];
  await supabase.from('incidents').insert(incidents);
  console.log(`✅ ${incidents.length} incidencias creadas`);

  const financialRecords = [
    { tenant_id: tenant.id, property_id: p1.id, type: 'income', category: 'accommodation', description: 'Reserva Carlos M. - 2 noches Hab 106', amount: 120, payment_method: 'card', recorded_by: user.id },
    { tenant_id: tenant.id, property_id: p1.id, type: 'income', category: 'accommodation', description: 'Reserva Ana G. - 1 noche Hab 107', amount: 60, payment_method: 'cash', recorded_by: user.id },
    { tenant_id: tenant.id, property_id: p1.id, type: 'income', category: 'accommodation', description: 'Reserva John S. - 1 noche Hab 101 (4 pax)', amount: 75, payment_method: 'card', recorded_by: user.id },
    { tenant_id: tenant.id, property_id: p1.id, type: 'expense', category: 'supplies', description: 'Compra productos de limpieza', amount: 45.50, payment_method: 'cash', recorded_by: user.id },
    { tenant_id: tenant.id, property_id: p1.id, type: 'expense', category: 'maintenance', description: 'Reparación caldera', amount: 200, payment_method: 'transfer', recorded_by: user.id },
    { tenant_id: tenant.id, property_id: p1.id, type: 'income', category: 'restaurant', description: 'Cena grupo 8 personas', amount: 120, payment_method: 'cash', recorded_by: user.id },
    { tenant_id: tenant.id, property_id: p2.id, type: 'income', category: 'accommodation', description: 'Anticipo reserva Suite 201', amount: 100, payment_method: 'transfer', recorded_by: user.id },
    { tenant_id: tenant.id, property_id: p1.id, type: 'expense', category: 'restaurant', description: 'Compra alimentos desayunos', amount: 85.30, payment_method: 'card', recorded_by: user.id },
  ];
  await supabase.from('financial_records').insert(financialRecords);
  console.log(`✅ ${financialRecords.length} movimientos económicos creados`);

  console.log('\n🎉 Demo data seeded!');
  console.log('📧 admin@yamiops.com / admin123');
}

seedDemo().catch(console.error);
