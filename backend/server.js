import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { supabase, initDB, initSchema } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.set('trust proxy', 1);
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

const hoy = () => new Date().toISOString().split('T')[0];

// ===== SEED DATA =====
async function seedData() {
  const { error } = await supabase.from('habitaciones_1600').insert([
    { numero: '101', tipo: 'compartida', capacidad: 6 },
    { numero: '102', tipo: 'compartida', capacidad: 6 },
    { numero: '103', tipo: 'compartida', capacidad: 6 },
    { numero: '104', tipo: 'compartida', capacidad: 6 },
    { numero: '105', tipo: 'compartida', capacidad: 4 },
    { numero: '106', tipo: 'privada', capacidad: 2 },
    { numero: '107', tipo: 'privada', capacidad: 2 },
    { numero: '108', tipo: 'privada', capacidad: 2 },
    { numero: '109', tipo: 'privada', capacidad: 2 },
    { numero: '110', tipo: 'privada', capacidad: 2 },
    { numero: '111', tipo: 'privada', capacidad: 2 }
  ]);
  if (error && error.code === '23505') {
    console.log('⚠️ Seed saltado (datos ya existen)');
    return;
  }
  const h2000 = [];
  for (let i = 201; i <= 208; i++) h2000.push({ numero: String(i) });
  await supabase.from('habitaciones_2000').insert(h2000);
  await supabase.from('incidencias').insert([
    { titulo: 'Ducha sin agua caliente', descripcion: 'Hab 103 no sale agua caliente', criticidad: 'importante' },
    { titulo: 'Bombilla fundida', descripcion: 'Pasillo principal', criticidad: 'menor' },
    { titulo: 'Calefacción no funciona', descripcion: 'Caldera ala este no enciende', criticidad: 'critica' },
    { titulo: 'WiFi intermitente', descripcion: 'Varios huéspedes reportan caídas', criticidad: 'normal' },
    { titulo: 'Puerta 208 no cierra', descripcion: 'Cerradura desajustada', criticidad: 'normal' }
  ]);
  await supabase.from('movimientos_economicos').insert([
    { tipo: 'ingreso', concepto: 'Reserva 101 - 3 noches', categoria: 'alojamiento', monto: 150, metodo_pago: 'efectivo' },
    { tipo: 'ingreso', concepto: 'Reserva 102 - 2 noches', categoria: 'alojamiento', monto: 100, metodo_pago: 'tarjeta' },
    { tipo: 'gasto', concepto: 'Compra alimentos', categoria: 'restauracion', monto: 85.50, metodo_pago: 'efectivo' },
    { tipo: 'ingreso', concepto: 'Cena grupo 8 pax', categoria: 'restauracion', monto: 120, metodo_pago: 'transferencia' },
    { tipo: 'gasto', concepto: 'Mantenimiento caldera', categoria: 'servicios', monto: 200, metodo_pago: 'transferencia' },
    { tipo: 'ingreso', concepto: 'Reserva 205 - 5 noches', categoria: 'alojamiento', monto: 350, metodo_pago: 'tarjeta' },
    { tipo: 'gasto', concepto: 'Productos limpieza', categoria: 'suministros', monto: 45.30, metodo_pago: 'efectivo' }
  ]);
  await supabase.from('menus_diarios').insert([{
    fecha: hoy(), desayuno: 'Café, leche, tostadas, cereales',
    comida: 'Lentejas estofadas + Pollo asado', cena: 'Sopa de verduras + Tortilla'
  }]);
  console.log('✅ Datos iniciales insertados');
}

// ===== ENDPOINT MANUAL PARA CARGAR DATOS =====
app.post('/api/seed', async (req, res) => {
  try {
    await seedData();
    res.json({ success: true, mensaje: 'Datos de ejemplo cargados correctamente' });
  } catch (e) {
    res.status(500).json({ success: false, mensaje: e.message });
  }
});

app.listen(PORT, async () => {
  await initDB();
  initSchema();
  try {
    await seedData();
  } catch (e) {
    console.log('⚠️ Seed inicial: ' + e.message);
  }
  console.log(`✅ YAMI OPS Backend en http://localhost:${PORT}`);
});

// ===== ALBERGUE COTA 1600 =====
app.get('/api/cota1600/habitaciones', async (req, res) => {
  const { data } = await supabase.from('habitaciones_1600').select('*').order('id');
  res.json(data || []);
});
app.post('/api/cota1600/habitaciones', async (req, res) => {
  const { numero, tipo, capacidad, precio_noche } = req.body;
  await supabase.from('habitaciones_1600').insert([{ numero, tipo, capacidad: capacidad || 6, precio_noche: precio_noche || 25 }]);
  res.json({ success: true });
});

