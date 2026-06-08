import * as repo from './property.repository.js';
import { NotFoundError } from '../../shared/errors/AppError.js';

export async function listProperties(tenantId) {
  return repo.findAllByTenant(tenantId);
}

export async function getProperty(id) {
  const property = await repo.findById(id);
  if (!property) throw new NotFoundError('Alojamiento no encontrado');
  return property;
}

export async function createProperty(data) {
  return repo.create({
    tenant_id: data.tenant_id,
    name: data.name,
    type: data.type || 'hostel',
    address: data.address || '',
    phone: data.phone || '',
    email: data.email || '',
    check_in_time: data.check_in_time || '14:00',
    check_out_time: data.check_out_time || '12:00',
    is_active: true,
    settings: data.settings || {},
  });
}

export async function updateProperty(id, data) {
  await getProperty(id);
  return repo.update(id, data);
}

export async function removeProperty(id) {
  await getProperty(id);
  return repo.remove(id);
}

export async function listRooms(propertyId) {
  return repo.findRoomsByProperty(propertyId);
}

export async function getRoom(id) {
  const room = await repo.findRoomById(id);
  if (!room) throw new NotFoundError('Habitación no encontrada');
  return room;
}

export async function createRoom(data) {
  return repo.createRoom({
    tenant_id: data.tenant_id,
    property_id: data.property_id,
    name: data.name,
    type: data.type || 'double',
    capacity: data.capacity || 2,
    price_per_night: data.price_per_night || 0,
    status: 'available',
    floor: data.floor || 0,
    amenities: data.amenities || [],
    is_active: true,
  });
}

export async function updateRoom(id, data) {
  await getRoom(id);
  return repo.updateRoom(id, data);
}

export async function changeRoomStatus(id, status) {
  await getRoom(id);
  const validStatuses = ['available', 'occupied', 'cleaning', 'maintenance'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Estado inválido. Válidos: ${validStatuses.join(', ')}`);
  }
  return repo.updateRoomStatus(id, status);
}
