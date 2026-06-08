import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { initDB, exec, prepare, saveDB } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

app.listen(PORT, async () => {
  await initDB();

  exec(`
    CREATE TABLE IF NOT EXISTS habitaciones_1600 (
      id INTEGER PRIMARY KEY AUTOINCREMENT, numero TEXT UNIQUE, tipo TEXT,
      capacidad INTEGER, precio_noche REAL DEFAULT 25, estado TEXT DEFAULT 'disponible'
    );
    CREATE TABLE IF NOT EXISTS habitaciones_2000 (
      id INTEGER PRIMARY KEY AUTOINCREMENT, numero TEXT UNIQUE, tipo TEXT DEFAULT 'privada',
      capacidad INTEGER DEFAULT 2, precio_noche REAL DEFAULT 45, estado TEXT DEFAULT 'disponible'
    );
    CREATE TABLE IF NOT EXISTS reservas (
      id INTEGER PRIMARY KEY AUTOINCREMENT, huesped_nombre TEXT, huesped_tel TEXT, huesped_email TEXT,
      habitacion_id INTEGER, tipo_habitacion TEXT, num_personas INTEGER DEFAULT 1,
      fecha_ingreso TEXT, fecha_salida TEXT, monto_total REAL, estado TEXT DEFAULT 'confirmada'
    );
    CREATE TABLE IF NOT EXISTS incidencias (
      id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT, descripcion TEXT,
      criticidad TEXT, estado TEXT DEFAULT 'abierta', fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS movimientos_economicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT, tipo TEXT, concepto TEXT, categoria TEXT,
      monto REAL, metodo_pago TEXT, fecha TEXT DEFAULT CURRENT_DATE
    );
    CREATE TABLE IF NOT EXISTS menus_diarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT, fecha TEXT UNIQUE,
      desayuno TEXT, comida TEXT, cena TEXT, opciones_especiales TEXT
    );
    CREATE TABLE IF NOT EXISTS limpieza_habitaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT, habitacion_id INTEGER, tipo_habitacion TEXT,
      responsable TEXT DEFAULT 'Lina', estado TEXT DEFAULT 'pendiente',
      observaciones TEXT, fecha_asignacion TEXT DEFAULT CURRENT_DATE, fecha_completado TEXT
    );
    CREATE TABLE IF NOT EXISTS facturas (
      id INTEGER PRIMARY KEY AUTOINCREMENT, numero_factura TEXT UNIQUE,
      huesped_nombre TEXT, reserva_id INTEGER, fecha_emision TEXT DEFAULT CURRENT_DATE,
      monto_total REAL, iva REAL DEFAULT 0, estado TEXT DEFAULT 'emitida'
    );
  `);

  // Seed data si la BD está vacía
  const count = prepare('SELECT COUNT(*) as total FROM habitaciones_1600').get();
  if (count.total === 0) {
    // Habitaciones Cota 1600
    const h1600 = [
      ['101','compartida',6],['102','compartida',6],['103','compartida',6],
      ['104','compartida',6],['105','compartida',4],['106','privada',2],
      ['107','privada',2],['108','privada',2],['109','privada',2],
      ['110','privada',2],['111','privada',2]
    ];
    for (const h of h1600) {
      prepare('INSERT INTO habitaciones_1600 (numero,tipo,capacidad) VALUES (?,?,?)').run(h);
    }

    // Habitaciones Cota 2000
    for (let i = 201; i <= 208; i++) {
      prepare('INSERT INTO habitaciones_2000 (numero,tipo,capacidad) VALUES (?,?,?)').run([String(i), 'privada', 2]);
    }

    // Incidencias de ejemplo
    const incidencias = [
      ['Ducha sin agua caliente', 'Habitación 103 reporta que no sale agua caliente', 'importante'],
      ['Bombilla fundida', 'Reemplazar bombilla en pasillo principal', 'menor'],
      ['Calefacción no funciona', 'La caldera del ala este no enciende', 'critica'],
      ['WiFi intermitente', 'Varios huéspedes reportan caídas de conexión', 'normal'],
      ['Puerta 208 no cierra bien', 'La cerradura está desajustada', 'normal']
    ];
    for (const inc of incidencias) {
      prepare('INSERT INTO incidencias (titulo,descripcion,criticidad) VALUES (?,?,?)').run(inc);
    }

    // Movimientos económicos de ejemplo
    const movs = [
      ['ingreso','Reserva 101 - 3 noches','alojamiento',150,'efectivo'],
      ['ingreso','Reserva 102 - 2 noches','alojamiento',100,'tarjeta'],
      ['gasto','Compra alimentos supermercado','restauracion',85.50,'efectivo'],
      ['ingreso','Cena especial - Grupo 8 pax','restauracion',120,'transferencia'],
      ['gasto','Mantenimiento caldera','servicios',200,'transferencia'],
      ['ingreso','Reserva 205 - 5 noches','alojamiento',350,'tarjeta'],
      ['gasto','Productos limpieza','suministros',45.30,'efectivo']
    ];
    for (const m of movs) {
      prepare('INSERT INTO movimientos_economicos (tipo,concepto,categoria,monto,metodo_pago) VALUES (?,?,?,?,?)').run(m);
    }

    // Menú de hoy
    const hoy = new Date().toISOString().split('T')[0];
    prepare('INSERT INTO menus_diarios (fecha,desayuno,comida,cena,opciones_especiales) VALUES (?,?,?,?,?)').run([
      hoy,
      'Café, leche, tostadas con tomate, cereales, zumo naranja',
      'Menú: Lentejas estofadas con verduras. Segundo: Pollo asado con patatas. Postre: Flan',
      'Sopa de verduras, tortilla española, ensalada mixta, fruta',
      'Opción vegana disponible. Alergias: consultar con cocina'
    ]);

    // Reservas activas
    const manana = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const pasadomanana = new Date(Date.now() + 172800000).toISOString().split('T')[0];
    prepare(`INSERT INTO reservas (huesped_nombre,huesped_tel,huesped_email,habitacion_id,tipo_habitacion,num_personas,fecha_ingreso,fecha_salida,estado)
      VALUES (?,?,?,?,?,?,?,?,?)`).run(['Carlos Martínez','+376 111 222','carlos@test.com','101','1600',2,manana,pasadomanana,'confirmada']);
    prepare(`INSERT INTO reservas (huesped_nombre,huesped_tel,habitacion_id,tipo_habitacion,num_personas,fecha_ingreso,fecha_salida,estado)
      VALUES (?,?,?,?,?,?,?,?)`).run(['Ana López','+376 333 444','106','1600',1,manana,pasadomanana,'confirmada']);

    saveDB();
    console.log('✅ Datos iniciales insertados');
  }

  console.log(`✅ YAMI OPS Backend en http://localhost:${PORT}`);
});