// ===== ALBERGUE COTA 2000 =====
app.get('/api/cota2000/habitaciones', async (req, res) => {
  const { data } = await supabase.from('habitaciones_2000').select('*').order('id');
  res.json(data || []);
});
app.post('/api/cota2000/habitaciones', async (req, res) => {
  const { numero, tipo, capacidad, precio_noche } = req.body;
  await supabase.from('habitaciones_2000').insert([{ numero, tipo: tipo || 'privada', capacidad: capacidad || 2, precio_noche: precio_noche || 45 }]);
  res.json({ success: true });
});

// ===== CAMBIAR ESTADO =====
app.put('/api/habitaciones/:tipo/:id/estado', async (req, res) => {
  const tabla = req.params.tipo === '1600' ? 'habitaciones_1600' : 'habitaciones_2000';
  await supabase.from(tabla).update({ estado: req.body.estado }).eq('id', req.params.id);
  res.json({ success: true });
});

// ===== RESERVAS =====
app.get('/api/reservas', async (req, res) => {
  const { data } = await supabase.from('reservas').select('*').order('fecha_ingreso', { ascending: false });
  res.json(data || []);
});
app.get('/api/reservas/activas', async (req, res) => {
  const { data } = await supabase.from('reservas').select('*').in('estado', ['confirmada', 'checkin']).order('fecha_ingreso');
  res.json(data || []);
});

// ===== CHECK-IN =====
app.post('/api/checkin', async (req, res) => {
  const { huesped_nombre, huesped_tel, huesped_email, habitacion_id, tipo_habitacion, num_personas, fecha_ingreso, fecha_salida, monto_total } = req.body;
  const tabla = tipo_habitacion === '2000' ? 'habitaciones_2000' : 'habitaciones_1600';
  await supabase.from('reservas').insert([{
    huesped_nombre, huesped_tel: huesped_tel || '', huesped_email: huesped_email || '',
    habitacion_id, tipo_habitacion: tipo_habitacion || '1600', num_personas: num_personas || 1,
    fecha_ingreso, fecha_salida, monto_total: monto_total || 0, estado: 'checkin'
  }]);
  await supabase.from(tabla).update({ estado: 'ocupado' }).eq('id', habitacion_id);
  await supabase.from('movimientos_economicos').insert([{
    tipo: 'ingreso', concepto: `Check-in ${huesped_nombre} - Hab ${habitacion_id}`,
    categoria: 'alojamiento', monto: monto_total || 0
  }]);
  res.json({ success: true });
});

// ===== CHECK-OUT =====
app.post('/api/checkout/:id', async (req, res) => {
  const { data: reserva } = await supabase.from('reservas').select('*').eq('id', req.params.id).single();
  if (!reserva) return res.status(404).json({ error: 'No encontrada' });
  const tabla = reserva.tipo_habitacion === '2000' ? 'habitaciones_2000' : 'habitaciones_1600';
  await supabase.from(tabla).update({ estado: 'limpieza' }).eq('id', reserva.habitacion_id);
  await supabase.from('reservas').update({ estado: 'checkout' }).eq('id', req.params.id);
  await supabase.from('limpieza_habitaciones').insert([{
    habitacion_id: reserva.habitacion_id, tipo_habitacion: reserva.tipo_habitacion, estado: 'pendiente'
  }]);
  res.json({ success: true });
});

