import express from "express";
import cors from "cors";
import { config } from "dotenv";
import connectionDb from "./db/connectionDb.js";
import { globalResponse } from "./src/middlewares/errorHandling.js";

import authRoutes from "./src/modules/Auth/auth.routes.js";

import categoryroutes from "./src/modules/Category/category.routes.js";
import subCategoryRoutes from "./src/modules/SubCatgory/subCategory.routes.js";

import brandRoutes from "./src/modules/Brand/brand.routes.js";

import productRoutes from "./src/modules/Product/product.routes.js";
import cartRoutes from "./src/modules/Cart/cart.routes.js";

import couponRoutes from "./src/modules/Coupon/coupon.routes.js";
import ordersRoutes from "./src/modules/Order/order.routes.js";
import { deleteFromCloudinary } from "./src/utils/deleteFromCloudinary.js";
import { deleteFromDb } from "./src/utils/deleteFromDb.js";

config();

connectionDb();
const app = express();
app.use(cors());

app.use((req, res, next) => {
  if (req.originalUrl == "/orders/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.json());

app.get("/", (req, res, next) => {
  res.status(200).json({ status: "success", msg: "Hello on my Project 😘" });
});

app.use("/auth", authRoutes);
app.use("/categories", categoryroutes);
app.use("/subCategories", subCategoryRoutes);
app.use("/brands", brandRoutes);

app.use("/products", productRoutes);
app.use("/carts", cartRoutes);
app.use("/coupons", couponRoutes);

app.use("/orders", ordersRoutes);
app.use(globalResponse, deleteFromCloudinary, deleteFromDb);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server up and running on port ${PORT}`));
