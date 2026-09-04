export function respuestaExitosa(res, statusCode, message, data = null) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

export function respuestaError(res, statusCode, message, error = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    error
  });
}