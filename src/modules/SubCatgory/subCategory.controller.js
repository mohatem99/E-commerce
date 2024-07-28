import { nanoid } from "nanoid";

import SubCategory from "../../../db/models/subCategory.model.js";
import Category from "../../../db/models/category.model.js";
import { asyncHandller } from "../../middlewares/errorHandling.js";

export const createSubCategory = asyncHandller(async (req, res, next) => {
  const { name } = req.body;

  const { categoryId } = req.params;

  console.log(categoryId);

  const categoryExist = await Category.findById(categoryId);

  if (!categoryExist) {
    return next(new ApiError("Category doesnt exists", 409));
  }
  const subcategoryExist = await SubCategory.findOne({
    name: name.toLowerCase(),
  });

  if (subcategoryExist) {
    return next(new ApiError("Subcategory already exists", 409));
  }
  if (!req.file) {
    return next(new ApiError("Image is required", 404));
  }

  const customId = nanoid(5);
  const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
    req.file.path,
    {
      folder: `E-commerce/categories/${categoryExist.customId}/subCategories/${customId}`,
    }
  );

  const subCategory = await SubCategory.create({
    name,
    slug: slugify(name),
    image: { secure_url, public_id },
    customId,
    createdBy: req.user._id,
    category,
  });
  res.status(200).json({
    status: "success",
    subCategory,
  });
});
