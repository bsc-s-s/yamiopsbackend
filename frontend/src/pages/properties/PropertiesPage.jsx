import { useState, useEffect } from 'react';
import { Plus, BedDouble } from 'lucide-react';
import { properties as api } from '../../services/api';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function PropertiesPage() {
  const [props, setProps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProp, setSelectedProp] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'hostel' });

  useEffect(() => {
    api.list().then(r => setProps(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadRooms = async (prop) => {
    setSelectedProp(prop);
    const r = await api.rooms.list(prop.id);
    setRooms(r.data || []);
  };

  const changeStatus = async (roomId, status) => {
    await api.rooms.updateStatus(selectedProp.id, roomId, status);
    loadRooms(selectedProp);
  };

  const createProp = async () => {
    await api.create(form);
    setShowForm(false);
    setForm({ name: '', type: 'hostel' });
    const r = await api.list();
    setProps(r.data);
  };

  if (loading) return <LoadingSpinner />;

  if (selectedProp) {
    return (
      <div>
        <button onClick={() => setSelectedProp(null)} className="text-sm text-indigo-600 hover:text-indigo-800 mb-4">&larr; Volver a alojamientos</button>
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{selectedProp.name}</h2>
              <p className="text-sm text-gray-500 capitalize">{selectedProp.type} · Check-in: {selectedProp.check_in_time} · Check-out: {selectedProp.check_out_time}</p>
            </div>
            <Badge label={selectedProp.is_active ? 'Activo' : 'Inactivo'} variant={selectedProp.is_active ? 'active' : 'inactive'} />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {rooms.map(room => (
            <div key={room.id} className={`bg-white rounded-xl p-4 border shadow-sm ${
              room.status === 'available' ? 'border-green-200' :
              room.status === 'occupied' ? 'border-orange-200' :
              room.status === 'cleaning' ? 'border-yellow-200' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-gray-900">Hab. {room.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{room.type} · {room.capacity} pers</div>
                  <div className="text-xs text-gray-400">€{room.price_per_night}/noche</div>
                </div>
                <Badge label={room.status} variant={room.status} />
              </div>
              <div className="flex gap-1 mt-2 flex-wrap">
                {room.status !== 'available' && <button onClick={() => changeStatus(room.id, 'available')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Libre</button>}
                {room.status !== 'occupied' && <button onClick={() => changeStatus(room.id, 'occupied')} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Ocupar</button>}
                {room.status !== 'cleaning' && <button onClick={() => changeStatus(room.id, 'cleaning')} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Limpieza</button>}
                {room.status !== 'maintenance' && <button onClick={() => changeStatus(room.id, 'maintenance')} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Mant.</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alojamientos</h1>
          <p className="text-sm text-gray-500 mt-1">Propiedades y habitaciones</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
          <Plus size={16} /> Añadir
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {props.map(p => (
          <button key={p.id} onClick={() => loadRooms(p)} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <BedDouble size={24} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{p.name}</h3>
                <p className="text-xs text-gray-500 capitalize">{p.type} · {p.address || 'Sin dirección'}</p>
              </div>
              <Badge label={p.is_active ? 'Activo' : 'Inactivo'} variant={p.is_active ? 'active' : 'inactive'} />
            </div>
          </button>
        ))}
      </div>

      <Modal open={showForm} title="Nuevo alojamiento" onClose={() => setShowForm(false)}>
        <div className="space-y-3">
          <input type="text" placeholder="Nombre" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm">
            <option value="hostel">Hostel/Albergue</option>
            <option value="hotel">Hotel</option>
            <option value="apartment">Apartamento</option>
            <option value="cabin">Cabaña</option>
            <option value="resort">Resort</option>
          </select>
          <button onClick={createProp} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700">Crear</button>
        </div>
      </Modal>
    </div>
  );
}
