# YAMI OPS SaaS - Arquitectura del Sistema

## Visión General

Plataforma SaaS multi-tenant para gestión de hostelería, alojamientos turísticos y operaciones empresariales.

## Stack Tecnológico

- **Frontend:** React 18 + Vite + TailwindCSS + React Router v6
- **Backend:** Node.js + Express + Arquitectura modular por dominios
- **Base de Datos:** Supabase PostgreSQL con Row Level Security
- **Cache/Colas:** Redis + BullMQ (fase 2)
- **WebSockets:** Socket.io para eventos en tiempo real
- **Notificaciones:** Twilio/Meta WhatsApp API + SendGrid/SMTP
- **Monitoreo:** Sentry + Logging estructurado

## Estructura del Backend

```
backend/
├── src/
│   ├── config/              # Configuración global
│   │   ├── database.js      # Conexión Supabase
│   │   ├── redis.js         # Conexión Redis
│   │   └── env.js           # Variables de entorno
│   ├── middleware/
│   │   ├── auth.js          # Verificación JWT
│   │   ├── tenant.js        # Aislamiento multi-tenant
│   │   ├── rbac.js          # Control de roles
│   │   ├── validate.js      # Validación de inputs
│   │   └── rateLimit.js     # Rate limiting
│   ├── modules/
│   │   ├── auth/            # Autenticación y usuarios
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.repository.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.schema.js
│   │   ├── tenants/         # Gestión multi-empresa
│   │   │   ├── tenant.controller.js
│   │   │   ├── tenant.service.js
│   │   │   ├── tenant.repository.js
│   │   │   └── tenant.routes.js
│   │   ├── properties/      # Alojamientos y habitaciones
│   │   │   ├── property.controller.js
│   │   │   ├── property.service.js
│   │   │   ├── property.repository.js
│   │   │   └── property.routes.js
│   │   ├── reservations/    # Reservas y check-in/out
│   │   │   ├── reservation.controller.js
│   │   │   ├── reservation.service.js
│   │   │   ├── reservation.repository.js
│   │   │   └── reservation.routes.js
│   │   ├── incidents/       # Incidencias operativas
│   │   │   ├── incident.controller.js
│   │   │   ├── incident.service.js
│   │   │   ├── incident.repository.js
│   │   │   └── incident.routes.js
│   │   ├── finance/         # Control económico
│   │   │   ├── finance.controller.js
│   │   │   ├── finance.service.js
│   │   │   ├── finance.repository.js
│   │   │   └── finance.routes.js
│   │   ├── notifications/   # WhatsApp + Email + Alertas
│   │   │   ├── notification.controller.js
│   │   │   ├── notification.service.js
│   │   │   ├── notification.repository.js
│   │   │   ├── whatsapp.provider.js
│   │   │   ├── email.provider.js
│   │   │   └── notification.routes.js
│   │   └── dashboard/       # Dashboard y métricas
│   │       ├── dashboard.controller.js
│   │       ├── dashboard.service.js
│   │       └── dashboard.routes.js
│   ├── shared/
│   │   ├── errors/          # Manejo de errores
│   │   ├── utils/           # Utilidades comunes
│   │   └── constants/       # Constantes del sistema
│   └── server.js            # Punto de entrada
├── package.json
└── .env
```

## Estructura del Frontend

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── ui/              # Botones, inputs, modales, tabs
│   │   ├── layout/          # Sidebar, header, layouts por rol
│   │   └── charts/          # Gráficos y visualizaciones
│   ├── pages/               # Páginas por módulo
│   │   ├── auth/            # Login, registro, recuperación
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── properties/      # Gestión de alojamientos
│   │   ├── reservations/    # Gestión de reservas
│   │   ├── incidents/       # Gestión de incidencias
│   │   ├── finance/         # Control económico
│   │   ├── tenants/         # Configuración empresa (admin)
│   │   └── notifications/   # Centro de notificaciones
│   ├── hooks/               # Custom hooks
│   ├── services/            # API client
│   ├── context/             # Auth context, tenant context
│   ├── utils/               # Utilidades
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

## Modelo de Base de Datos (Multi-tenant)

### Tabla: tenants
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| name | TEXT | Nombre empresa |
| slug | TEXT UNIQUE | Identificador URL |
| email | TEXT | Email contacto |
| phone | TEXT | Teléfono |
| plan | TEXT | free, starter, pro, enterprise |
| is_active | BOOLEAN | |
| settings | JSONB | Configuración específica |
| created_at | TIMESTAMPTZ | |

### Tabla: users
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| tenant_id | UUID FK → tenants | Aislamiento multi-tenant |
| email | TEXT | |
| password_hash | TEXT | |
| name | TEXT | |
| role | TEXT | admin, manager, reception, cleaning, maintenance |
| is_active | BOOLEAN | |
| phone | TEXT | |
| created_at | TIMESTAMPTZ | |

### Tabla: properties (Alojamientos)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| tenant_id | UUID FK → tenants | |
| name | TEXT | Ej: "Cota 1600", "La Borda" |
| type | TEXT | hotel, hostel, apartment, resort |
| address | TEXT | |
| phone | TEXT | |
| email | TEXT | |
| check_in_time | TIME | |
| check_out_time | TIME | |
| is_active | BOOLEAN | |
| settings | JSONB | |

