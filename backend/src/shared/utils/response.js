export function success(res, data = null, mensaje = 'OK', statusCode = 200) {
  return res.status(statusCode).json({ success: true, mensaje, data });
}

export function paginated(res, data, total, page, limit) {
  return res.status(200).json({
    success: true,
    data,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
}

export function error(res, err) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.isOperational ? err.message : `[${err.constructor?.name}] ${err.message}`;
  if (!err.isOperational) {
    console.error('ERROR:', err);
  }
  return res.status(statusCode).json({ success: false, error: { code, message } });
}
