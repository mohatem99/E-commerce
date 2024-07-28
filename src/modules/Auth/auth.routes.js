import express from "express";
import { confirmEmail, signIn, signUp } from "./auth.controller.js";
import { cloudinaryConfig } from "../../utils/cloudinary.utils.js";

const router = express.Router();

router.post("/signup", signUp);

router.post("/signin", signIn);
router.get("/confirm-email", confirmEmail);

router.get("/test", async (req, res) => {
  const data = await cloudinaryConfig().uploader.upload(
    "https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg",
    { folder: "general" }
  );
  res.json({ data });
});

export default router;
