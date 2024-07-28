import express from "express";
import { multerHost } from "../../middlewares/multer.middleware.js";
import { extenstions } from "../../utils/file-extensions.utils.js";
import { createProduct } from "./product.controller.js";
import reviewRoutes from "../Review/review.routes.js";

import wishListRoutes from "../WhishList/wishlist.routes.js";
const router = express.Router();

router.use("/:productId/reviews", reviewRoutes);
router.use("/:productId/wisList", wishListRoutes);

router.post(
  "/",
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

export default router;
