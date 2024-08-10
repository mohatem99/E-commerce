import express from "express";
import {
  confirmEmail,
  forpgetPassword,
  resetPassword,
  signIn,
  signUp,
  refreshToken,
} from "./auth.controller.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import {
  signUpSchema,
  sigInSchema,
  confirmMail,
  rfToken,
  forgetSchme,
  resetSchema,
} from "./auth.Schema.js";

const router = express.Router();

router.post("/signup", validationMiddleware(signUpSchema), signUp);

router.post("/signin", validationMiddleware(sigInSchema), signIn);
router.get(
  "/confirm-email/:token",
  validationMiddleware(confirmMail),
  confirmEmail
);
router.get(
  "/refresh-token/:rfToken",
  validationMiddleware(rfToken),
  refreshToken
);

router.post(
  "/forget-password",
  validationMiddleware(forgetSchme),
  forpgetPassword
);

router.post(
  "/reset-password",
  validationMiddleware(resetSchema),
  resetPassword
);

export default router;