// ===== ALBERGUE COTA 1600 =====
app.get('/api/cota1600/habitaciones', (req, res) => {
  res.json(prepare('SELECT * FROM habitaciones_1600').all());
});
app.post('/api/cota1600/habitaciones', (req, res) => {
  const { numero, tipo, capacidad, precio_noche } = req.body;
  prepare('INSERT INTO habitaciones_1600 (numero,tipo,capacidad,precio_noche) VALUES (?,?,?,?)').run([numero, tipo, capacidad || 6, precio_noche || 25]);
  saveDB(); res.json({ success: true });
});

// ===== ALBERGUE COTA 2000 =====
app.get('/api/cota2000/habitaciones', (req, res) => {
  res.json(prepare('SELECT * FROM habitaciones_2000').all());
});
app.post('/api/cota2000/habitaciones', (req, res) => {
  const { numero, tipo, capacidad, precio_noche } = req.body;
  prepare('INSERT INTO habitaciones_2000 (numero,tipo,capacidad,precio_noche) VALUES (?,?,?,?)').run([numero, tipo || 'privada', capacidad || 2, precio_noche || 45]);
  saveDB(); res.json({ success: true });
});

// ===== CAMBIAR ESTADO HABITACIÓN =====
app.put('/api/habitaciones/:tipo/:id/estado', (req, res) => {
  const tabla = req.params.tipo === '1600' ? 'habitaciones_1600' : 'habitaciones_2000';
  prepare(`UPDATE ${tabla} SET estado = ? WHERE id = ?`).run([req.body.estado, req.params.id]);
  saveDB(); res.json({ success: true });
});

// ===== RESERVAS =====
app.get('/api/reservas', (req, res) => {
  res.json(prepare('SELECT * FROM reservas ORDER BY fecha_ingreso DESC').all());
});
app.get('/api/reservas/activas', (req, res) => {
  res.json(prepare("SELECT * FROM reservas WHERE estado IN ('confirmada','checkin') ORDER BY fecha_ingreso ASC").all());
});

