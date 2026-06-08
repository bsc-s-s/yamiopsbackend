import * as service from './reservation.service.js';
import { success } from '../../shared/utils/response.js';

export async function list(req, res, next) {
  try {
    const reservations = await service.list(req.tenant_id, req.query);
    success(res, reservations);
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const reservation = await service.getById(req.params.id);
    success(res, reservation);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const reservation = await service.create({ ...req.body, tenant_id: req.tenant_id, created_by: req.user.id });
    success(res, reservation, 'Reserva creada', 201);
  } catch (err) { next(err); }
}

export async function checkin(req, res, next) {
  try {
    const reservation = await service.checkin(req.params.id);
    success(res, reservation, 'Check-in realizado');
  } catch (err) { next(err); }
}

export async function checkout(req, res, next) {
  try {
    const reservation = await service.checkout(req.params.id);
    success(res, reservation, 'Check-out realizado');
  } catch (err) { next(err); }
}

export async function cancel(req, res, next) {
  try {
    const reservation = await service.cancel(req.params.id);
    success(res, reservation, 'Reserva cancelada');
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const reservation = await service.updateReservation(req.params.id, req.body);
    success(res, reservation, 'Reserva actualizada');
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await service.remove(req.params.id);
    success(res, null, 'Reserva eliminada');
  } catch (err) { next(err); }
}

export async function getActive(req, res, next) {
  try {
    const reservations = await service.getActiveReservations(req.tenant_id);
    success(res, reservations);
  } catch (err) { next(err); }
}

export async function getTodayCheckouts(req, res, next) {
  try {
    const checkouts = await service.getTodayCheckouts(req.tenant_id);
    success(res, checkouts);
  } catch (err) { next(err); }
}
