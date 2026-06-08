import { useState, useEffect } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import { incidents as api } from '../../services/api';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'normal', department: 'maintenance' });

  const load = async () => {
    setLoading(true);
    const r = await api.list();
    setIncidents(r.data || []);
    setLoading(false);
  };
  useEffect(load, []);

  const create = async () => {
    if (!form.title) return;
    await api.create(form);
    setShowForm(false);
    setForm({ title: '', description: '', priority: 'normal', department: 'maintenance' });
    load();
  };

  const doAction = async (id, action) => {
    if (action === 'resolve') await api.resolve(id);
    else if (action === 'close') await api.close(id);
    else if (action === 'in_progress') await api.update(id, { status: 'in_progress' });
    load();
  };

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...incidents].sort((a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99));

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incidencias</h1>
          <p className="text-sm text-gray-500 mt-1">{incidents.filter(i => !['resolved', 'closed'].includes(i.status)).length} abiertas</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2">
          <Plus size={16} /> Nueva
        </button>
      </div>

      <div className="space-y-3">
        {sorted.map(i => (
          <div key={i.id} className={`bg-white rounded-xl p-4 border shadow-sm ${
            i.priority === 'critical' ? 'border-red-300' :
            i.priority === 'high' ? 'border-orange-200' : 'border-gray-200'
          }`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {i.priority === 'critical' && <AlertTriangle size={16} className="text-red-500" />}
                  <span className="font-bold text-gray-900">{i.title}</span>
                </div>
                {i.description && <div className="text-xs text-gray-500 mt-1">{i.description}</div>}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <Badge label={i.priority} variant={i.priority} />
                  <Badge label={i.department} variant={i.department?.toLowerCase()} />
                  <Badge label={i.status} variant={i.status} />
                  {i.rooms?.name && <span>· Hab {i.rooms.name}</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {i.status === 'open' && (
                <>
                  <button onClick={() => doAction(i.id, 'in_progress')} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200">En progreso</button>
                  <button onClick={() => doAction(i.id, 'resolve')} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200">Resolver</button>
                </>
              )}
              {i.status === 'in_progress' && (
                <button onClick={() => doAction(i.id, 'resolve')} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200">Resolver</button>
              )}
              {i.status === 'resolved' && (
                <button onClick={() => doAction(i.id, 'close')} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200">Cerrar</button>
              )}
            </div>
          </div>
        ))}
        {incidents.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">No hay incidencias</p>}
      </div>

      <Modal open={showForm} title="Nueva incidencia" onClose={() => setShowForm(false)}>
        <div className="space-y-3">
          <input type="text" placeholder="Título" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
          <textarea placeholder="Descripción" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" rows="3" />
          <div className="flex gap-2">
            <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="flex-1 p-2.5 border rounded-lg text-sm">
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
            <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="flex-1 p-2.5 border rounded-lg text-sm">
              <option value="maintenance">Mantenimiento</option>
              <option value="cleaning">Limpieza</option>
              <option value="reception">Recepción</option>
              <option value="administration">Administración</option>
            </select>
          </div>
          <button onClick={create} disabled={!form.title} className="w-full bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50">Crear incidencia</button>
        </div>
      </Modal>
    </div>
  );
}
