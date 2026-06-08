export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  RECEPTION: 'reception',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
  ACCOUNTING: 'accounting',
};

export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.ADMIN]: 80,
  [ROLES.MANAGER]: 60,
  [ROLES.RECEPTION]: 40,
  [ROLES.CLEANING]: 20,
  [ROLES.MAINTENANCE]: 20,
  [ROLES.ACCOUNTING]: 40,
};

export const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'],
  [ROLES.ADMIN]: [
    'tenants:read', 'tenants:write', 'tenants:delete',
    'users:read', 'users:write', 'users:delete',
    'properties:read', 'properties:write', 'properties:delete',
    'rooms:read', 'rooms:write', 'rooms:delete',
    'reservations:read', 'reservations:write', 'reservations:delete',
    'incidents:read', 'incidents:write', 'incidents:delete',
    'finance:read', 'finance:write', 'finance:delete',
    'notifications:read', 'notifications:write',
    'dashboard:read',
  ],
  [ROLES.MANAGER]: [
    'tenants:read',
    'users:read',
    'properties:read', 'properties:write',
    'rooms:read', 'rooms:write',
    'reservations:read', 'reservations:write',
    'incidents:read', 'incidents:write',
    'finance:read', 'finance:write',
    'notifications:read',
    'dashboard:read',
  ],
  [ROLES.RECEPTION]: [
    'properties:read',
    'rooms:read', 'rooms:write',
    'reservations:read', 'reservations:write',
    'incidents:read', 'incidents:write',
    'finance:read',
    'dashboard:read',
  ],
  [ROLES.CLEANING]: [
    'rooms:read',
    'incidents:read', 'incidents:write',
    'dashboard:read',
  ],
  [ROLES.MAINTENANCE]: [
    'rooms:read',
    'incidents:read', 'incidents:write',
    'dashboard:read',
  ],
  [ROLES.ACCOUNTING]: [
    'finance:read', 'finance:write',
    'reservations:read',
    'dashboard:read',
  ],
};
