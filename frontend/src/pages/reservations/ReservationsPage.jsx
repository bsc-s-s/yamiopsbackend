import { useState, useEffect } from 'react';
import { Plus, Users, Phone, Mail, LogOut } from 'lucide-react';
import { reservations as api, properties as propApi } from '../../services/api';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ReservationsPage() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [props, setProps] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    customer_id: '', property_id: '', room_id: '', check_in: '', check_out: '',
    guests: 1, total_amount: '', source: 'manual', customer_name: '', customer_phone: '', customer_email: ''
  });

  const load = async () => {
    setLoading(true);
    const r = await api.list();
    setReservas(r.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); propApi.list().then(r => setProps(r.data || [])); }, []);

  useEffect(() => {
    if (form.property_id) {
      propApi.rooms.list(form.property_id).then(r => setRooms(r.data?.filter(rm => rm.status === 'available') || []));
    }
  }, [form.property_id]);

  const loadRoomsForProp = async (propId) => {
    setForm({ ...form, property_id: propId, room_id: '' });
    const r = await propApi.rooms.list(propId);
    setRooms(r.data?.filter(rm => rm.status === 'available') || []);
  };

  const handleCheckin = async () => {
    if (!form.customer_name || !form.room_id || !form.check_in || !form.check_out) return;
    const { data: customers } = await (await import('../../services/api')).default.get('/customers', { params: { tenant_id: localStorage.getItem('tenant_id') } }).catch(() => ({ data: [] }));
    let customerId = form.customer_id;
    if (!customerId) {
      const r = await (await import('../../services/api')).default.post('/customers', {
        tenant_id: localStorage.getItem('tenant_id'),
        name: form.customer_name, phone: form.customer_phone, email: form.customer_email
      });
      customerId = r.data.id;
    }
    await api.create({
      customer_id: customerId, property_id: form.property_id, room_id: form.room_id,
      check_in: form.check_in, check_out: form.check_out, guests: form.guests,
      total_amount: parseFloat(form.total_amount) || 0, source: form.source,
    });
    setShowForm(false);
    setForm({ customer_id: '', property_id: '', room_id: '', check_in: '', check_out: '', guests: 1, total_amount: '', source: 'manual', customer_name: '', customer_phone: '', customer_email: '' });
    load();
  };

  const doCheckin = async (id) => { await api.checkin(id); load(); };
  const doCheckout = async (id) => { await api.checkout(id); load(); };
  const doCancel = async (id) => { await api.cancel(id); load(); };

  if (loading) return <LoadingSpinner />;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          <p className="text-sm text-gray-500 mt-1">{reservas.length} reservas</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 flex items-center gap-2">
          <Plus size={16} /> Nueva reserva
        </button>
      </div>

      <div className="space-y-3">
        {reservas.map(r => (
          <div key={r.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-gray-900">{r.customers?.name || 'Huésped'}</div>
                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                  <Users size={12} /> {r.guests} pers · Hab {r.rooms?.name || '?'} · {r.properties?.name || ''}
                </div>
                {(r.customers?.phone || r.customers?.email) && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    {r.customers?.phone && <><Phone size={10} className="inline" /> {r.customers.phone} </>}
                    {r.customers?.email && <><Mail size={10} className="inline" /> {r.customers.email}</>}
                  </div>
                )}
              </div>
              <Badge label={r.status} variant={r.status} />
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>{r.check_in} → {r.check_out}</span>
              <span className="font-medium text-gray-700">€{r.total_amount}</span>
            </div>
            <div className="flex gap-2 mt-3">
              {r.status === 'confirmed' && (
                <>
                  <button onClick={() => doCheckin(r.id)} className="flex-1 bg-green-100 text-green-700 py-1.5 rounded-lg text-xs font-medium hover:bg-green-200">Check-in</button>
                  <button onClick={() => doCancel(r.id)} className="flex-1 bg-red-50 text-red-600 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100">Cancelar</button>
                </>
              )}
              {r.status === 'checked_in' && (
                <button onClick={() => doCheckout(r.id)} className="flex-1 bg-orange-100 text-orange-700 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-200 flex items-center justify-center gap-1">
                  <LogOut size={12} /> Check-out
                </button>
              )}
            </div>
          </div>
        ))}
        {reservas.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">No hay reservas</p>}
      </div>

      <Modal open={showForm} title="Nueva reserva" onClose={() => setShowForm(false)}>
        <div className="space-y-3">
          <input type="text" placeholder="Nombre del huésped" value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
          <div className="flex gap-2">
            <input type="text" placeholder="Teléfono" value={form.customer_phone} onChange={e => setForm({...form, customer_phone: e.target.value})} className="flex-1 p-2.5 border rounded-lg text-sm" />
            <input type="email" placeholder="Email" value={form.customer_email} onChange={e => setForm({...form, customer_email: e.target.value})} className="flex-1 p-2.5 border rounded-lg text-sm" />
          </div>
          <select value={form.property_id} onChange={e => loadRoomsForProp(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm">
            <option value="">Seleccionar alojamiento</option>
            {props.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={form.room_id} onChange={e => setForm({...form, room_id: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm">
            <option value="">Habitación</option>
            {rooms.map(r => <option key={r.id} value={r.id}>Hab {r.name} ({r.type}) - €{r.price_per_night}</option>)}
          </select>
          <div className="flex gap-2">
            <input type="number" placeholder="Personas" min="1" value={form.guests} onChange={e => setForm({...form, guests: parseInt(e.target.value) || 1})} className="w-20 p-2.5 border rounded-lg text-sm" />
            <input type="number" placeholder="Total €" value={form.total_amount} onChange={e => setForm({...form, total_amount: e.target.value})} className="flex-1 p-2.5 border rounded-lg text-sm" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Entrada</label>
              <input type="date" value={form.check_in} onChange={e => setForm({...form, check_in: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Salida</label>
              <input type="date" value={form.check_out} onChange={e => setForm({...form, check_out: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
            </div>
          </div>
          <button onClick={handleCheckin} disabled={!form.customer_name || !form.room_id || !form.check_in || !form.check_out}
            className="w-full bg-pink-600 text-white py-2.5 rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50">
            Crear reserva
          </button>
        </div>
      </Modal>
    </div>
  );
}
