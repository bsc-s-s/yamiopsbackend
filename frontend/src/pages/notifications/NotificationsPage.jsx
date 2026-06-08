import { useState, useEffect } from 'react';
import { Bell, Send, RefreshCw } from 'lucide-react';
import { notifications as api } from '../../services/api';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function NotificationsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await api.list();
    setList(r.data || []);
    setLoading(false);
  };
  useEffect(load, []);

  const retry = async (id) => {
    await api.retry(id);
    load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-sm text-gray-500 mt-1">Historial de comunicaciones</p>
        </div>
      </div>

      <div className="space-y-2">
        {list.map(n => (
          <div key={n.id} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Bell size={16} className="text-indigo-600" />
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-900">{n.subject || n.type}</div>
                  <div className="text-xs text-gray-500 mt-1">{n.body?.substring(0, 100)}...</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge label={n.type} variant={n.type?.toLowerCase()} />
                    <Badge label={n.channel} variant={n.channel} />
                    <Badge label={n.status} variant={n.status} />
                    <span className="text-xs text-gray-400">{n.recipient}</span>
                  </div>
                </div>
              </div>
              {n.status === 'failed' && (
                <button onClick={() => retry(n.id)} className="text-indigo-600 hover:text-indigo-800 p-1">
                  <RefreshCw size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">No hay notificaciones</p>}
      </div>
    </div>
  );
}
