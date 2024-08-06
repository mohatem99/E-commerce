import User from "../../db/models/user.model.js";
import { asyncHandller } from "./errorHandling.js";
import ApiError from "../utils/errorClass.js";
import jwt from "jsonwebtoken";
const auth = () => {
  return asyncHandller(async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
      return next(new ApiError("You are not login please login first", 401));
    }

    if (!token.startsWith("Bearer")) {
      return next(new ApiError("Invalid token", 400));
    }

    let originalToken = token.split(" ")[1];

    const decoded = jwt.verify(originalToken, process.env.TOKEN_SECRET);

    if (!decoded?.userId)
      return next(new ApiError("Invalid token payload", 401));

    const currentUser = await User.findById(decoded.userId);

    if (currentUser?.passwordChangedAt) {
      const passChangedTimestamp = parseInt(
        currentUser.passwordChangedAt.getTime() / 1000,
        10
      );
      if (passChangedTimestamp > decoded.iat) {
        return next(
          new ApiError(
            "User recently changed his password. please login again..",
            401
          )
        );
      }
    }

    if (!currentUser) {
      return next(
        new ApiError("The user belongs to this token doesnt exist", 401)
      );
    }
    req.user = currentUser;
    next();
  });
};

export default auth;
