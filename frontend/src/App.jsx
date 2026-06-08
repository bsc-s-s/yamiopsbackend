import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './pages/DashboardPage';
import PropertiesPage from './pages/properties/PropertiesPage';
import ReservationsPage from './pages/reservations/ReservationsPage';
import IncidentsPage from './pages/incidents/IncidentsPage';
import FinancePage from './pages/finance/FinancePage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import UsersPage from './pages/users/UsersPage';
import TenantsPage from './pages/tenants/TenantsPage';
import LoginPage from './pages/auth/LoginPage';

const pages = {
  dashboard: DashboardPage,
  properties: PropertiesPage,
  reservations: ReservationsPage,
  incidents: IncidentsPage,
  finance: FinancePage,
  notifications: NotificationsPage,
  users: UsersPage,
  tenants: TenantsPage,
};

export default function App() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (!user) return <LoginPage />;

  const PageComponent = pages[currentView] || DashboardPage;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} onLogout={logout} />
      <main className="ml-56 p-6 min-h-screen">
        <PageComponent />
      </main>
    </div>
  );
}
