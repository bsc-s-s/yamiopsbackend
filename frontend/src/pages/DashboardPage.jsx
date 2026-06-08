import { useState, useEffect } from 'react';
import { Building2, BedDouble, AlertTriangle, DollarSign, CalendarCheck, CheckSquare } from 'lucide-react';
import { dashboard as dashboardApi } from '../services/api';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const statusIcons = { available: '🟢', occupied: '🟠', cleaning: '🟡', maintenance: '⚪' };

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.resume().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  const d = data?.occupancy;
  const total = d?.total || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen operativo del día</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Ocupación" value={`${d?.rate || 0}%`} sub={`${d?.occupied || 0} de ${total} hab`} icon={BedDouble} color="blue" />
        <StatCard label="Ingresos hoy" value={`€${data?.finance?.incomeToday || 0}`} sub={`Gastos: €${data?.finance?.expenseToday || 0}`} icon={DollarSign} color="green" />
        <StatCard label="Incidencias" value={data?.incidents?.open || 0} sub={`Críticas: ${data?.incidents?.critical || 0}`} icon={AlertTriangle} color="red" />
        <StatCard label="Reservas activas" value={data?.reservations?.active || 0} icon={CalendarCheck} color="pink" />
      </div>

      {total > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Estado de habitaciones</h3>
          <div className="flex gap-4 text-sm">
            <span>{statusIcons.available} {d?.available || 0} disponibles</span>
            <span>{statusIcons.occupied} {d?.occupied || 0} ocupadas</span>
            <span>{statusIcons.cleaning} {d?.cleaning || 0} en limpieza</span>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden flex">
            <div className="bg-green-500 h-full transition-all" style={{ width: `${((d?.available || 0) / total) * 100}%` }} />
            <div className="bg-orange-500 h-full transition-all" style={{ width: `${((d?.occupied || 0) / total) * 100}%` }} />
            <div className="bg-yellow-500 h-full transition-all" style={{ width: `${((d?.cleaning || 0) / total) * 100}%` }} />
          </div>
        </div>
      )}

      {data?.recentActivity?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Actividad reciente</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {data.recentActivity.map((r, i) => (
              <div key={r.id || i} className="p-4 flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900 text-sm">{r.customers?.name || 'Huésped'}</span>
                  <span className="text-xs text-gray-500 ml-2">{r.check_in} → {r.check_out}</span>
                </div>
                <Badge label={r.status} variant={r.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.incidents?.byDepartment && Object.keys(data.incidents.byDepartment).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Incidencias por departamento</h3>
          <div className="space-y-2">
            {Object.entries(data.incidents.byDepartment).map(([dept, count]) => (
              <div key={dept} className="flex items-center justify-between text-sm">
                <span className="capitalize text-gray-700">{dept === 'maintenance' ? 'Mantenimiento' : dept === 'cleaning' ? 'Limpieza' : dept === 'reception' ? 'Recepción' : dept}</span>
                <Badge label={String(count)} variant={count > 2 ? 'high' : 'medium'} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
