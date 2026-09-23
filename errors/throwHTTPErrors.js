
export function throwBadRequestError(message = "Bad request") {
  const error = new Error(message);
  error.name = "BadRequestError";

  throw error;
}

export function throwBadRequestFieldError(field, message = "Bad request") {
  const error = new Error(message);
  error.field = field;
  error.name = "BadRequestFieldError";

  throw error;
}


export function throwConflictError(field, message = "Conflict") {
  const error = new Error(message);
  error.field = field;
  error.name = "ConflictError";

  throw error;
}

export function throwBadRequestMultiple(
  errors,
  message = "Los datos proporcionados no son válidos"
) {
  const error = new Error(message);
  error.errors = errors; // ya viene como [{ field, message }]
  error.name = "BadRequestErrorMultiple";
  throw error;
}

export function throwBadRequestErrorWithMultipleErrors(
  errors,
  message = "Los datos proporcionados no son válidos"
) {
  const uniqueErrors = [];
  const errorPaths = new Set();

  errors.array().forEach((error) => {
    const { path, msg } = error;

    if (!errorPaths.has(path)) {
      errorPaths.add(path);

      uniqueErrors.push({
        field: path,
        message: msg,
      });
    }
  });

  const error = new Error(message);
  error.errors = uniqueErrors;
  error.name = "BadRequestErrorMultiple";

  throw error;
}

export function throwUnauthorizedError(message = "No autorizado") {
  const error = new Error(message);
  error.name = "UnauthorizedError";

  throw error;
}

export function throwForbiddenError(message = "Acceso prohibido") {
  const error = new Error(message);
  error.name = "ForbiddenError";

  throw error;
}

export function throwGoneError(
  message = "El recurso solicitado ya no se encuentra disponible"
) {
  const error = new Error(message);
  error.name = "GoneError";

  throw error;
}

export function throwNotFoundError(message = "Recurso no encontrado") {
  const error = new Error(message);
  error.name = "NotFoundError";

  throw error;
}

export function throwServerError(
  message = "Se produjo un error interno del servidor. Por favor, inténtelo de nuevo más tarde."
) {
  const error = new Error(message);
  error.name = "ServerError";

  throw error;
}