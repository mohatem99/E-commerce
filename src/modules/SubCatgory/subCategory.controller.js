import { nanoid } from "nanoid";

import slugify from "slugify";
import ApiError from "../../utils/errorClass.js";
import SubCategory from "../../../db/models/subCategory.model.js";
import Category from "../../../db/models/category.model.js";
import { asyncHandller } from "../../middlewares/errorHandling.js";
import { cloudinaryConfig } from "../../utils/cloudinary.utils.js";
export const createSubCategory = asyncHandller(async (req, res, next) => {
  const { name } = req.body;

  const { categoryId } = req.params;

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
      folder: `E-commerce/Categories/${categoryExist.customId}/SubCategories/${customId}`,
    }
  );

  const subCategory = await SubCategory.create({
    name,
    slug: slugify(name),
    image: { secure_url, public_id },
    customId,
    createdBy: req.user._id,
    category: categoryId,
  });
  res.status(200).json({
    status: "success",
    subCategory,
  });
});
export const updateSubCategory = asyncHandller(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const subCategory = await SubCategory.findById(id).populate("category");

  console.log(subCategory);
  if (!subCategory) {
    return next(new ApiError("Subcategory not exist ", 404));
  }

  if (name) {
    subCategory.name = name;
    subCategory.slug = slugify(name);
  }

  if (req.file) {
    await cloudinaryConfig().uploader.destroy(category.image.public_id);
    //save the new image
    const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(
      req.file.path,
      {
        folder: `E-commerce/Categories/${subCategory.category.customId}/SubCategories/${subCategory.customId}`,
      }
    );

    category.image = { public_id, secure_url };
  }

  await subCategory.save();
  res.status(200).json({ status: "success", data: subCategory });
});
export const getSubCategories = asyncHandller(async (req, res, next) => {
  const subCategories = await SubCategory.find();
  res.status(200).json({
    status: "success",
    data: subCategories,
  });
});
