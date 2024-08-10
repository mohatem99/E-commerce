import express, { Router } from "express";
import { createReview, deleteReview } from "./review.controller.js";
import auth from "../../middlewares/authentication.middlware.js";
import authorize from "../../middlewares/authorization.middlware.js";

const router = express.Router({ mergeParams: true });

router.post("/", auth(), authorize("user"), createReview);
router.delete("/:id", deleteReview);
export default router;
