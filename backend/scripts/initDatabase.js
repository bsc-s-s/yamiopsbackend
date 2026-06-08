import { initDB, exec, prepare, saveDB } from '../db.js';

console.log('🚀 Inicializando base de datos YAMI OPS...');

await initDB();

exec(`
    CREATE TABLE IF NOT EXISTS habitaciones_1600 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero TEXT UNIQUE,
        tipo TEXT,
        capacidad INTEGER,
        estado TEXT DEFAULT 'disponible'
    );
    CREATE TABLE IF NOT EXISTS reservas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        huesped_nombre TEXT,
        habitacion_id INTEGER,
        fecha_ingreso TEXT,
        fecha_salida TEXT,
        estado TEXT DEFAULT 'confirmada'
    );
    CREATE TABLE IF NOT EXISTS incidencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        descripcion TEXT,
        criticidad TEXT,
        estado TEXT DEFAULT 'abierta',
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS movimientos_economicos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT,
        concepto TEXT,
        monto REAL,
        fecha TEXT DEFAULT CURRENT_DATE
    );
`);

const count = prepare('SELECT COUNT(*) as total FROM habitaciones_1600').get();
if (count && count.total === 0) {
    const insert = prepare('INSERT INTO habitaciones_1600 (numero, tipo, capacidad) VALUES (?, ?, ?)');
    const habitaciones = [
        ['101', 'compartida', 6], ['102', 'compartida', 6], ['103', 'compartida', 6],
        ['104', 'compartida', 6], ['105', 'compartida', 4], ['106', 'privada', 2],
        ['107', 'privada', 2], ['108', 'privada', 2], ['109', 'privada', 2],
        ['110', 'privada', 2], ['111', 'privada', 2]
    ];
    for (const h of habitaciones) {
        insert.run(h);
    }
    saveDB();
    console.log(`✅ Insertadas ${habitaciones.length} habitaciones de muestra`);
}

console.log('✅ Base de datos inicializada correctamente');
