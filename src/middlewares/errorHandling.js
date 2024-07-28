import ApiError from "../utils/errorClass.js";

export const asyncHandller = (API) => {
  return (req, res, next) => {
    API(req, res, next).catch((err) => {
      return next(new ApiError(err.message, 500));
    });
  };
};

export const globalResponse = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
