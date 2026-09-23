import handleHTTPThrowErrors from "./handleHTTPThrowErrors.js";

const handleErrorResponse = (err, req, res, next) => {
  let errorObject;


  if (err.type === "entity.parse.failed") {
    errorObject = handleHTTPThrowErrors.handleBadRequestError(
      "JSON inválido o vacío"
    );

    return res.status(errorObject.statusCode).json(errorObject);
  }

  if (err.code) {
    switch (err.code) {
      case "23505":
        errorObject = handleHTTPThrowErrors.handleConflictError(
          "Ya existe un registro con estos datos."
        );

        return res.status(errorObject.statusCode).json(errorObject);

      case "23503":
        errorObject = handleHTTPThrowErrors.handleBadRequestError(
          "Referencia inválida (foreign key)."
        );

        return res.status(errorObject.statusCode).json(errorObject);
    }
  }

  switch (err.name) {
    case "BadRequestError":
      errorObject = handleHTTPThrowErrors.handleBadRequestError(err.message);
      break;

    case "BadRequestFieldError":
      errorObject = handleHTTPThrowErrors.handleBadRequestFieldError(
        err.message,
        err.field
      );
      break;

    case "BadRequestErrorMultiple":
      errorObject = handleHTTPThrowErrors.handleBadRequestErrorMultiple(
        err.errors,
        err.message
      );
      break;

    case "UnauthorizedError":
      errorObject = handleHTTPThrowErrors.handleUnauthorizedError(
        err.message
      );
      break;

    case "NotFoundError":
      errorObject = handleHTTPThrowErrors.handleNotFound(
        err.message
      );
      break;

    case "ForbiddenError":
      errorObject = handleHTTPThrowErrors.handleForbiddenError(
        err.message
      );
      break;

    case "ConflictError":
      errorObject = handleHTTPThrowErrors.handleConflictError(
        err.message,
        err.field
      );
      break;

    case "ServerError":
      errorObject = handleHTTPThrowErrors.handleDefaultErrorResponse(
        err.message
      );
      break;

    default:
      errorObject = handleHTTPThrowErrors.handleDefaultErrorResponse();
      break;
  }

  return res.status(errorObject.statusCode).json(errorObject);
};

export default handleErrorResponse;