### Tabla: rooms
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| tenant_id | UUID FK → tenants | |
| property_id | UUID FK → properties | |
| name | TEXT | "101", "Suite Presidente" |
| type | TEXT | single, double, suite, dormitory |
| capacity | INTEGER | |
| price_per_night | DECIMAL | |
| status | TEXT | available, occupied, cleaning, maintenance |
| floor | INTEGER | |
| amenities | JSONB | |
| is_active | BOOLEAN | |

### Tabla: customers
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| tenant_id | UUID FK → tenants | |
| name | TEXT | |
| email | TEXT | |
| phone | TEXT | |
| document_type | TEXT | passport, id, dni |
| document_number | TEXT | |
| nationality | TEXT | |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |

### Tabla: reservations
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| tenant_id | UUID FK → tenants | |
| property_id | UUID FK → properties | |
| customer_id | UUID FK → customers | |
| room_id | UUID FK → rooms | |
| check_in | DATE | |
| check_out | DATE | |
| guests | INTEGER | |
| status | TEXT | confirmed, checked_in, checked_out, cancelled, no_show |
| total_amount | DECIMAL | |
| paid_amount | DECIMAL | |
| source | TEXT | manual, web, booking, email, whatsapp |
| notes | TEXT | |
| created_by | UUID FK → users | |
| created_at | TIMESTAMPTZ | |

### Tabla: incidents
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| tenant_id | UUID FK → tenants | |
| property_id | UUID FK → properties | |
| room_id | UUID FK → rooms (nullable) | |
| title | TEXT | |
| description | TEXT | |
| priority | TEXT | low, medium, high, critical |
| status | TEXT | open, in_progress, resolved, closed |
| department | TEXT | reception, cleaning, maintenance, administration |
| assigned_to | UUID FK → users (nullable) | |
| reported_by | UUID FK → users | |
| resolved_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

### Tabla: financial_records
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| tenant_id | UUID FK → tenants | |
| property_id | UUID FK → properties | |
| type | TEXT | income, expense |
| category | TEXT | accommodation, restaurant, services, supplies |
| description | TEXT | |
| amount | DECIMAL | |
| payment_method | TEXT | cash, card, transfer |
| reference | TEXT | |
| reservation_id | UUID FK → reservations (nullable) | |
| recorded_by | UUID FK → users | |
| recorded_at | TIMESTAMPTZ | |

### Tabla: notifications
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| tenant_id | UUID FK → tenants | |
| type | TEXT | whatsapp, email, push, in_app |
| channel | TEXT | |
| recipient | TEXT | email o teléfono |
| subject | TEXT | |
| body | TEXT | |
| status | TEXT | pending, sent, failed |
| sent_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

### Tabla: audit_logs
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| tenant_id | UUID FK → tenants | |
| user_id | UUID FK → users | |
| action | TEXT | create, update, delete |
| entity_type | TEXT | reservation, incident, room, etc. |
| entity_id | UUID | |
| old_values | JSONB | |
| new_values | JSONB | |
| ip_address | TEXT | |
| created_at | TIMESTAMPTZ | |

## Flujo de Reservas

1. Cliente llega (walk-in) o reserva online
2. Recepción crea reserva → estado: confirmed
3. Sistema envía confirmación por WhatsApp/Email
4. Día del check-in: recepción hace check-in → estado: checked_in
5. Sistema asigna tarea de limpieza automática
6. Día del check-out: recepción hace check-out → estado: checked_out
7. Habitación pasa a limpieza → status: cleaning
8. Limpieza completa → status: available
9. Sistema envía encuesta/feedback

## Flujo de Incidencias

1. Empleado reporta incidencia → estado: open
2. Sistema asigna automáticamente al departamento correspondiente
3. Si es crítica → notificación vía WhatsApp a responsable
4. Departamento recibe alerta en tiempo real (WebSocket)
5. Técnico cambia estado a in_progress
6. Técnico resuelve → estado: resolved
7. Supervisor cierra → estado: closed

## Roadmap de Implementación

### FASE 1 (Semana 1-2) - Base SaaS
- [x] Backend funcional con Express
- [x] Base de datos Supabase
- [ ] Modelo multi-tenant con tenant_id
- [ ] Autenticación JWT + RBAC
- [ ] Migración de esquema completo
- [ ] Dashboard multi-empresa

### FASE 2 (Semana 3-4) - Módulos Core
- [ ] Módulo Properties + Rooms CRUD
- [ ] Módulo Reservas + Check-in/out
- [ ] Módulo Incidencias con asignación
- [ ] Módulo Financiero
- [ ] Frontend por roles

### FASE 3 (Semana 5-6) - Notificaciones
- [ ] Integración WhatsApp API
- [ ] Integración Email/SendGrid
- [ ] Sistema de alertas inteligentes
- [ ] Plantillas de mensajes

### FASE 4 (Semana 7-8) - Tiempo Real
- [ ] WebSockets (Socket.io)
- [ ] Redis Cache
- [ ] Colas de trabajo (BullMQ)
- [ ] Dashboard en tiempo real

### FASE 5 (Semana 9-10) - Escalabilidad
- [ ] Rate limiting avanzado
- [ ] Monitoreo (Sentry)
- [ ] Logging estructurado
- [ ] Tests automatizados
- [ ] CI/CD completo
