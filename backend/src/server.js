import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { supabase, checkConnection } from './config/database.js';
import { error } from './shared/utils/response.js';

import authRoutes from './modules/auth/auth.routes.js';
import tenantRoutes from './modules/tenants/tenant.routes.js';
import propertyRoutes from './modules/properties/property.routes.js';
import reservationRoutes from './modules/reservations/reservation.routes.js';
import incidentRoutes from './modules/incidents/incident.routes.js';
import financeRoutes from './modules/finance/finance.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.set('trust proxy', 1);
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tenants', tenantRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/incidents', incidentRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.use((err, req, res, next) => {
  error(res, err);
});

const PORT = env.port;
app.listen(PORT, async () => {
  const connected = await checkConnection();
  console.log(`🚀 YAMI OPS SaaS v2.0.0 en puerto ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/v1/`);
  if (!connected) {
    console.log('⚠️  Ejecuta database/schema.sql en Supabase SQL Editor');
  }
});
