import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Home, Utensils, Sparkles, AlertTriangle, DollarSign,
  CheckSquare, Building2, CalendarCheck, LogOut, BedDouble,
  Sun, Coffee, Moon, Plus, Trash2, CheckCircle, Clock, Phone, Mail, Users
} from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

// ====== COMPONENTE DE CARGA ======
const Cargando = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

// ====== CARD DE ESTADÍSTICA ======
const StatCard = ({ label, value, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</div>
    <div className={`text-xl font-bold mt-1 ${color || 'text-gray-900 dark:text-gray-100'}`}>{value}</div>
  </div>
);

// ====== BOTÓN DE VOLVER ======
const VolverBtn = ({ onClick }) => (
  <button onClick={onClick} className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-full shadow-lg z-50 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
    ← Volver al panel
  </button>
);

// ====== HEADER MÓDULO ======
const HeaderModulo = ({ titulo, icono, color, onBack }) => (
  <div className={`${color} text-white p-4 flex items-center gap-3`}>
    <button onClick={onBack} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
      ←
    </button>
    {icono}
    <h2 className="text-lg font-bold">{titulo}</h2>
  </div>
);

// ====== MODAL ======
const Modal = ({ abierto, titulo, onClose, children }) => {
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">{titulo}</h3>
        {children}
      </div>
    </div>
  );
};

// ====== DASHBOARD ======
const Dashboard = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/dashboard/resumen`)
      .then(r => setData(r.data))
      .catch(() => setError(true));
  }, []);

  const modulos = [
    { id: 'albergue', nombre: 'Albergue', icono: Home, color: 'bg-blue-500' },
    { id: 'cota2000', nombre: 'Cota 2000', icono: Building2, color: 'bg-teal-500' },
    { id: 'restauracion', nombre: 'Restauración', icono: Utensils, color: 'bg-green-500' },
    { id: 'limpieza', nombre: 'Limpieza', icono: CheckSquare, color: 'bg-purple-500' },
    { id: 'reservas', nombre: 'Reservas', icono: CalendarCheck, color: 'bg-pink-500' },
    { id: 'incidencias', nombre: 'Incidencias', icono: AlertTriangle, color: 'bg-red-500' },
    { id: 'economico', nombre: 'Control Eco.', icono: DollarSign, color: 'bg-yellow-500' },
    { id: 'asistente', nombre: 'Asistente IA', icono: Sparkles, color: 'bg-indigo-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="text-center">
          <div className="text-5xl mb-2">🏔️</div>
          <h1 className="text-2xl font-bold">YAMI OPS</h1>
          <p className="text-blue-100 mt-1 text-sm">Sistema de gestión de albergue</p>
        </div>
        {error && <div className="mt-3 bg-red-500/30 text-center p-2 rounded-lg text-sm">⚠️ Error al conectar con el servidor</div>}
      </div>

      {data && (
        <div className="px-4 -mt-4">
          <div className="grid grid-cols-4 gap-2">
            <StatCard label="Ocupación" value={`${data.habitaciones.ocupacion}%`} color="text-blue-600" />
            <StatCard label="Ingresos hoy" value={`€${data.economico.ingresosHoy}`} color="text-green-600" />
            <StatCard label="Incidencias" value={data.incidencias.abiertas} color="text-red-600" />
            <StatCard label="Limpieza" value={data.limpieza.pendientes} color="text-purple-600" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <StatCard label="Check-in activos" value={data.reservas.activas} color="text-pink-600" />
            <StatCard label="Próximas" value={data.reservas.confirmadas} color="text-orange-600" />
          </div>
          <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
            <span>Cota 1600: {data.habitaciones.cota1600.ocupadas} ocup / {data.habitaciones.cota1600.disponibles} lib</span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span>Cota 2000: {data.habitaciones.cota2000.ocupadas} ocup / {data.habitaciones.cota2000.disponibles} lib</span>
          </div>
        </div>
      )}

      {!data && !error && <Cargando />}

      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">Módulos</h2>
        <div className="grid grid-cols-2 gap-3">
          {modulos.map(m => (
            <button key={m.id} onClick={() => onNavigate(m.id)}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-left border border-gray-200 dark:border-gray-700 active:scale-[0.98]">
              <div className={`${m.color} w-10 h-10 rounded-lg flex items-center justify-center text-white mb-2`}>
                <m.icono size={20} />
              </div>
              <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">{m.nombre}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ====== ALBERGUE COTA 1600 ======
const ModuloAlbergue = ({ onBack }) => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const cargar = () => { setCargando(true); axios.get(`${API_URL}/cota1600/habitaciones`).then(r => setHabitaciones(r.data)).finally(() => setCargando(false)); };
  useEffect(cargar, []);

  const cambiarEstado = (id, estado) => {
    axios.put(`${API_URL}/habitaciones/1600/${id}/estado`, { estado }).then(cargar);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <HeaderModulo titulo="Albergue Cota 1600" icono={<Home size={20} />} color="bg-blue-600" onBack={onBack} />
      <div className="p-4">
        <div className="flex gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Disponible</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Ocupado</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Limpieza</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Mantenimiento</span>
        </div>
        {cargando ? <Cargando /> : (
          <div className="grid grid-cols-2 gap-3">
            {habitaciones.map(h => {
              const colores = { disponible: 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700', ocupado: 'border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-700', limpieza: 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700' };
              return (
                <div key={h.id} className={`p-3 rounded-xl border ${colores[h.estado] || 'border-gray-200 bg-white dark:bg-gray-800'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-gray-100">Hab. {h.numero}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{h.tipo} · {h.capacidad} pers.</div>
                      <div className="text-xs text-gray-400">€{h.precio_noche}/noche</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      h.estado === 'disponible' ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' :
                      h.estado === 'ocupado' ? 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200' :
                      h.estado === 'limpieza' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                      'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}>{h.estado}</span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {h.estado !== 'disponible' && <button onClick={() => cambiarEstado(h.id, 'disponible')} className="flex-1 text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 py-1 rounded-lg hover:bg-green-200">Disponible</button>}
                    {h.estado !== 'ocupado' && <button onClick={() => cambiarEstado(h.id, 'ocupado')} className="flex-1 text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 py-1 rounded-lg hover:bg-orange-200">Ocupado</button>}
                    {h.estado !== 'limpieza' && <button onClick={() => cambiarEstado(h.id, 'limpieza')} className="flex-1 text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 py-1 rounded-lg hover:bg-yellow-200">Limpieza</button>}
                    {h.estado !== 'mantenimiento' && <button onClick={() => cambiarEstado(h.id, 'mantenimiento')} className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-1 rounded-lg hover:bg-gray-200">Mant.</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <VolverBtn onClick={onBack} />
    </div>
  );
};

