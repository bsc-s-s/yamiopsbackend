import { useState, useEffect } from 'react';
import { Building, Plus, Users, DoorOpen } from 'lucide-react';
import { tenants as api } from '../../services/api';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function TenantsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.list().then(r => setList(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
        <p className="text-sm text-gray-500 mt-1">Gestión multi-tenant</p>
      </div>

      <div className="grid gap-4">
        {list.map(t => (
          <div key={t.id} className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Building size={24} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{t.name}</h3>
                  <p className="text-xs text-gray-500">{t.email || t.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge label={t.plan} variant={t.plan} />
                <Badge label={t.is_active ? 'Activo' : 'Inactivo'} variant={t.is_active ? 'active' : 'inactive'} />
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-gray-500">
              <span>Slug: {t.slug}</span>
              <span>Creado: {new Date(t.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">No hay empresas registradas</p>}
      </div>
    </div>
  );
}
