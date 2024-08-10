import express, { Router } from "express";
import { createWishList } from "./whishlist.controller.js";

const router = express.Router();

router.post("/", createWishList);
export default router;
