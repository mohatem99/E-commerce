import { Router } from "express";
import { createCoupon } from "./coupon.controller.js";
import auth from "../../middlewares/authentication.middlware.js";
import authorize from "../../middlewares/authorization.middlware.js";
const router = Router();

router.post("/", auth(), authorize("admin"), createCoupon);

export default router;