// ===== CHECK-IN =====
app.post('/api/checkin', (req, res) => {
  const { huesped_nombre, huesped_tel, huesped_email, habitacion_id, tipo_habitacion, num_personas, fecha_ingreso, fecha_salida, monto_total } = req.body;
  const tabla = tipo_habitacion === '2000' ? 'habitaciones_2000' : 'habitaciones_1600';
  prepare(`INSERT INTO reservas (huesped_nombre,huesped_tel,huesped_email,habitacion_id,tipo_habitacion,num_personas,fecha_ingreso,fecha_salida,monto_total,estado)
    VALUES (?,?,?,?,?,?,?,?,?,'checkin')`).run([huesped_nombre, huesped_tel || '', huesped_email || '', habitacion_id, tipo_habitacion || '1600', num_personas || 1, fecha_ingreso, fecha_salida, monto_total || 0]);
  prepare(`UPDATE ${tabla} SET estado = 'ocupado' WHERE id = ?`).run([habitacion_id]);
  prepare('INSERT INTO movimientos_economicos (tipo,concepto,categoria,monto) VALUES (?,?,?,?)').run(['ingreso', `Check-in ${huesped_nombre} - Hab ${habitacion_id}`, 'alojamiento', monto_total || 0]);
  saveDB(); res.json({ success: true });
});

// ===== CHECK-OUT =====
app.post('/api/checkout/:id', (req, res) => {
  const reserva = prepare('SELECT * FROM reservas WHERE id = ?').get([req.params.id]);
  if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });
  const tabla = reserva.tipo_habitacion === '2000' ? 'habitaciones_2000' : 'habitaciones_1600';
  prepare(`UPDATE ${tabla} SET estado = 'limpieza' WHERE id = ?`).run([reserva.habitacion_id]);
  prepare("UPDATE reservas SET estado = 'checkout' WHERE id = ?").run([req.params.id]);
  prepare(`INSERT INTO limpieza_habitaciones (habitacion_id,tipo_habitacion,estado) VALUES (?,?,'pendiente')`).run([reserva.habitacion_id, reserva.tipo_habitacion]);
  saveDB(); res.json({ success: true });
});

// ===== RESTAURACIÓN - MENÚS =====
app.get('/api/restauracion/menus', (req, res) => {
  res.json(prepare('SELECT * FROM menus_diarios ORDER BY fecha DESC').all());
});
app.get('/api/restauracion/menus/hoy', (req, res) => {
  const hoy = new Date().toISOString().split('T')[0];
  const menu = prepare('SELECT * FROM menus_diarios WHERE fecha = ?').get([hoy]);
  res.json(menu || { fecha: hoy, desayuno: 'No definido', comida: 'No definido', cena: 'No definido' });
});
app.post('/api/restauracion/menus', (req, res) => {
  const { fecha, desayuno, comida, cena, opciones_especiales } = req.body;
  prepare('INSERT OR REPLACE INTO menus_diarios (fecha,desayuno,comida,cena,opciones_especiales) VALUES (?,?,?,?,?)')
    .run([fecha, desayuno, comida, cena, opciones_especiales || '']);
  saveDB(); res.json({ success: true });
});
app.delete('/api/restauracion/menus/:id', (req, res) => {
  prepare('DELETE FROM menus_diarios WHERE id = ?').run([req.params.id]);
  saveDB(); res.json({ success: true });
});

// ===== LIMPIEZA =====
app.get('/api/limpieza/pendientes', (req, res) => {
  const pendientes = prepare("SELECT l.*, COALESCE(h1600.numero, h2000.numero) as numero_habitacion FROM limpieza_habitaciones l LEFT JOIN habitaciones_1600 h1600 ON l.habitacion_id = h1600.id AND l.tipo_habitacion = '1600' LEFT JOIN habitaciones_2000 h2000 ON l.habitacion_id = h2000.id AND l.tipo_habitacion = '2000' WHERE l.estado IN ('pendiente','en_proceso') ORDER BY l.fecha_asignacion ASC").all();
  res.json(pendientes);
});
app.get('/api/limpieza/completadas', (req, res) => {
  res.json(prepare("SELECT * FROM limpieza_habitaciones WHERE estado = 'completado' ORDER BY fecha_completado DESC LIMIT 20").all());
});
app.put('/api/limpieza/:id/iniciar', (req, res) => {
  prepare("UPDATE limpieza_habitaciones SET estado = 'en_proceso' WHERE id = ?").run([req.params.id]);
  saveDB(); res.json({ success: true });
});
app.put('/api/limpieza/:id/completar', (req, res) => {
  const hoy = new Date().toISOString().split('T')[0];
  const item = prepare('SELECT * FROM limpieza_habitaciones WHERE id = ?').get([req.params.id]);
  if (item) {
    const tabla = item.tipo_habitacion === '2000' ? 'habitaciones_2000' : 'habitaciones_1600';
    prepare(`UPDATE ${tabla} SET estado = 'disponible' WHERE id = ?`).run([item.habitacion_id]);
  }
  prepare("UPDATE limpieza_habitaciones SET estado = 'completado', fecha_completado = ? WHERE id = ?").run([hoy, req.params.id]);
  saveDB(); res.json({ success: true, mensaje: 'Limpieza registrada por Lina' });
});

