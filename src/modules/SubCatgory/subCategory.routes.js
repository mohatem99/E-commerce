import express from "express";
import { createSubCategory } from "./subCategory.controller.js ";

const router = express.Router({ mergeParams: true });

router.post("/", createSubCategory);
export default router;
