export const registerSchema = {
  body: {
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string', min: 6 },
    name: { required: true, type: 'string' },
    tenant_id: { required: true, type: 'string' },
    role: { required: false, type: 'string', enum: ['admin', 'manager', 'reception', 'cleaning', 'maintenance', 'accounting'] },
    phone: { required: false, type: 'string' },
  },
};

export const loginSchema = {
  body: {
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string' },
  },
};

export const changePasswordSchema = {
  body: {
    currentPassword: { required: true, type: 'string' },
    newPassword: { required: true, type: 'string', min: 6 },
  },
};
