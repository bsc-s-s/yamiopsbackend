import { useState, useEffect } from 'react';
import { Users, Plus, Mail, Phone, Shield } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'reception', phone: '' });

  const load = async () => {
    setLoading(true);
    const r = await api.get('/auth');
    setUsers(r.data?.data || []);
    setLoading(false);
  };
  useEffect(load, []);

  const create = async () => {
    if (!form.name || !form.email || !form.password) return;
    await api.post('/auth/register', { ...form, tenant_id: localStorage.getItem('tenant_id') });
    setShowForm(false);
    setForm({ name: '', email: '', password: '', role: 'reception', phone: '' });
    load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} usuarios</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
          <Plus size={16} /> Añadir
        </button>
      </div>

      <div className="grid gap-3">
        {users.map(u => (
          <div key={u.id} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Users size={18} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{u.name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                  <Mail size={10} /> {u.email}
                  {u.phone && <><Phone size={10} /> {u.phone}</>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-gray-400" />
                <Badge label={u.role} variant={u.role} />
                <Badge label={u.is_active ? 'Activo' : 'Inactivo'} variant={u.is_active ? 'active' : 'inactive'} />
              </div>
            </div>
          </div>
        ))}
        {users.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">No hay usuarios</p>}
      </div>

      <Modal open={showForm} title="Nuevo usuario" onClose={() => setShowForm(false)}>
        <div className="space-y-3">
          <input type="text" placeholder="Nombre" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
          <input type="password" placeholder="Contraseña" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
          <div className="flex gap-2">
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="flex-1 p-2.5 border rounded-lg text-sm">
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="reception">Recepción</option>
              <option value="cleaning">Limpieza</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="accounting">Contabilidad</option>
            </select>
            <input type="text" placeholder="Teléfono" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="flex-1 p-2.5 border rounded-lg text-sm" />
          </div>
          <button onClick={create} disabled={!form.name || !form.email || !form.password} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">Crear usuario</button>
        </div>
      </Modal>
    </div>
  );
}