// ===== INCIDENCIAS =====
app.get('/api/incidencias', (req, res) => {
  res.json(prepare('SELECT * FROM incidencias ORDER BY CASE criticidad WHEN "critica" THEN 0 WHEN "importante" THEN 1 WHEN "normal" THEN 2 ELSE 3 END, fecha DESC').all());
});
app.post('/api/incidencias', (req, res) => {
  const { titulo, descripcion, criticidad } = req.body;
  prepare('INSERT INTO incidencias (titulo,descripcion,criticidad) VALUES (?,?,?)').run([titulo, descripcion, criticidad || 'normal']);
  saveDB(); res.json({ success: true });
});
app.put('/api/incidencias/:id/estado', (req, res) => {
  prepare('UPDATE incidencias SET estado = ? WHERE id = ?').run([req.body.estado, req.params.id]);
  saveDB(); res.json({ success: true });
});

// ===== ECONÓMICO =====
app.get('/api/economico/movimientos', (req, res) => {
  res.json(prepare('SELECT * FROM movimientos_economicos ORDER BY fecha DESC').all());
});
app.post('/api/economico/movimientos', (req, res) => {
  const { tipo, concepto, categoria, monto, metodo_pago } = req.body;
  prepare('INSERT INTO movimientos_economicos (tipo,concepto,categoria,monto,metodo_pago) VALUES (?,?,?,?,?)')
    .run([tipo, concepto, categoria || '', parseFloat(monto), metodo_pago || 'efectivo']);
  saveDB(); res.json({ success: true });
});
app.get('/api/economico/resumen', (req, res) => {
  const ingresos = prepare('SELECT SUM(monto) as total FROM movimientos_economicos WHERE tipo = "ingreso"').get();
  const gastos = prepare('SELECT SUM(monto) as total FROM movimientos_economicos WHERE tipo = "gasto"').get();
  const porCategoria = prepare('SELECT categoria, SUM(monto) as total FROM movimientos_economicos GROUP BY categoria').all();
  res.json({
    ingresos: ingresos?.total || 0,
    gastos: gastos?.total || 0,
    balance: (ingresos?.total || 0) - (gastos?.total || 0),
    porCategoria
  });
});
app.delete('/api/economico/movimientos/:id', (req, res) => {
  prepare('DELETE FROM movimientos_economicos WHERE id = ?').run([req.params.id]);
  saveDB(); res.json({ success: true });
});

// ===== FACTURAS =====
app.get('/api/facturas', (req, res) => {
  res.json(prepare('SELECT * FROM facturas ORDER BY fecha_emision DESC').all());
});
app.post('/api/facturas', (req, res) => {
  const { huesped_nombre, reserva_id, monto_total, iva } = req.body;
  const numFactura = `FAC-${Date.now()}`;
  prepare('INSERT INTO facturas (numero_factura,huesped_nombre,reserva_id,monto_total,iva) VALUES (?,?,?,?,?)')
    .run([numFactura, huesped_nombre, reserva_id || null, parseFloat(monto_total), parseFloat(iva || 0)]);
  saveDB(); res.json({ success: true, numero_factura: numFactura });
});

