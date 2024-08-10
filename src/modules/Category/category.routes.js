import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "./category.controller.js";
import { multerHost } from "../../middlewares/multer.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";

import { extenstions } from "../../utils/file-extensions.utils.js";
import auth from "../../middlewares/authentication.middlware.js";
import authorize from "../../middlewares/authorization.middlware.js";
import subCategoryRouter from "../SubCatgory/subCategory.routes.js";
import {
  checkParamsObjectId,
  createCategorySchema,
  updateCategorySchema,
} from "./category.schema.js";

const router = express.Router();
router.route("/").get(auth(), authorize("user", "admin"), getCategories).post(
  auth(),
  authorize("admin"),

  multerHost(extenstions.Images).single("image"),
  validationMiddleware(createCategorySchema),

  createCategory
);
router
  .route("/:id")
  .put(
    auth(),
    authorize("admin"),

    multerHost(extenstions.Images).single("image"),

    validationMiddleware(checkParamsObjectId),
    validationMiddleware(updateCategorySchema),
    updateCategory
  )
  .delete(
    auth(),
    authorize("admin"),
    validationMiddleware(checkParamsObjectId),
    deleteCategory
  );

router.use(
  "/:categoryId/subCategories",

  subCategoryRouter
);

export default router;
