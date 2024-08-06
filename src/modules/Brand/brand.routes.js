import express from "express";
import { createBrand, getBrand, updateBrand } from "./brand.controller.js";
import auth from "../../middlewares/authentication.middlware.js";
import authorize from "../../middlewares/authorization.middlware.js";
import { multerHost } from "../../middlewares/multer.middleware.js";
import { extenstions } from "../../utils/file-extensions.utils.js";

const router = express.Router();

router.post(
  "/",
  auth(),
  authorize("admin"),
  multerHost(extenstions.Images).single("image"),
  createBrand
);
router.put("/:id", auth(), authorize("admin"), updateBrand);
// router.get("/:id", getBrand);
export default router;