// ===== ASISTENTE IA =====
app.post('/api/ia/asistente', async (req, res) => {
  const { mensaje } = req.body;
  const msg = mensaje.toLowerCase();
  let respuesta = '';
  if (msg.includes('habitación') || msg.includes('libre') || msg.includes('disponible')) {
    const d1600 = prepare('SELECT COUNT(*) as t FROM habitaciones_1600 WHERE estado = "disponible"').get();
    const d2000 = prepare('SELECT COUNT(*) as t FROM habitaciones_2000 WHERE estado = "disponible"').get();
    respuesta = `📊 Hay ${d1600.t} habitaciones disponibles en Cota 1600 y ${d2000.t} en Cota 2000.`;
  } else if (msg.includes('ingreso') || msg.includes('factura') || msg.includes('venta')) {
    const t = prepare('SELECT SUM(monto) as t FROM movimientos_economicos WHERE tipo = "ingreso"').get();
    respuesta = `💰 Ingresos totales: ${t.t || 0}€.`;
  } else if (msg.includes('gasto') || msg.includes('gaste')) {
    const t = prepare('SELECT SUM(monto) as t FROM movimientos_economicos WHERE tipo = "gasto"').get();
    respuesta = `💸 Gastos totales: ${t.t || 0}€.`;
  } else if (msg.includes('incidencia') || msg.includes('problema')) {
    const a = prepare("SELECT COUNT(*) as t FROM incidencias WHERE estado != 'resuelta'").get();
    respuesta = `⚠️ ${a.t} incidencias abiertas.`;
  } else if (msg.includes('ocupación') || msg.includes('ocupado') || msg.includes('lleno')) {
    const o = prepare("SELECT COUNT(*) as t FROM habitaciones_1600 WHERE estado = 'ocupado'").get();
    const d = prepare("SELECT COUNT(*) as t FROM habitaciones_1600 WHERE estado = 'disponible'").get();
    const total = o.t + d.t;
    respuesta = `📈 Ocupación: ${total > 0 ? Math.round(o.t / total * 100) : 0}% (${o.t} ocupadas, ${d.t} libres)`;
  } else if (msg.includes('menú') || msg.includes('comida') || msg.includes('cena')) {
    const hoy = new Date().toISOString().split('T')[0];
    const menu = prepare('SELECT * FROM menus_diarios WHERE fecha = ?').get([hoy]);
    if (menu) {
      respuesta = `🍽️ Menú de hoy: Desayuno: ${menu.desayuno}. Comida: ${menu.comida}. Cena: ${menu.cena}.`;
    } else {
      respuesta = '🍽️ No hay menú definido para hoy.';
    }
  } else if (msg.includes('hola') || msg.includes('buenos días') || msg.includes('buenas')) {
    respuesta = '👋 ¡Hola! Soy el asistente YAMI. Puedes preguntarme sobre habitaciones, ocupación, ingresos, incidencias, menús y más.';
  } else {
    respuesta = `🤖 No entendí tu consulta. Puedes preguntarme sobre: habitaciones disponibles, ingresos, gastos, incidencias, ocupación o el menú del día.`;
  }
  res.json({ respuesta, timestamp: new Date().toISOString() });
});

// ===== DASHBOARD =====
app.get('/api/dashboard/resumen', (req, res) => {
  const o1600 = prepare("SELECT COUNT(*) as t FROM habitaciones_1600 WHERE estado = 'ocupado'").get();
  const d1600 = prepare("SELECT COUNT(*) as t FROM habitaciones_1600 WHERE estado = 'disponible'").get();
  const o2000 = prepare("SELECT COUNT(*) as t FROM habitaciones_2000 WHERE estado = 'ocupado'").get();
  const d2000 = prepare("SELECT COUNT(*) as t FROM habitaciones_2000 WHERE estado = 'disponible'").get();
  const inc = prepare("SELECT COUNT(*) as t FROM incidencias WHERE estado != 'resuelta'").get();
  const ihoy = prepare("SELECT SUM(monto) as t FROM movimientos_economicos WHERE tipo = 'ingreso' AND fecha = date('now')").get();
  const ghoy = prepare("SELECT SUM(monto) as t FROM movimientos_economicos WHERE tipo = 'gasto' AND fecha = date('now')").get();
  const rActivas = prepare("SELECT COUNT(*) as t FROM reservas WHERE estado = 'checkin'").get();
  const pConfirmadas = prepare("SELECT COUNT(*) as t FROM reservas WHERE estado = 'confirmada'").get();
  const limpPend = prepare("SELECT COUNT(*) as t FROM limpieza_habitaciones WHERE estado IN ('pendiente','en_proceso')").get();
  const totalHab = o1600.t + d1600.t + o2000.t + d2000.t;
  const ocupadas = o1600.t + o2000.t;
  const disponibles = d1600.t + d2000.t;

  res.json({
    habitaciones: {
      total: totalHab, ocupadas, disponibles,
      ocupacion: totalHab > 0 ? (ocupadas / totalHab * 100).toFixed(1) : '0.0',
      cota1600: { ocupadas: o1600.t, disponibles: d1600.t },
      cota2000: { ocupadas: o2000.t, disponibles: d2000.t }
    },
    incidencias: { abiertas: inc.t },
    economico: { ingresosHoy: ihoy?.t || 0, gastosHoy: ghoy?.t || 0 },
    reservas: { activas: rActivas.t, confirmadas: pConfirmadas.t },
    limpieza: { pendientes: limpPend.t }
  });
});
