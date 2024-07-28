import { asyncHandller } from "./errorHandling.js";
import ApiError from "../utils/errorClass.js";

const authorize = (...roles) => {
  return asyncHandller(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });
};

export default authorize;
