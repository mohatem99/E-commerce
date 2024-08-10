import ApiError from "../utils/errorClass.js";

const reqKeys = ["body", "query", "params", "headers", "file", "files"];

/**
 * @param {object} schema - Joi schema object
 * @returns  {Function} - Middleware function
 * @description - Middleware function to validate the request data against the schema
 */

export const validationMiddleware = (schema) => (req, res, next) => {
  for (const key of reqKeys) {
    const validationResult = schema[key]?.validate(req[key], {
      abortEarly: false,
    });

    if (!validationResult?.error) {
      console.log(validationResult?.error);
      return next();
    } else {
      let errMessages = validationResult?.error?.details.map(
        (err) => err.message
      );

      next(new ApiError(errMessages, 400));
    }
  }
};
