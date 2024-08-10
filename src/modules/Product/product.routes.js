import express from "express";
import { multerHost } from "../../middlewares/multer.middleware.js";
import { extenstions } from "../../utils/file-extensions.utils.js";
import {
  createProduct,
  deletProduct,
  getProducts,
  updateProduct,
} from "./product.controller.js";
import reviewRoutes from "../Review/review.routes.js";
import auth from "../../middlewares/authentication.middlware.js";
import authorize from "../../middlewares/authorization.middlware.js";
import wishListRoutes from "../WhishList/wishlist.routes.js";

import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
  checkParamsObjectId,
} from "./product.schema.js";
const router = express.Router();
router.use(
  "/:productId/reviews",

  reviewRoutes
);
router.use("/:productId/wisList", wishListRoutes);
router.get("/", getProducts);
router.post(
  "/",
  auth(),
  authorize("admin"),
  multerHost(extenstions.Images).fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "coverImages",
      maxCount: 3,
    },
  ]),

  validationMiddleware(createProductSchema),
  createProduct
);
router.put(
  "/:id",
  auth(),
  authorize("admin"),
  multerHost(extenstions.Images).fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "coverImages",
      maxCount: 3,
    },
    validationMiddleware(checkParamsObjectId),
    validationMiddleware(updateProductSchema),
  ]),
  updateProduct
);

router.delete(
  "/:id",
  auth(),
  authorize("admin"),
  validationMiddleware(checkParamsObjectId),
  deletProduct
);

export default router;
