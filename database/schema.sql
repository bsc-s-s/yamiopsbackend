-- ============================================
-- YAMI OPS - ESQUEMA COMPLETO DE BASE DE DATOS
-- ============================================

-- Habitaciones Cota 1600 (Albergue)
CREATE TABLE habitaciones_1600 (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(10) NOT NULL UNIQUE,
    tipo VARCHAR(50) DEFAULT 'compartida',
    capacidad INT DEFAULT 6,
    precio_noche DECIMAL(10,2) DEFAULT 25.00,
    estado VARCHAR(20) DEFAULT 'disponible'
);

-- Habitaciones Cota 2000 (La Borda)
CREATE TABLE habitaciones_2000 (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(10) NOT NULL UNIQUE,
    tipo VARCHAR(50) DEFAULT 'privada',
    capacidad INT DEFAULT 2,
    precio_noche DECIMAL(10,2) DEFAULT 45.00,
    estado VARCHAR(20) DEFAULT 'disponible'
);

-- Huéspedes/Clientes
CREATE TABLE huespedes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    documento VARCHAR(50),
    nacionalidad VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservas y ocupaciones
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    huesped_id INT REFERENCES huespedes(id),
    habitacion_id INT,
    tipo_habitacion VARCHAR(20),
    fecha_ingreso DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    num_personas INT DEFAULT 1,
    monto_total DECIMAL(10,2),
    estado VARCHAR(20) DEFAULT 'confirmada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menús de restauración
CREATE TABLE menus_diarios (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    desayuno TEXT,
    comida TEXT,
    cena TEXT,
    opciones_especiales TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Control de limpieza
CREATE TABLE limpieza_habitaciones (
    id SERIAL PRIMARY KEY,
    habitacion_id INT NOT NULL,
    tipo_habitacion VARCHAR(20),
    responsable VARCHAR(100) DEFAULT 'Lina',
    estado VARCHAR(20) DEFAULT 'pendiente',
    observaciones TEXT,
    fecha_asignacion DATE DEFAULT CURRENT_DATE,
    fecha_completado DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Incidencias y alertas
CREATE TABLE incidencias (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    criticidad VARCHAR(20) DEFAULT 'normal',
    estado VARCHAR(20) DEFAULT 'abierta',
    asignado_a VARCHAR(100),
    fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP
);

-- Control económico ROAT
CREATE TABLE movimientos_economicos (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL,
    concepto VARCHAR(200) NOT NULL,
    categoria VARCHAR(50),
    monto DECIMAL(10,2) NOT NULL,
    fecha DATE DEFAULT CURRENT_DATE,
    metodo_pago VARCHAR(30),
    referencia VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facturas ROAT
CREATE TABLE facturas_roat (
    id SERIAL PRIMARY KEY,
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    huesped_id INT REFERENCES huespedes(id),
    reserva_id INT REFERENCES reservas(id),
    fecha_emision DATE DEFAULT CURRENT_DATE,
    monto_total DECIMAL(10,2) NOT NULL,
    iva DECIMAL(10,2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'emitida',
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configuración del sistema
CREATE TABLE configuracion (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descripcion TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos iniciales
INSERT INTO habitaciones_1600 (numero, tipo, capacidad) VALUES
    ('101', 'compartida', 6), ('102', 'compartida', 6), ('103', 'compartida', 6),
    ('104', 'compartida', 6), ('105', 'compartida', 4), ('106', 'privada', 2),
    ('107', 'privada', 2), ('108', 'privada', 2), ('109', 'privada', 2),
    ('110', 'privada', 2), ('111', 'privada', 2);

INSERT INTO habitaciones_2000 (numero, tipo, capacidad) VALUES
    ('201', 'privada', 2), ('202', 'privada', 2), ('203', 'privada', 2),
    ('204', 'privada', 2), ('205', 'privada', 2), ('206', 'privada', 2),
    ('207', 'privada', 2), ('208', 'privada', 2);

INSERT INTO configuracion (clave, valor, descripcion) VALUES
    ('empresa_nombre', 'YAMI OPS - Cota 1600', 'Nombre del establecimiento'),
    ('roat_numero_registro', 'AND-2024-001', 'Número de registro ROAT'),
    ('contacto_emergencia', '+376 123 456', 'Teléfono de emergencias'),
    ('horario_checkin', '14:00', 'Hora de check-in estándar'),
    ('horario_checkout', '11:00', 'Hora de check-out estándar');

-- Índices para mejorar rendimiento
CREATE INDEX idx_reservas_fechas ON reservas(fecha_ingreso, fecha_salida);
CREATE INDEX idx_incidencias_estado ON incidencias(estado);
CREATE INDEX idx_movimientos_fecha ON movimientos_economicos(fecha);