// ===== RESTAURACIÓN =====
app.get('/api/restauracion/menus', async (req, res) => {
  const { data } = await supabase.from('menus_diarios').select('*').order('fecha', { ascending: false });
  res.json(data || []);
});
app.get('/api/restauracion/menus/hoy', async (req, res) => {
  const { data } = await supabase.from('menus_diarios').select('*').eq('fecha', hoy()).maybeSingle();
  res.json(data || { fecha: hoy(), desayuno: 'No definido', comida: 'No definido', cena: 'No definido' });
});
app.post('/api/restauracion/menus', async (req, res) => {
  const { fecha, desayuno, comida, cena, opciones_especiales } = req.body;
  await supabase.from('menus_diarios').upsert([{
    fecha, desayuno, comida, cena, opciones_especiales: opciones_especiales || ''
  }], { onConflict: 'fecha' });
  res.json({ success: true });
});
app.delete('/api/restauracion/menus/:id', async (req, res) => {
  await supabase.from('menus_diarios').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// ===== LIMPIEZA =====
app.get('/api/limpieza/pendientes', async (req, res) => {
  const { data: pendientes } = await supabase.from('limpieza_habitaciones')
    .select('*').in('estado', ['pendiente', 'en_proceso']).order('fecha_asignacion');
  for (const p of pendientes || []) {
    const tabla = p.tipo_habitacion === '2000' ? 'habitaciones_2000' : 'habitaciones_1600';
    const { data: hab } = await supabase.from(tabla).select('numero').eq('id', p.habitacion_id).single();
    p.numero_habitacion = hab?.numero;
  }
  res.json(pendientes || []);
});
app.get('/api/limpieza/completadas', async (req, res) => {
  const { data } = await supabase.from('limpieza_habitaciones').select('*')
    .eq('estado', 'completado').order('fecha_completado', { ascending: false }).limit(20);
  res.json(data || []);
});
app.put('/api/limpieza/:id/iniciar', async (req, res) => {
  await supabase.from('limpieza_habitaciones').update({ estado: 'en_proceso' }).eq('id', req.params.id);
  res.json({ success: true });
});
app.put('/api/limpieza/:id/completar', async (req, res) => {
  const { data: item } = await supabase.from('limpieza_habitaciones').select('*').eq('id', req.params.id).single();
  if (item) {
    const tabla = item.tipo_habitacion === '2000' ? 'habitaciones_2000' : 'habitaciones_1600';
    await supabase.from(tabla).update({ estado: 'disponible' }).eq('id', item.habitacion_id);
  }
  await supabase.from('limpieza_habitaciones').update({ estado: 'completado', fecha_completado: hoy() }).eq('id', req.params.id);
  res.json({ success: true, mensaje: 'Limpieza registrada por Lina' });
});

// ===== INCIDENCIAS =====
app.get('/api/incidencias', async (req, res) => {
  const { data } = await supabase.from('incidencias').select('*').order('criticidad').order('fecha', { ascending: false });
  res.json(data || []);
});
app.post('/api/incidencias', async (req, res) => {
  const { titulo, descripcion, criticidad } = req.body;
  await supabase.from('incidencias').insert([{ titulo, descripcion, criticidad: criticidad || 'normal' }]);
  res.json({ success: true });
});
app.put('/api/incidencias/:id/estado', async (req, res) => {
  await supabase.from('incidencias').update({ estado: req.body.estado }).eq('id', req.params.id);
  res.json({ success: true });
});

// ===== ECONÓMICO =====
app.get('/api/economico/movimientos', async (req, res) => {
  const { data } = await supabase.from('movimientos_economicos').select('*').order('fecha', { ascending: false });
  res.json(data || []);
});
app.post('/api/economico/movimientos', async (req, res) => {
  const { tipo, concepto, categoria, monto, metodo_pago } = req.body;
  await supabase.from('movimientos_economicos').insert([{
    tipo, concepto, categoria: categoria || '', monto: parseFloat(monto), metodo_pago: metodo_pago || 'efectivo'
  }]);
  res.json({ success: true });
});
app.get('/api/economico/resumen', async (req, res) => {
  const { data: ingresos } = await supabase.from('movimientos_economicos').select('monto').eq('tipo', 'ingreso');
  const { data: gastos } = await supabase.from('movimientos_economicos').select('monto').eq('tipo', 'gasto');
  const totalIngresos = (ingresos || []).reduce((s, r) => s + parseFloat(r.monto), 0);
  const totalGastos = (gastos || []).reduce((s, r) => s + parseFloat(r.monto), 0);
  const { data: porCat } = await supabase.from('movimientos_economicos').select('categoria, monto');
  const porCategoria = (porCat || []).reduce((acc, r) => {
    const c = r.categoria || 'sin categoria';
    acc[c] = (acc[c] || 0) + parseFloat(r.monto);
    return acc;
  }, {});
  res.json({
    ingresos: totalIngresos, gastos: totalGastos,
    balance: totalIngresos - totalGastos,
    porCategoria: Object.entries(porCategoria).map(([c, t]) => ({ categoria: c, total: t }))
  });
});
app.delete('/api/economico/movimientos/:id', async (req, res) => {
  await supabase.from('movimientos_economicos').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// ===== FACTURAS =====
app.get('/api/facturas', async (req, res) => {
  const { data } = await supabase.from('facturas').select('*').order('fecha_emision', { ascending: false });
  res.json(data || []);
});
app.post('/api/facturas', async (req, res) => {
  const { huesped_nombre, reserva_id, monto_total, iva } = req.body;
  const numFactura = `FAC-${Date.now()}`;
  await supabase.from('facturas').insert([{
    numero_factura: numFactura, huesped_nombre, reserva_id: reserva_id || null,
    monto_total: parseFloat(monto_total), iva: parseFloat(iva || 0)
  }]);
  res.json({ success: true, numero_factura: numFactura });
});

// ===== ASISTENTE IA =====
app.post('/api/ia/asistente', async (req, res) => {
  const msg = (req.body.mensaje || '').toLowerCase();
  let respuesta = '';
  if (msg.includes('habitación') || msg.includes('libre') || msg.includes('disponible')) {
    const { count: d1600 } = await supabase.from('habitaciones_1600').select('*', { count: 'exact', head: true }).eq('estado', 'disponible');
    const { count: d2000 } = await supabase.from('habitaciones_2000').select('*', { count: 'exact', head: true }).eq('estado', 'disponible');
    respuesta = `📊 Hay ${d1600} en Cota 1600 y ${d2000} en Cota 2000.`;
  } else if (msg.includes('ingreso') || msg.includes('factura')) {
    const { data } = await supabase.from('movimientos_economicos').select('monto').eq('tipo', 'ingreso');
    const total = (data || []).reduce((s, r) => s + parseFloat(r.monto), 0);
    respuesta = `💰 Ingresos totales: ${total}€.`;
  } else if (msg.includes('gasto')) {
    const { data } = await supabase.from('movimientos_economicos').select('monto').eq('tipo', 'gasto');
    const total = (data || []).reduce((s, r) => s + parseFloat(r.monto), 0);
    respuesta = `💸 Gastos totales: ${total}€.`;
  } else if (msg.includes('incidencia') || msg.includes('problema')) {
    const { count } = await supabase.from('incidencias').select('*', { count: 'exact', head: true }).neq('estado', 'resuelta');
    respuesta = `⚠️ ${count} incidencias abiertas.`;
  } else if (msg.includes('ocupación') || msg.includes('ocupado')) {
    const { count: o } = await supabase.from('habitaciones_1600').select('*', { count: 'exact', head: true }).eq('estado', 'ocupado');
    const { count: d } = await supabase.from('habitaciones_1600').select('*', { count: 'exact', head: true }).eq('estado', 'disponible');
    respuesta = `📈 Ocupación: ${o + d > 0 ? Math.round(o / (o + d) * 100) : 0}% (${o} ocup, ${d} libres)`;
  } else if (msg.includes('menú') || msg.includes('comida') || msg.includes('cena')) {
    const { data } = await supabase.from('menus_diarios').select('*').eq('fecha', hoy()).maybeSingle();
    respuesta = data ? `🍽️ Hoy: ${data.desayuno} | ${data.comida} | ${data.cena}` : '🍽️ No hay menú hoy.';
  } else {
    respuesta = '🤖 Pregunta por: habitaciones libres, ingresos, gastos, incidencias, ocupación o menú.';
  }
  res.json({ respuesta, timestamp: new Date().toISOString() });
});

// ===== DASHBOARD =====
app.get('/api/dashboard/resumen', async (req, res) => {
  const [{ count: o1600 }, { count: d1600 }, { count: o2000 }, { count: d2000 },
    { count: inc }] = await Promise.all([
    supabase.from('habitaciones_1600').select('*', { count: 'exact', head: true }).eq('estado', 'ocupado'),
    supabase.from('habitaciones_1600').select('*', { count: 'exact', head: true }).eq('estado', 'disponible'),
    supabase.from('habitaciones_2000').select('*', { count: 'exact', head: true }).eq('estado', 'ocupado'),
    supabase.from('habitaciones_2000').select('*', { count: 'exact', head: true }).eq('estado', 'disponible'),
    supabase.from('incidencias').select('*', { count: 'exact', head: true }).neq('estado', 'resuelta')
  ]);

  const { data: movsHoy } = await supabase.from('movimientos_economicos').select('tipo, monto').eq('fecha', hoy());
  const ingresosHoy = (movsHoy || []).filter(m => m.tipo === 'ingreso').reduce((s, r) => s + parseFloat(r.monto), 0);
  const gastosHoy = (movsHoy || []).filter(m => m.tipo === 'gasto').reduce((s, r) => s + parseFloat(r.monto), 0);

  const [{ count: rAct }, { count: pConf }, { count: limp }] = await Promise.all([
    supabase.from('reservas').select('*', { count: 'exact', head: true }).eq('estado', 'checkin'),
    supabase.from('reservas').select('*', { count: 'exact', head: true }).eq('estado', 'confirmada'),
    supabase.from('limpieza_habitaciones').select('*', { count: 'exact', head: true }).in('estado', ['pendiente', 'en_proceso'])
  ]);

  const totalHab = o1600 + d1600 + o2000 + d2000;
  const ocupadas = o1600 + o2000;

  res.json({
    habitaciones: {
      total: totalHab, ocupadas, disponibles: d1600 + d2000,
      ocupacion: totalHab > 0 ? (ocupadas / totalHab * 100).toFixed(1) : '0.0',
      cota1600: { ocupadas: o1600, disponibles: d1600 },
      cota2000: { ocupadas: o2000, disponibles: d2000 }
    },
    incidencias: { abiertas: inc },
    economico: { ingresosHoy, gastosHoy },
    reservas: { activas: rAct, confirmadas: pConf },
    limpieza: { pendientes: limp }
  });
});
