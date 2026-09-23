import { validationResult } from "express-validator";

import {
  throwBadRequestErrorWithMultipleErrors,
} from "../errors/throwHTTPErrors.js";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throwBadRequestErrorWithMultipleErrors(errors);
  }

  next();
};

export default handleValidationErrors;