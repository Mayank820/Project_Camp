// src/middlewares/validator.middlewares.js

import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-errors.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  // 🔍 Log all validation errors to debug
  console.log("Validation errors:", errors.array());

  const extractedError = errors.array().map((err) => ({
    [err.path]: err.msg,
  }));

  throw new ApiError(422, "Received data is not valid", extractedError);
};
