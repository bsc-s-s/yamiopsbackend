import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { checkConnection } from './config/database.js';
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

app.get('/api/v1/health', async (req, res) => {
  let dbStatus = 'untested';
  try {
    const { error } = await supabase.from('tenants').select('id', { count: 'exact', head: true });
    dbStatus = error ? `error: ${error.message}` : 'connected';
  } catch (e) {
    dbStatus = `error: ${e.message}`;
  }
  res.json({ status: 'ok', version: '2.0.0', db: dbStatus, timestamp: new Date().toISOString() });
});

app.get('/api/v1/debug', async (req, res) => {
  const result = { keys: {}, db: {} };
  result.keys.supabaseUrl = process.env.SUPABASE_URL ? 'set' : 'missing';
  result.keys.supabaseKey = process.env.SUPABASE_ANON_KEY ? 'set' : 'missing';
  result.keys.jwtSecret = process.env.JWT_SECRET ? 'set' : 'missing';
  try {
    const { data, error } = await supabase.from('users').select('email').eq('email', 'admin@yamiops.com');
    result.db.findUser = error ? `error: ${error.message}` : `found: ${data?.length || 0}`;
  } catch (e) {
    result.db.findUser = `error: ${e.message}`;
  }
  res.json(result);
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
