import { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    const { user: userData, accessToken, refreshToken } = res.data.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('tenant_id', userData.tenant_id);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant_id');
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    const permissions = {
      super_admin: ['*'],
      admin: ['*'],
      manager: ['dashboard:read', 'properties:read', 'properties:write', 'rooms:read', 'rooms:write', 'reservations:read', 'reservations:write', 'incidents:read', 'incidents:write', 'finance:read', 'finance:write', 'notifications:read'],
      reception: ['dashboard:read', 'properties:read', 'rooms:read', 'rooms:write', 'reservations:read', 'reservations:write', 'incidents:read', 'incidents:write', 'finance:read'],
      cleaning: ['dashboard:read', 'rooms:read', 'incidents:read', 'incidents:write'],
      maintenance: ['dashboard:read', 'rooms:read', 'incidents:read', 'incidents:write'],
      accounting: ['dashboard:read', 'finance:read', 'finance:write', 'reservations:read'],
    };
    const userPerms = permissions[user.role] || [];
    return userPerms.includes('*') || userPerms.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
