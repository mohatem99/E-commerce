import express from "express";
import { createCategory, updateCategory } from "./category.controller.js";
import { multerHost } from "../../middlewares/multer.middleware.js";
import { extenstions } from "../../utils/file-extensions.utils.js";
import auth from "../../middlewares/authentication.middlware.js";
import authorize from "../../middlewares/authorization.middlware.js";
import subCategoryrouter from "../SubCatgory/subCategory.routes.js";

const router = express.Router({ caseSensitive: true });

router.use("/:categoryId/subCategories", subCategoryrouter);

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
export default router;
