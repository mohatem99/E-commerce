import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "./category.controller.js";
import { multerHost } from "../../middlewares/multer.middleware.js";
import { extenstions } from "../../utils/file-extensions.utils.js";
import auth from "../../middlewares/authentication.middlware.js";
import authorize from "../../middlewares/authorization.middlware.js";
import subCategoryRouter from "../SubCatgory/subCategory.routes.js";

const router = express.Router();
router.get("/", getCategories);
router.use(
  "/:categoryId/subCategories",

  subCategoryRouter
);

router.post(
  "/",

  auth(),
  authorize("admin"),

  multerHost(extenstions.Images).single("image"),
  createCategory
);

router.put(
  "/:id",

  auth(),
  authorize("admin"),

  multerHost(extenstions.Images).single("image"),
  updateCategory
);

router.delete("/:id", auth(), authorize("admin"), deleteCategory);
export default router;
