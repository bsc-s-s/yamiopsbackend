import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { finance as api } from '../../services/api';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function FinancePage() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0, byCategory: [] });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'income', description: '', category: 'accommodation', amount: '', payment_method: 'cash' });

  const load = async () => {
    setLoading(true);
    const [r1, r2] = await Promise.all([api.list(), api.summary()]);
    setRecords(r1.data || []);
    setSummary(r2.data || { income: 0, expense: 0, balance: 0, byCategory: [] });
    setLoading(false);
  };
  useEffect(load, []);

  const create = async () => {
    if (!form.description || !form.amount) return;
    await api.create(form);
    setShowForm(false);
    setForm({ type: 'income', description: '', category: 'accommodation', amount: '', payment_method: 'cash' });
    load();
  };

  const remove = async (id) => {
    if (!confirm('¿Eliminar este movimiento?')) return;
    await api.delete(id);
    load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control Económico</h1>
          <p className="text-sm text-gray-500 mt-1">{records.length} movimientos</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <Plus size={16} /> Nuevo
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-xs text-green-600 font-medium">Ingresos</div>
          <div className="text-2xl font-bold text-green-700">€{summary.income.toFixed(2)}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <div className="text-xs text-red-600 font-medium">Gastos</div>
          <div className="text-2xl font-bold text-red-700">€{summary.expense.toFixed(2)}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-xs text-blue-600 font-medium">Balance</div>
          <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>€{summary.balance.toFixed(2)}</div>
        </div>
      </div>

      {summary.byCategory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Por categoría</h3>
          <div className="space-y-2">
            {summary.byCategory.map(c => (
              <div key={c.category} className="flex items-center justify-between text-sm">
                <span className="capitalize text-gray-700">{c.category}</span>
                <span className="font-medium">€{c.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {records.map(r => (
          <div key={r.id} className="bg-white rounded-xl p-3 border border-gray-200 flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-900">{r.description || 'Sin concepto'}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {r.category ? <Badge label={r.category} variant={r.category} /> : ''}
                {' '}{r.payment_method} · {new Date(r.recorded_at).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${r.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {r.type === 'income' ? '+' : '-'}€{parseFloat(r.amount).toFixed(2)}
              </span>
              <button onClick={() => remove(r.id)} className="text-red-300 hover:text-red-500 p-1">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {records.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">Sin movimientos</p>}
      </div>

      <Modal open={showForm} title="Nuevo movimiento" onClose={() => setShowForm(false)}>
        <div className="space-y-3">
          <div className="flex gap-2">
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="flex-1 p-2.5 border rounded-lg text-sm">
              <option value="income">Ingreso</option>
              <option value="expense">Gasto</option>
            </select>
            <select value={form.payment_method} onChange={e => setForm({...form, payment_method: e.target.value})} className="flex-1 p-2.5 border rounded-lg text-sm">
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
              <option value="online">Online</option>
            </select>
          </div>
          <input type="text" placeholder="Descripción" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
          <div className="flex gap-2">
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="flex-1 p-2.5 border rounded-lg text-sm">
              <option value="accommodation">Alojamiento</option>
              <option value="restaurant">Restauración</option>
              <option value="services">Servicios</option>
              <option value="supplies">Suministros</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="cleaning">Limpieza</option>
              <option value="other">Otros</option>
            </select>
            <input type="number" step="0.01" placeholder="Monto €" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-28 p-2.5 border rounded-lg text-sm" />
          </div>
          <button onClick={create} disabled={!form.description || !form.amount} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">Registrar</button>
        </div>
      </Modal>
    </div>
  );
}
