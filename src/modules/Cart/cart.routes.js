import express from "express";
import { createCart, getCart } from "./cart.controller.js";
import auth from "../../middlewares/authentication.middlware.js";
import authorize from "../../middlewares/authorization.middlware.js";

const router = express.Router();
router
  .route("/")
  .get(auth(), authorize("user"), getCart)
  .post(auth(), authorize("admin", "user"), createCart);

export default router;
