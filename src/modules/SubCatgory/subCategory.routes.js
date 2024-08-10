import express from "express";
import {
  createSubCategory,
  getSubCategories,
} from "./subCategory.controller.js ";
import auth from "../../middlewares/authentication.middlware.js";
import authorize from "../../middlewares/authorization.middlware.js";
import { multerHost } from "../../middlewares/multer.middleware.js";
import { extenstions } from "../../utils/file-extensions.utils.js";
import {
  deleteSubCategory,
  updateSubCategory,
} from "./subCategory.controller.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import {
  updateSubCategorySchema,
  createSubCategorySchema,
  checkParamsObjectId,
} from "./subcategory.schema.js";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    auth(),
    authorize("admin"),
    multerHost(extenstions.Images).single("image"),
    validationMiddleware(updateSubCategorySchema),
    createSubCategory
  )
  .get(auth(), authorize("admin", "user"), getSubCategories);

router
  .route("/:id")
  .put(
    auth(),
    authorize("admin"),
    multerHost(extenstions.Images).single("image"),
    validationMiddleware(checkParamsObjectId),
    validationMiddleware(createSubCategorySchema),
    updateSubCategory
  )
  .delete(
    auth(),
    authorize("admin"),
    validationMiddleware(checkParamsObjectId),
    deleteSubCategory
  );
export default router;
