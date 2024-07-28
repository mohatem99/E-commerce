import express from "express";
import { config } from "dotenv";
import connectionDb from "./db/connectionDb.js";
import { globalResponse } from "./src/middlewares/errorHandling.js";

import authRoutes from "./src/modules/Auth/auth.routes.js";

import categoryroutes from "./src/modules/Category/category.routes.js";
import subCategoryRoutes from "./src/modules/SubCatgory/subCategory.routes.js";

import brandRoutes from "./src/modules/Brand/brand.routes.js";

import productRoutes from "./src/modules/Product/product.routes.js";

config();

connectionDb();
const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/categories", categoryroutes);
app.use("/subCategories", subCategoryRoutes);
app.use("/brands", brandRoutes);

app.use("/products", productRoutes);
app.use(globalResponse);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server up and running on port ${PORT}`));
