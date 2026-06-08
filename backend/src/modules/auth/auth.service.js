import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../shared/errors/AppError.js';
import * as repo from './auth.repository.js';

function generateTokens(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    tenant_id: user.tenant_id,
    name: user.name,
  };
  const accessToken = jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  const refreshToken = jwt.sign({ id: user.id }, env.jwtSecret + '_refresh', { expiresIn: env.jwtRefreshExpiresIn });
  return { accessToken, refreshToken };
}

export async function register(userData) {
  const existing = await repo.findUserByEmail(userData.email);
  if (existing) throw new ConflictError('Email ya registrado');
  const passwordHash = await bcrypt.hash(userData.password, 12);
  const user = await repo.createUser({
    tenant_id: userData.tenant_id,
    email: userData.email.toLowerCase(),
    password_hash: passwordHash,
    name: userData.name,
    role: userData.role || 'reception',
    phone: userData.phone || '',
    is_active: true,
  });
  const tokens = generateTokens(user);
  const { password_hash, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, ...tokens };
}

export async function login(email, password) {
  const user = await repo.findUserByEmail(email);
  if (!user) throw new UnauthorizedError('Credenciales inválidas');
  if (!user.is_active) throw new UnauthorizedError('Usuario desactivado');
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new UnauthorizedError('Credenciales inválidas');
  const tokens = generateTokens(user);
  const { password_hash, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, ...tokens };
}

export async function getProfile(userId) {
  const user = await repo.findUserById(userId);
  if (!user) throw new NotFoundError('Usuario no encontrado');
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function updateProfile(userId, updates) {
  const allowedFields = ['name', 'phone'];
  const filtered = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) filtered[key] = updates[key];
  }
  const user = await repo.updateUser(userId, filtered);
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await repo.findUserById(userId);
  if (!user) throw new NotFoundError('Usuario no encontrado');
  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) throw new UnauthorizedError('Contraseña actual incorrecta');
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await repo.updateUser(userId, { password_hash: passwordHash });
  return true;
}
