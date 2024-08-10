import express from "express";
import {
  createBrand,
  deleteBrand,
  getBrand,
  updateBrand,
} from "./brand.controller.js";
import auth from "../../middlewares/authentication.middlware.js";
import authorize from "../../middlewares/authorization.middlware.js";
import { multerHost } from "../../middlewares/multer.middleware.js";
import { extenstions } from "../../utils/file-extensions.utils.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import {
  createBransSchema,
  updateBrandSchema,
  checkParamsObjectId,
} from "./brand.schema.js";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    authorize("admin"),
    multerHost(extenstions.Images).single("image"),
    validationMiddleware(createBransSchema),
    createBrand
  );
// .get(auth, authorize("admin", "user"));
router
  .route("/:id")
  .put(
    auth(),
    authorize("admin"),
    multerHost(extenstions.Images).single("image"),
    validationMiddleware(updateBrandSchema),
    validationMiddleware(checkParamsObjectId),
    updateBrand
  )
  .delete(
    auth(),
    authorize("admin"),
    validationMiddleware(checkParamsObjectId),
    deleteBrand
  );

export default router;
