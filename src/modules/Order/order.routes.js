import express, { Router } from "express";
import { createOrder, webHook } from "./order.controller.js";
import authorize from "../../middlewares/authorization.middlware.js";

import auth from "../../middlewares/authentication.middlware.js";

const router = express.Router();
router.post("/", auth(), authorize("user"), createOrder);
router.post("/webhook", webHook);
export default router;
