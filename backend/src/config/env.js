import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT, 10) || 3001,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
  jwtSecret: process.env.JWT_SECRET || 'yami-ops-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  redisUrl: process.env.REDIS_URL,
  sentryDsn: process.env.SENTRY_DSN,
  whatsappApiKey: process.env.WHATSAPP_API_KEY,
  whatsappPhoneNumber: process.env.WHATSAPP_PHONE_NUMBER,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT, 10) || 587,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  emailFrom: process.env.EMAIL_FROM || 'noreply@yamiops.com',
};
