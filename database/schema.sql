-- YAMI OPS - ESQUEMA SUPABASE
-- Pega esto en Supabase SQL Editor y haz clic en RUN

CREATE TABLE IF NOT EXISTS habitaciones_1600 (
  id BIGSERIAL PRIMARY KEY,
  numero TEXT UNIQUE,
  tipo TEXT DEFAULT 'compartida',
  capacidad INTEGER DEFAULT 6,
  precio_noche DECIMAL(10,2) DEFAULT 25,
  estado TEXT DEFAULT 'disponible'
);

CREATE TABLE IF NOT EXISTS habitaciones_2000 (
  id BIGSERIAL PRIMARY KEY,
  numero TEXT UNIQUE,
  tipo TEXT DEFAULT 'privada',
  capacidad INTEGER DEFAULT 2,
  precio_noche DECIMAL(10,2) DEFAULT 45,
  estado TEXT DEFAULT 'disponible'
);

CREATE TABLE IF NOT EXISTS reservas (
  id BIGSERIAL PRIMARY KEY,
  huesped_nombre TEXT,
  huesped_tel TEXT,
  huesped_email TEXT,
  habitacion_id INTEGER,
  tipo_habitacion TEXT,
  num_personas INTEGER DEFAULT 1,
  fecha_ingreso DATE,
  fecha_salida DATE,
  monto_total DECIMAL(10,2),
  estado TEXT DEFAULT 'confirmada'
);

CREATE TABLE IF NOT EXISTS incidencias (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT,
  descripcion TEXT,
  criticidad TEXT DEFAULT 'normal',
  estado TEXT DEFAULT 'abierta',
  fecha TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movimientos_economicos (
  id BIGSERIAL PRIMARY KEY,
  tipo TEXT,
  concepto TEXT,
  categoria TEXT,
  monto DECIMAL(10,2),
  metodo_pago TEXT,
  fecha DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS menus_diarios (
  id BIGSERIAL PRIMARY KEY,
  fecha DATE UNIQUE,
  desayuno TEXT,
  comida TEXT,
  cena TEXT,
  opciones_especiales TEXT
);

CREATE TABLE IF NOT EXISTS limpieza_habitaciones (
  id BIGSERIAL PRIMARY KEY,
  habitacion_id INTEGER,
  tipo_habitacion TEXT,
  responsable TEXT DEFAULT 'Lina',
  estado TEXT DEFAULT 'pendiente',
  observaciones TEXT,
  fecha_asignacion DATE DEFAULT CURRENT_DATE,
  fecha_completado DATE
);

CREATE TABLE IF NOT EXISTS facturas (
  id BIGSERIAL PRIMARY KEY,
  numero_factura TEXT UNIQUE,
  huesped_nombre TEXT,
  reserva_id INTEGER,
  fecha_emision DATE DEFAULT CURRENT_DATE,
  monto_total DECIMAL(10,2),
  iva DECIMAL(10,2) DEFAULT 0,
  estado TEXT DEFAULT 'emitida'
);
