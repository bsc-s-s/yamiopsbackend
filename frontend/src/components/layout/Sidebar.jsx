import { useState } from 'react';
import {
  LayoutDashboard, Building2, CalendarCheck, AlertTriangle, DollarSign,
  Bell, Users, Settings, LogOut, ChevronLeft, Menu, Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, perm: 'dashboard:read' },
  { id: 'properties', label: 'Alojamientos', icon: Building2, perm: 'properties:read' },
  { id: 'reservations', label: 'Reservas', icon: CalendarCheck, perm: 'reservations:read' },
  { id: 'incidents', label: 'Incidencias', icon: AlertTriangle, perm: 'incidents:read' },
  { id: 'finance', label: 'Económico', icon: DollarSign, perm: 'finance:read' },
  { id: 'notifications', label: 'Notificaciones', icon: Bell, perm: 'notifications:read' },
  { id: 'users', label: 'Usuarios', icon: Users, perm: 'users:read' },
  { id: 'tenants', label: 'Empresas', icon: Building, perm: 'tenants:read' },
];

export default function Sidebar({ currentView, onNavigate, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, hasPermission } = useAuth();

  const visibleItems = navItems.filter(item => hasPermission(item.perm));

  return (
    <div className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-200 z-50 flex flex-col ${collapsed ? 'w-16' : 'w-56'}`}>
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        {!collapsed && <span className="font-bold text-sm">YAMI OPS</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-gray-700 rounded-lg">
          {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {visibleItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              currentView === item.id ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
            title={collapsed ? item.label : ''}
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-2 border-t border-gray-700">
        {!collapsed && user && (
          <div className="px-3 py-2 text-xs text-gray-400 truncate">
            <div className="font-medium text-gray-200">{user.name}</div>
            <div>{user.email}</div>
            <div className="capitalize">{user.role}</div>
          </div>
        )}
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-colors">
          <LogOut size={18} />
          {!collapsed && <span>Salir</span>}
        </button>
      </div>
    </div>
  );
}
