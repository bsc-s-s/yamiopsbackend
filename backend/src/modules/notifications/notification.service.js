import * as repo from './notification.repository.js';
import { sendWhatsApp } from './whatsapp.provider.js';
import { sendEmail } from './email.provider.js';

export async function list(tenantId, filters = {}) {
  return repo.findAllByTenant(tenantId, filters);
}

export async function create(data) {
  return repo.create({
    tenant_id: data.tenant_id,
    type: data.type,
    channel: data.channel,
    recipient: data.recipient,
    subject: data.subject || '',
    body: data.body,
    status: 'pending',
  });
}

export async function send(data) {
  const notification = await repo.create({
    tenant_id: data.tenant_id,
    type: data.type,
    channel: data.channel,
    recipient: data.recipient,
    subject: data.subject || '',
    body: data.body,
    status: 'sending',
  });

  let result;
  if (data.channel === 'whatsapp') {
    result = await sendWhatsApp(data.recipient, data.body);
  } else if (data.channel === 'email') {
    result = await sendEmail(data.recipient, data.subject, data.body);
  } else {
    result = { success: false, error: `Canal no soportado: ${data.channel}` };
  }

  const status = result.success ? 'sent' : 'failed';
  await repo.update(notification.id, { status, sent_at: result.success ? new Date().toISOString() : null });

  return { ...notification, status, delivery: result };
}

export async function sendReservationConfirmation(tenantId, reservation, customer) {
  const message = `✅ *Reserva Confirmada*\n\nHola ${customer.name}, tu reserva en ${reservation.property_name} está confirmada.\n\n📅 Entrada: ${reservation.check_in}\n📅 Salida: ${reservation.check_out}\n🛏️ Habitación: ${reservation.room_name}\n💰 Total: €${reservation.total_amount}\n\nGracias por confiar en nosotros.`;

  if (customer.phone) {
    await send({ tenant_id: tenantId, type: 'reservation_confirmation', channel: 'whatsapp', recipient: customer.phone, subject: 'Reserva Confirmada', body: message });
  }
  if (customer.email) {
    const html = `<h2>Reserva Confirmada</h2><p>Hola ${customer.name},</p><p>Tu reserva está confirmada.</p><ul><li>Entrada: ${reservation.check_in}</li><li>Salida: ${reservation.check_out}</li><li>Total: €${reservation.total_amount}</li></ul>`;
    await send({ tenant_id: tenantId, type: 'reservation_confirmation', channel: 'email', recipient: customer.email, subject: 'Reserva Confirmada - YAMI OPS', body: html });
  }
}

export async function sendIncidentAlert(tenantId, incident, propertyName) {
  const levels = { critical: '🚨 *CRÍTICA*', high: '⚠️ *Alta*', medium: '📋 *Media*', low: 'ℹ️ *Baja*' };
  const message = `${levels[incident.priority] || '📋 Incidencia'}\n\n${incident.title}\n${incident.description || ''}\n\n📍 ${propertyName}\n🔧 ${incident.department}`;

  const { supabase } = await import('../../config/database.js');
  const { data: managers } = await supabase
    .from('users')
    .select('phone, email')
    .eq('tenant_id', tenantId)
    .in('role', ['admin', 'manager']);

  for (const user of managers || []) {
    if (user.phone) {
      await send({ tenant_id: tenantId, type: 'incident_alert', channel: 'whatsapp', recipient: user.phone, subject: `Incidencia: ${incident.title}`, body: message });
    }
    if (user.email) {
      await send({ tenant_id: tenantId, type: 'incident_alert', channel: 'email', recipient: user.email, subject: `🚨 Incidencia ${incident.priority}: ${incident.title}`, body: message });
    }
  }
}

export async function retryFailed(id) {
  const notification = await repo.findById(id);
  if (!notification || notification.status !== 'failed') {
    throw new Error('Notificación no encontrada o no está en estado failed');
  }
  return send({
    tenant_id: notification.tenant_id,
    type: notification.type,
    channel: notification.channel,
    recipient: notification.recipient,
    subject: notification.subject,
    body: notification.body,
  });
}
