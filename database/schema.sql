-- YAMI OPS SaaS v2.0 - Esquema Multi-tenant PostgreSQL
-- Ejecutar en Supabase SQL Editor

-- ===== EXTENSIONES =====
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== TENANTS (EMPRESAS) =====
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== USERS =====
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'reception' CHECK (role IN ('super_admin', 'admin', 'manager', 'reception', 'cleaning', 'maintenance', 'accounting')),
  phone TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

-- ===== PROPERTIES (ALOJAMIENTOS) =====
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'hostel' CHECK (type IN ('hotel', 'hostel', 'apartment', 'resort', 'cabin')),
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  check_in_time TIME DEFAULT '14:00',
  check_out_time TIME DEFAULT '12:00',
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== ROOMS (HABITACIONES) =====
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'double' CHECK (type IN ('single', 'double', 'suite', 'dormitory', 'family')),
  capacity INTEGER DEFAULT 2,
  price_per_night DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'cleaning', 'maintenance')),
  floor INTEGER DEFAULT 0,
  amenities JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== CUSTOMERS (HUÉSPEDES) =====
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  document_type TEXT DEFAULT 'dni' CHECK (document_type IN ('dni', 'passport', 'id')),
  document_number TEXT DEFAULT '',
  nationality TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== RESERVATIONS =====
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER DEFAULT 1,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
  total_amount DECIMAL(10,2) DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'web', 'booking', 'email', 'whatsapp', 'phone')),
  notes TEXT DEFAULT '',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== INCIDENTS =====
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  department TEXT DEFAULT 'maintenance' CHECK (department IN ('reception', 'cleaning', 'maintenance', 'administration')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== FINANCIAL RECORDS =====
CREATE TABLE IF NOT EXISTS financial_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT DEFAULT 'other' CHECK (category IN ('accommodation', 'restaurant', 'services', 'supplies', 'maintenance', 'cleaning', 'other')),
  description TEXT DEFAULT '',
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer', 'online')),
  reference TEXT DEFAULT '',
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== NOTIFICATIONS =====
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reservation_confirmation', 'checkin_reminder', 'checkout_reminder', 'incident_alert', 'payment_receipt', 'promotional', 'system')),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'push', 'in_app')),
  recipient TEXT NOT NULL,
  subject TEXT DEFAULT '',
  body TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== AUDIT LOGS =====
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'login', 'logout')),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== ÍNDICES =====
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_properties_tenant ON properties(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rooms_tenant ON rooms(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rooms_property ON rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_tenant ON reservations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_incidents_tenant ON incidents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents(priority);
CREATE INDEX IF NOT EXISTS idx_financial_tenant ON financial_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_financial_type ON financial_records(type);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);

-- ===== SEED: TENANT POR DEFECTO =====
INSERT INTO tenants (name, slug, plan) VALUES ('YAMI OPS', 'yami-ops', 'pro')
ON CONFLICT (slug) DO NOTHING;

-- ===== SEED: PROPIEDADES POR DEFECTO =====
INSERT INTO properties (tenant_id, name, type, check_in_time, check_out_time)
SELECT id, 'Cota 1600', 'hostel', '14:00', '12:00' FROM tenants WHERE slug = 'yami-ops'
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE name = 'Cota 1600');

INSERT INTO properties (tenant_id, name, type, check_in_time, check_out_time)
SELECT id, 'Cota 2000 - La Borda', 'cabin', '15:00', '11:00' FROM tenants WHERE slug = 'yami-ops'
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE name = 'Cota 2000 - La Borda');

-- ===== SEED: USUARIO ADMIN POR DEFECTO =====
-- Contraseña: admin123 (bcrypt hash)
INSERT INTO users (tenant_id, email, password_hash, name, role)
SELECT id, 'admin@yamiops.com', '$2a$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Qlq5GzGxYRy5Cq6q7q8q9q0q1q2', 'Admin YAMI', 'admin'
FROM tenants WHERE slug = 'yami-ops'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@yamiops.com');
