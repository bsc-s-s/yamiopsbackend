import * as repo from './reservation.repository.js';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError.js';
import { supabase } from '../../config/database.js';

export async function list(tenantId, filters = {}) {
  return repo.findAllByTenant(tenantId, filters);
}

export async function getById(id) {
  const reservation = await repo.findById(id);
  if (!reservation) throw new NotFoundError('Reserva no encontrada');
  return reservation;
}

export async function create(data) {
  const room = await supabase
    .from('rooms')
    .select('status')
    .eq('id', data.room_id)
    .single();

  if (room.data && room.data.status === 'occupied') {
    throw new ConflictError('La habitación ya está ocupada en esas fechas');
  }

  const reservation = await repo.create({
    tenant_id: data.tenant_id,
    property_id: data.property_id,
    customer_id: data.customer_id,
    room_id: data.room_id,
    check_in: data.check_in,
    check_out: data.check_out,
    guests: data.guests || 1,
    status: 'confirmed',
    total_amount: data.total_amount || 0,
    paid_amount: data.paid_amount || 0,
    source: data.source || 'manual',
    notes: data.notes || '',
    created_by: data.created_by,
  });

  if (reservation.status === 'confirmed') {
    await supabase
      .from('rooms')
      .update({ status: 'occupied' })
      .eq('id', data.room_id);
  }

  return reservation;
}

export async function checkin(id) {
  const reservation = await getById(id);
  if (reservation.status !== 'confirmed') {
    throw new ConflictError('La reserva debe estar confirmada para hacer check-in');
  }
  const updated = await repo.update(id, { status: 'checked_in' });
  await supabase.from('rooms').update({ status: 'occupied' }).eq('id', reservation.room_id);
  return updated;
}

export async function checkout(id) {
  const reservation = await getById(id);
  if (reservation.status !== 'checked_in') {
    throw new ConflictError('La reserva debe estar en check-in para hacer checkout');
  }
  const updated = await repo.update(id, { status: 'checked_out' });
  await supabase.from('rooms').update({ status: 'cleaning' }).eq('id', reservation.room_id);
  return updated;
}

export async function cancel(id) {
  const reservation = await getById(id);
  if (['checked_out', 'cancelled'].includes(reservation.status)) {
    throw new ConflictError('No se puede cancelar una reserva ya finalizada');
  }
  const updated = await repo.update(id, { status: 'cancelled' });
  await supabase.from('rooms').update({ status: 'available' }).eq('id', reservation.room_id);
  return updated;
}

export async function updateReservation(id, data) {
  await getById(id);
  return repo.update(id, data);
}

export async function remove(id) {
  await getById(id);
  return repo.remove(id);
}

export async function getActiveReservations(tenantId) {
  return repo.findActiveByTenant(tenantId);
}

export async function getTodayCheckouts(tenantId) {
  return repo.findTodayCheckouts(tenantId);
}