// ====== COTA 2000 ======
const ModuloCota2000 = ({ onBack }) => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const cargar = () => { setCargando(true); axios.get(`${API_URL}/cota2000/habitaciones`).then(r => setHabitaciones(r.data)).finally(() => setCargando(false)); };
  useEffect(cargar, []);

  const cambiarEstado = (id, estado) => {
    axios.put(`${API_URL}/habitaciones/2000/${id}/estado`, { estado }).then(cargar);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <HeaderModulo titulo="Cota 2000 - La Borda" icono={<Building2 size={20} />} color="bg-teal-600" onBack={onBack} />
      <div className="p-4">
        {cargando ? <Cargando /> : (
          <div className="grid grid-cols-2 gap-3">
            {habitaciones.map(h => (
              <div key={h.id} className={`p-3 rounded-xl border ${
                h.estado === 'disponible' ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700' :
                h.estado === 'ocupado' ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-700' :
                'border-gray-200 bg-white dark:bg-gray-800'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-gray-900 dark:text-gray-100">Suite {h.numero}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{h.tipo} · {h.capacidad} pers.</div>
                    <div className="text-xs text-gray-400">€{h.precio_noche}/noche</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    h.estado === 'disponible' ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' :
                    h.estado === 'ocupado' ? 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200' : 'bg-gray-200 text-gray-600'
                  }`}>{h.estado}</span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {h.estado !== 'disponible' && <button onClick={() => cambiarEstado(h.id, 'disponible')} className="flex-1 text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 py-1 rounded-lg">Disponible</button>}
                  {h.estado !== 'ocupado' && <button onClick={() => cambiarEstado(h.id, 'ocupado')} className="flex-1 text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 py-1 rounded-lg">Ocupado</button>}
                  {h.estado !== 'limpieza' && <button onClick={() => cambiarEstado(h.id, 'limpieza')} className="flex-1 text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 py-1 rounded-lg">Limpieza</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <VolverBtn onClick={onBack} />
    </div>
  );
};

// ====== RESTAURACIÓN ======
const ModuloRestauracion = ({ onBack }) => {
  const [menus, setMenus] = useState([]);
  const [menuHoy, setMenuHoy] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fecha: '', desayuno: '', comida: '', cena: '', opciones_especiales: '' });

  const cargar = async () => {
    setCargando(true);
    const [r1, r2] = await Promise.all([
      axios.get(`${API_URL}/restauracion/menus`),
      axios.get(`${API_URL}/restauracion/menus/hoy`)
    ]);
    setMenus(r1.data);
    setMenuHoy(r2.data);
    setCargando(false);
  };
  useEffect(cargar, []);

  const guardar = async () => {
    await axios.post(`${API_URL}/restauracion/menus`, form);
    setShowForm(false);
    setForm({ fecha: '', desayuno: '', comida: '', cena: '', opciones_especiales: '' });
    cargar();
  };

  const eliminar = async (id) => {
    await axios.delete(`${API_URL}/restauracion/menus/${id}`);
    cargar();
  };

  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <HeaderModulo titulo="Restauración" icono={<Utensils size={20} />} color="bg-green-600" onBack={onBack} />

      <div className="p-4">
        {cargando ? <Cargando /> : (
          <>
            {menuHoy && menuHoy.fecha === hoy && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-green-200 dark:border-green-800 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sun size={18} className="text-green-600" />
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">Menú de hoy</h3>
                  <span className="text-xs text-gray-400">{menuHoy.fecha}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium text-amber-600">🌅 Desayuno:</span> <span className="text-gray-700 dark:text-gray-300">{menuHoy.desayuno}</span></div>
                  <div><span className="font-medium text-orange-600">🌞 Comida:</span> <span className="text-gray-700 dark:text-gray-300">{menuHoy.comida}</span></div>
                  <div><span className="font-medium text-indigo-600">🌙 Cena:</span> <span className="text-gray-700 dark:text-gray-300">{menuHoy.cena}</span></div>
                  {menuHoy.opciones_especiales && <div className="text-xs text-gray-500 mt-1">🥗 {menuHoy.opciones_especiales}</div>}
                </div>
              </div>
            )}

            <button onClick={() => setShowForm(true)} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-medium hover:bg-green-700 transition-colors mb-4 flex items-center justify-center gap-2">
              <Plus size={18} /> Nuevo menú
            </button>

            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Menús anteriores</h3>
            <div className="space-y-2">
              {menus.filter(m => m.fecha !== hoy).map(m => (
                <div key={m.id} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{m.fecha}</div>
                    <button onClick={() => eliminar(m.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">D: {m.desayuno} | C: {m.comida} | C: {m.cena}</div>
                </div>
              ))}
              {menus.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">No hay menús registrados</p>}
            </div>
          </>
        )}
      </div>

      <Modal abierto={showForm} titulo="Nuevo menú" onClose={() => setShowForm(false)}>
        <div className="space-y-3">
          <input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
          <input type="text" placeholder="Desayuno" value={form.desayuno} onChange={e => setForm({...form, desayuno: e.target.value})} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
          <input type="text" placeholder="Comida" value={form.comida} onChange={e => setForm({...form, comida: e.target.value})} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
          <input type="text" placeholder="Cena" value={form.cena} onChange={e => setForm({...form, cena: e.target.value})} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
          <textarea placeholder="Opciones especiales (dietas, alergias...)" value={form.opciones_especiales} onChange={e => setForm({...form, opciones_especiales: e.target.value})} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" rows="2" />
          <button onClick={guardar} className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700">Guardar menú</button>
        </div>
      </Modal>

      <VolverBtn onClick={onBack} />
    </div>
  );
};

// ====== LIMPIEZA ======
const ModuloLimpieza = ({ onBack }) => {
  const [pendientes, setPendientes] = useState([]);
  const [completadas, setCompletadas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState('pendientes');

  const cargar = async () => {
    setCargando(true);
    const [r1, r2] = await Promise.all([
      axios.get(`${API_URL}/limpieza/pendientes`),
      axios.get(`${API_URL}/limpieza/completadas`)
    ]);
    setPendientes(r1.data);
    setCompletadas(r2.data);
    setCargando(false);
  };
  useEffect(cargar, []);

  const iniciar = async (id) => {
    await axios.put(`${API_URL}/limpieza/${id}/iniciar`);
    cargar();
  };
  const completar = async (id) => {
    await axios.put(`${API_URL}/limpieza/${id}/completar`);
    cargar();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <HeaderModulo titulo="Limpieza" icono={<CheckSquare size={20} />} color="bg-purple-600" onBack={onBack} />

      <div className="flex border-b dark:border-gray-700 bg-white dark:bg-gray-800">
        <button onClick={() => setTab('pendientes')} className={`flex-1 py-3 text-sm font-medium text-center ${tab === 'pendientes' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}>Pendientes ({pendientes.length})</button>
        <button onClick={() => setTab('completadas')} className={`flex-1 py-3 text-sm font-medium text-center ${tab === 'completadas' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}>Completadas</button>
      </div>

      <div className="p-4">
        {cargando ? <Cargando /> : (
          tab === 'pendientes' ? (
            pendientes.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle size={40} className="mx-auto text-green-400 mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No hay limpiezas pendientes</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendientes.map(p => (
                  <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">Hab. {p.numero_habitacion}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Asignada: {p.fecha_asignacion} · Responsable: {p.responsable}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                      }`}>{p.estado}</span>
                    </div>
                    <div className="flex gap-2">
                      {p.estado === 'pendiente' && <button onClick={() => iniciar(p.id)} className="flex-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 py-2 rounded-lg text-sm font-medium hover:bg-blue-200">Iniciar limpieza</button>}
                      {p.estado === 'en_proceso' && <button onClick={() => completar(p.id)} className="flex-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 py-2 rounded-lg text-sm font-medium hover:bg-green-200">Marcar completada</button>}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-2">
              {completadas.map(c => (
                <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">Hab. {c.habitacion_id}</div>
                    <div className="text-xs text-gray-500">{c.fecha_completado} · {c.responsable}</div>
                  </div>
                  <CheckCircle size={18} className="text-green-500" />
                </div>
              ))}
              {completadas.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">Sin registros</p>}
            </div>
          )
        )}
      </div>
      <VolverBtn onClick={onBack} />
    </div>
  );
};

// ====== RESERVAS ======
const ModuloReservas = ({ onBack }) => {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showCheckin, setShowCheckin] = useState(false);
  const [form, setForm] = useState({ huesped_nombre: '', huesped_tel: '', huesped_email: '', habitacion_id: '', tipo_habitacion: '1600', num_personas: 1, fecha_ingreso: '', fecha_salida: '', monto_total: '' });
  const [habitaciones1600, setH1600] = useState([]);
  const [habitaciones2000, setH2000] = useState([]);

  useEffect(() => {
    cargarReservas();
    axios.get(`${API_URL}/cota1600/habitaciones`).then(r => setH1600(r.data.filter(h => h.estado === 'disponible')));
    axios.get(`${API_URL}/cota2000/habitaciones`).then(r => setH2000(r.data.filter(h => h.estado === 'disponible')));
  }, []);

  const cargarReservas = () => {
    setCargando(true);
    axios.get(`${API_URL}/reservas`).then(r => setReservas(r.data)).finally(() => setCargando(false));
  };

  const hacerCheckin = async () => {
    await axios.post(`${API_URL}/checkin`, form);
    setShowCheckin(false);
    setForm({ huesped_nombre: '', huesped_tel: '', huesped_email: '', habitacion_id: '', tipo_habitacion: '1600', num_personas: 1, fecha_ingreso: '', fecha_salida: '', monto_total: '' });
    cargarReservas();
  };

  const hacerCheckout = async (id) => {
    if (!confirm('¿Confirmar checkout de esta reserva?')) return;
    await axios.post(`${API_URL}/checkout/${id}`);
    cargarReservas();
  };

  const hoy = new Date().toISOString().split('T')[0];
  const habitacionesDisp = form.tipo_habitacion === '2000' ? habitaciones2000 : habitaciones1600;

  const estadoColor = {
    confirmada: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    checkin: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    checkout: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <HeaderModulo titulo="Reservas" icono={<CalendarCheck size={20} />} color="bg-pink-600" onBack={onBack} />

      <div className="p-4">
        <button onClick={() => {
          setForm({...form, fecha_ingreso: hoy, fecha_salida: ''});
          setShowCheckin(true);
        }} className="w-full bg-pink-600 text-white py-2.5 rounded-xl font-medium hover:bg-pink-700 transition-colors mb-4 flex items-center justify-center gap-2">
          <Plus size={18} /> Nuevo check-in
        </button>

        {cargando ? <Cargando /> : (
          <div className="space-y-2">
            {reservas.map(r => (
              <div key={r.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <div className="font-bold text-gray-900 dark:text-gray-100">{r.huesped_nombre}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                      <span>Hab {r.habitacion_id} ({r.tipo_habitacion})</span>
                      <span>·</span>
                      <span><Users size={12} className="inline" /> {r.num_personas}</span>
                    </div>
                    {(r.huesped_tel || r.huesped_email) && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        {r.huesped_tel && <><Phone size={10} className="inline" /> {r.huesped_tel} </>}
                        {r.huesped_email && <><Mail size={10} className="inline" /> {r.huesped_email}</>}
                      </div>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoColor[r.estado] || ''}`}>{r.estado}</span>
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{r.fecha_ingreso} → {r.fecha_salida}</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{r.monto_total ? `€${r.monto_total}` : ''}</span>
                </div>
                {(r.estado === 'confirmada' || r.estado === 'checkin') && (
                  <button onClick={() => hacerCheckout(r.id)} className="mt-2 w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-1.5 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center gap-1">
                    <LogOut size={14} /> {r.estado === 'checkin' ? 'Hacer checkout' : 'Cancelar reserva'}
                  </button>
                )}
              </div>
            ))}
            {reservas.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">No hay reservas</p>}
          </div>
        )}
      </div>

      <Modal abierto={showCheckin} titulo="Nuevo check-in" onClose={() => setShowCheckin(false)}>
        <div className="space-y-3">
          <input type="text" placeholder="Nombre del huésped" value={form.huesped_nombre} onChange={e => setForm({...form, huesped_nombre: e.target.value})} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
          <div className="flex gap-2">
            <input type="text" placeholder="Teléfono" value={form.huesped_tel} onChange={e => setForm({...form, huesped_tel: e.target.value})} className="flex-1 p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
            <input type="email" placeholder="Email" value={form.huesped_email} onChange={e => setForm({...form, huesped_email: e.target.value})} className="flex-1 p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
          </div>
          <div className="flex gap-2">
            <select value={form.tipo_habitacion} onChange={e => setForm({...form, tipo_habitacion: e.target.value})} className="flex-1 p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm">
              <option value="1600">Cota 1600</option>
              <option value="2000">Cota 2000</option>
            </select>
            <select value={form.habitacion_id} onChange={e => setForm({...form, habitacion_id: e.target.value})} className="flex-1 p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm">
              <option value="">Habitación</option>
              {habitacionesDisp.map(h => <option key={h.id} value={h.id}>Hab {h.numero} ({h.tipo})</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <input type="number" placeholder="Personas" min="1" value={form.num_personas} onChange={e => setForm({...form, num_personas: parseInt(e.target.value)})} className="w-20 p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
            <input type="number" placeholder="Total €" value={form.monto_total} onChange={e => setForm({...form, monto_total: e.target.value})} className="flex-1 p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Entrada</label>
              <input type="date" value={form.fecha_ingreso} onChange={e => setForm({...form, fecha_ingreso: e.target.value})} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Salida</label>
              <input type="date" value={form.fecha_salida} onChange={e => setForm({...form, fecha_salida: e.target.value})} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
            </div>
          </div>
          <button onClick={hacerCheckin} disabled={!form.huesped_nombre || !form.habitacion_id || !form.fecha_ingreso || !form.fecha_salida}
            className="w-full bg-pink-600 text-white py-2.5 rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed">
            Confirmar check-in
          </button>
        </div>
      </Modal>

      <VolverBtn onClick={onBack} />
    </div>
  );
};

// ====== INCIDENCIAS ======
const ModuloIncidencias = ({ onBack }) => {
  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState({ titulo: '', descripcion: '', criticidad: 'normal' });

  const cargar = () => { setCargando(true); axios.get(`${API_URL}/incidencias`).then(r => setIncidencias(r.data)).finally(() => setCargando(false)); };
  useEffect(cargar, []);

  const crear = async () => {
    await axios.post(`${API_URL}/incidencias`, form);
    setForm({ titulo: '', descripcion: '', criticidad: 'normal' });
    cargar();
  };

  const cambiarEstado = async (id, estado) => {
    await axios.put(`${API_URL}/incidencias/${id}/estado`, { estado });
    cargar();
  };

  const criticidadColor = {
    critica: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    importante: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    normal: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    menor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <HeaderModulo titulo="Incidencias" icono={<AlertTriangle size={20} />} color="bg-red-600" onBack={onBack} />
      <div className="p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
          <h3 className="font-medium text-sm mb-3 text-gray-900 dark:text-gray-100">Nueva incidencia</h3>
          <input type="text" placeholder="Título" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} className="w-full p-2.5 mb-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
          <textarea placeholder="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="w-full p-2.5 mb-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" rows="2" />
          <div className="flex gap-2">
            <select value={form.criticidad} onChange={e => setForm({...form, criticidad: e.target.value})} className="flex-1 p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm">
              <option value="normal">Normal</option>
              <option value="importante">Importante</option>
              <option value="critica">Crítica</option>
              <option value="menor">Menor</option>
            </select>
            <button onClick={crear} className="bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700">Crear</button>
          </div>
        </div>

        {cargando ? <Cargando /> : (
          <div className="space-y-2">
            {incidencias.map(i => (
              <div key={i.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{i.titulo}</div>
                    {i.descripcion && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{i.descripcion}</div>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 ${criticidadColor[i.criticidad] || ''}`}>{i.criticidad}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-1.5">
                    {i.estado !== 'resuelta' && <button onClick={() => cambiarEstado(i.id, 'resuelta')} className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-1 rounded-lg">Resolver</button>}
                    {i.estado !== 'en_proceso' && i.estado !== 'resuelta' && <button onClick={() => cambiarEstado(i.id, 'en_proceso')} className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg">En proceso</button>}
                    {i.estado !== 'cerrada' && i.estado === 'resuelta' && <button onClick={() => cambiarEstado(i.id, 'cerrada')} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg">Cerrar</button>}
                  </div>
                  <span className="text-xs text-gray-400">{new Date(i.fecha).toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Estado: <span className="font-medium">{i.estado}</span>
                </div>
              </div>
            ))}
            {incidencias.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">No hay incidencias</p>}
          </div>
        )}
      </div>
      <VolverBtn onClick={onBack} />
    </div>
  );
};

// ====== ECONÓMICO ======
const ModuloEconomico = ({ onBack }) => {
  const [movimientos, setMovimientos] = useState([]);
  const [resumen, setResumen] = useState({ ingresos: 0, gastos: 0, balance: 0, porCategoria: [] });
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState({ tipo: 'ingreso', concepto: '', categoria: '', monto: '', metodo_pago: 'efectivo' });

  const cargar = async () => {
    setCargando(true);
    const [r1, r2] = await Promise.all([
      axios.get(`${API_URL}/economico/movimientos`),
      axios.get(`${API_URL}/economico/resumen`)
    ]);
    setMovimientos(r1.data);
    setResumen(r2.data);
    setCargando(false);
  };
  useEffect(cargar, []);

  const agregar = async () => {
    await axios.post(`${API_URL}/economico/movimientos`, form);
    setForm({ tipo: 'ingreso', concepto: '', categoria: '', monto: '', metodo_pago: 'efectivo' });
    cargar();
  };

  const eliminar = async (id) => {
    await axios.delete(`${API_URL}/economico/movimientos/${id}`);
    cargar();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <HeaderModulo titulo="Control Económico" icono={<DollarSign size={20} />} color="bg-yellow-600" onBack={onBack} />

      <div className="p-4">
        {cargando ? <Cargando /> : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-xl text-center border border-green-200 dark:border-green-800">
                <div className="text-xs text-green-600 dark:text-green-400">Ingresos</div>
                <div className="text-lg font-bold text-green-700 dark:text-green-300">€{resumen.ingresos}</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-xl text-center border border-red-200 dark:border-red-800">
                <div className="text-xs text-red-600 dark:text-red-400">Gastos</div>
                <div className="text-lg font-bold text-red-700 dark:text-red-300">€{resumen.gastos}</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl text-center border border-blue-200 dark:border-blue-800">
                <div className="text-xs text-blue-600 dark:text-blue-400">Balance</div>
                <div className="text-lg font-bold text-blue-700 dark:text-blue-300">€{resumen.balance}</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
              <h3 className="font-medium text-sm mb-3 text-gray-900 dark:text-gray-100">Nuevo movimiento</h3>
              <div className="flex gap-2 mb-2">
                <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className="w-28 p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm">
                  <option value="ingreso">Ingreso</option>
                  <option value="gasto">Gasto</option>
                </select>
                <select value={form.metodo_pago} onChange={e => setForm({...form, metodo_pago: e.target.value})} className="w-28 p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm">
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
              <input type="text" placeholder="Concepto" value={form.concepto} onChange={e => setForm({...form, concepto: e.target.value})} className="w-full p-2.5 mb-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
              <div className="flex gap-2">
                <input type="text" placeholder="Categoría (ej: alojamiento)" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} className="flex-1 p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
                <input type="number" placeholder="Monto €" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} className="w-28 p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
                <button onClick={agregar} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">+</button>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Movimientos</h3>
            <div className="space-y-2">
              {movimientos.map(m => (
                <div key={m.id} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{m.concepto}</div>
                    <div className="text-xs text-gray-400">{m.fecha} {m.categoria ? `· ${m.categoria}` : ''} {m.metodo_pago ? `· ${m.metodo_pago}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${m.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                      {m.tipo === 'ingreso' ? '+' : '-'}€{m.monto}
                    </span>
                    <button onClick={() => eliminar(m.id)} className="text-red-300 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {movimientos.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">Sin movimientos</p>}
            </div>
          </>
        )}
      </div>
      <VolverBtn onClick={onBack} />
    </div>
  );
};

// ====== ASISTENTE IA ======
const ModuloAsistente = ({ onBack }) => {
  const [mensaje, setMensaje] = useState('');
  const [conversacion, setConversacion] = useState([]);
  const [cargando, setCargando] = useState(false);

  const enviar = async () => {
    if (!mensaje.trim()) return;
    const msg = mensaje;
    setConversacion(p => [...p, { rol: 'usuario', contenido: msg }]);
    setMensaje('');
    setCargando(true);
    try {
      const r = await axios.post(`${API_URL}/ia/asistente`, { mensaje: msg });
      setConversacion(p => [...p, { rol: 'asistente', contenido: r.data.respuesta }]);
    } catch {
      setConversacion(p => [...p, { rol: 'asistente', contenido: 'Error al conectar con el servidor.' }]);
    }
    setCargando(false);
  };

  const sugerencias = ['¿Hay habitaciones libres?', '¿Cuántos ingresos tenemos?', '¿Qué hay de comer hoy?', '¿Cuál es la ocupación?'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col pb-20">
      <HeaderModulo titulo="Asistente IA" icono={<Sparkles size={20} />} color="bg-indigo-600" onBack={onBack} />

      {conversacion.length === 0 && (
        <div className="p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-indigo-200 dark:border-indigo-800 text-center">
            <Sparkles size={32} className="mx-auto text-indigo-400 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Pregúntame sobre habitaciones, finanzas, incidencias, menús...</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {sugerencias.map(s => (
                <button key={s} onClick={() => { setMensaje(s); }} className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {conversacion.map((msg, i) => (
          <div key={i} className={`flex ${msg.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
              msg.rol === 'usuario'
                ? 'bg-indigo-600 text-white rounded-br-md'
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md shadow-sm border border-gray-200 dark:border-gray-700'
            }`}>{msg.contenido}</div>
          </div>
        ))}
        {cargando && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <div className="flex gap-2 max-w-lg mx-auto">
          <input type="text" value={mensaje} onChange={e => setMensaje(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && enviar()}
            placeholder="Escribe tu pregunta..."
            className="flex-1 p-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm" />
          <button onClick={enviar} disabled={cargando || !mensaje.trim()}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium">
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

// ====== APP PRINCIPAL ======
const App = () => {
  const [vista, setVista] = useState('dashboard');

  const modulos = {
    dashboard: Dashboard,
    albergue: ModuloAlbergue,
    cota2000: ModuloCota2000,
    restauracion: ModuloRestauracion,
    limpieza: ModuloLimpieza,
    reservas: ModuloReservas,
    incidencias: ModuloIncidencias,
    economico: ModuloEconomico,
    asistente: ModuloAsistente
  };

  const VistaActual = modulos[vista] || Dashboard;
  return <VistaActual onNavigate={setVista} onBack={() => setVista('dashboard')} />;
};

export default App;
