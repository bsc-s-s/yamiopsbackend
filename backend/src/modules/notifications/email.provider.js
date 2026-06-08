import { env } from '../../config/env.js';

export async function sendEmail(to, subject, htmlBody) {
  if (!env.smtpHost || !env.smtpUser) {
    console.log('⚠️ Email no configurado. Mensaje no enviado:', { to, subject });
    return { success: false, error: 'Email no configurado' };
  }
  try {
    const { createTransport } = await import('nodemailer');
    const transporter = createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: { user: env.smtpUser, pass: env.smtpPass },
    });
    const info = await transporter.sendMail({
      from: env.emailFrom,
      to,
      subject,
      html: htmlBody,
    });
    console.log('✅ Email enviado a:', to);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Error Email:', err.message);
    return { success: false, error: err.message };
  }
}
