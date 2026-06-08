import * as service from './property.service.js';
import { success } from '../../shared/utils/response.js';

export async function listProperties(req, res, next) {
  try {
    const properties = await service.listProperties(req.tenant_id);
    success(res, properties);
  } catch (err) { next(err); }
}

export async function getProperty(req, res, next) {
  try {
    const property = await service.getProperty(req.params.id);
    success(res, property);
  } catch (err) { next(err); }
}

export async function createProperty(req, res, next) {
  try {
    const property = await service.createProperty({ ...req.body, tenant_id: req.tenant_id });
    success(res, property, 'Alojamiento creado', 201);
  } catch (err) { next(err); }
}

export async function updateProperty(req, res, next) {
  try {
    const property = await service.updateProperty(req.params.id, req.body);
    success(res, property, 'Alojamiento actualizado');
  } catch (err) { next(err); }
}

export async function removeProperty(req, res, next) {
  try {
    await service.removeProperty(req.params.id);
    success(res, null, 'Alojamiento eliminado');
  } catch (err) { next(err); }
}

export async function listRooms(req, res, next) {
  try {
    const rooms = await service.listRooms(req.params.propertyId);
    success(res, rooms);
  } catch (err) { next(err); }
}

export async function getRoom(req, res, next) {
  try {
    const room = await service.getRoom(req.params.roomId);
    success(res, room);
  } catch (err) { next(err); }
}

export async function createRoom(req, res, next) {
  try {
    const room = await service.createRoom({ ...req.body, tenant_id: req.tenant_id });
    success(res, room, 'Habitación creada', 201);
  } catch (err) { next(err); }
}

export async function updateRoom(req, res, next) {
  try {
    const room = await service.updateRoom(req.params.roomId, req.body);
    success(res, room, 'Habitación actualizada');
  } catch (err) { next(err); }
}

export async function changeRoomStatus(req, res, next) {
  try {
    const room = await service.changeRoomStatus(req.params.roomId, req.body.status);
    success(res, room, 'Estado actualizado');
  } catch (err) { next(err); }
}
