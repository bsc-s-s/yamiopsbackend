import { ValidationError } from '../shared/errors/AppError.js';

export function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    if (schema.body && req.body) {
      for (const [field, rules] of Object.entries(schema.body)) {
        const value = req.body[field];
        if (rules.required && (value === undefined || value === null || value === '')) {
          errors.push(`${field} es requerido`);
          continue;
        }
        if (value !== undefined && value !== null && value !== '') {
          if (rules.type === 'string' && typeof value !== 'string') {
            errors.push(`${field} debe ser texto`);
          }
          if (rules.type === 'number' && isNaN(Number(value))) {
            errors.push(`${field} debe ser numérico`);
          }
          if (rules.min !== undefined && Number(value) < rules.min) {
            errors.push(`${field} debe ser mayor o igual a ${rules.min}`);
          }
          if (rules.max !== undefined && Number(value) > rules.max) {
            errors.push(`${field} debe ser menor o igual a ${rules.max}`);
          }
          if (rules.enum && !rules.enum.includes(value)) {
            errors.push(`${field} debe ser uno de: ${rules.enum.join(', ')}`);
          }
        }
      }
    }
    if (errors.length > 0) {
      return next(new ValidationError(errors.join('; ')));
    }
    next();
  };
}
