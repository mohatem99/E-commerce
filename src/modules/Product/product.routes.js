import express from "express";
import { multerHost } from "../../middlewares/multer.middleware.js";
import { extenstions } from "../../utils/file-extensions.utils.js";
import {
  createProduct,
  deletProduct,
  updateProduct,
} from "./product.controller.js";
import reviewRoutes from "../Review/review.routes.js";
import auth from "../../middlewares/authentication.middlware.js";
import authorize from "../../middlewares/authorization.middlware.js";
import wishListRoutes from "../WhishList/wishlist.routes.js";
const router = express.Router();

router.use("/:productId/reviews", reviewRoutes);
router.use("/:productId/wisList", wishListRoutes);

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
  ]),
  updateProduct
);

router.delete("/:id", auth(), authorize("admin"), deletProduct);
export default router;
