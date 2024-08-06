import express from "express";
import {
  createSubCategory,
  getSubCategories,
} from "./subCategory.controller.js ";
import auth from "../../middlewares/authentication.middlware.js";
import authorize from "../../middlewares/authorization.middlware.js";
import { multerHost } from "../../middlewares/multer.middleware.js";
import { extenstions } from "../../utils/file-extensions.utils.js";
import { updateSubCategory } from "./subCategory.controller.js";

const router = express.Router({ mergeParams: true });

router.post(
  "/",
  auth(),
  authorize("admin"),
  multerHost(extenstions.Images).single("image"),
  createSubCategory
);

router.get("/", getSubCategories);

router.put(
  "/:id",
  auth(),
  authorize("admin"),
  multerHost(extenstions.Images).single("image"),
  updateSubCategory
);
export default router;
