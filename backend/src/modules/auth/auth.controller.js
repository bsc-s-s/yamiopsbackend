import * as service from './auth.service.js';
import { success } from '../../shared/utils/response.js';

export async function register(req, res, next) {
  try {
    const result = await service.register(req.body);
    success(res, result, 'Usuario registrado correctamente', 201);
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await service.login(email, password);
    success(res, result, 'Inicio de sesión correcto');
  } catch (err) { next(err); }
}

export async function profile(req, res, next) {
  try {
    const user = await service.getProfile(req.user.id);
    success(res, user);
  } catch (err) { next(err); }
}

export async function updateProfile(req, res, next) {
  try {
    const user = await service.updateProfile(req.user.id, req.body);
    success(res, user, 'Perfil actualizado');
  } catch (err) { next(err); }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    await service.changePassword(req.user.id, currentPassword, newPassword);
    success(res, null, 'Contraseña cambiada correctamente');
  } catch (err) { next(err); }
}

export async function listUsers(req, res, next) {
  try {
    const { supabase } = await import('../../config/database.js');
    const { data } = await supabase
      .from('users')
      .select('id, name, email, role, phone, is_active, created_at')
      .eq('tenant_id', req.tenant_id)
      .order('name');
    success(res, data || []);
  } catch (err) { next(err); }
}
