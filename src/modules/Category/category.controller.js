import slugify from "slugify";
import Category from "../../../db/models/category.model.js";
import { asyncHandller } from "../../middlewares/errorHandling.js";
import { cloudinaryConfig } from "../../utils/cloudinary.utils.js";
import ApiError from "../../utils/errorClass.js";
import { nanoid } from "nanoid";
import SubCategory from "../../../db/models/subCategory.model.js";

export const createCategory = asyncHandller(async (req, res, next) => {
  const { name } = req.body;

  const categoryExist = await Category.findOne({ name: name.toLowerCase() });

  if (categoryExist) {
    return next(new ApiError("Category already exists", 409));
  }
  if (!req.file) {
    return next(new ApiError("Image is required", 404));
  }

  const customId = nanoid(5);

  const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
    req.file.path,
    { folder: `E-commerce/Categories/${customId}` }
  );

  const category = await Category.create({
    name,
    slug: slugify(name),
    image: { secure_url, public_id },
    customId,
    createdBy: req.user._id,
  });
  res.status(200).json({
    status: "success",
    category,
  });
});

export const updateCategory = asyncHandller(async (req, res, next) => {
  const { name } = req.body;

  const { id } = req.params;
  const category = await Category.findOne({ _id: id, createdBy: req.user._id });

  if (!category) {
    return next(
      new ApiError("Category not exist or you don have permission", 404)
    );
  }

  if (name) {
    if (name.toLowerCase() == category.name) {
      return next(new ApiError("name should be different", 404));
    }

    category.name = name.toLowerCase();
    category.slug = slugify(name);
  }

  if (req.file) {
    // delete the saved image
    await cloudinaryConfig().uploader.destroy(category.image.public_id);
    //save the new image
    const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(
      req.file.path,
      {
        folder: `E-commerce/Categories/${category.customId}`,
      }
    );

    category.image = { public_id, secure_url };
  }
  await category.save();

  res.status(201).json({
    status: "success",
    category,
  });
});

export const deleteCategory = asyncHandller(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findOneAndDelete({
    _id: id,
    createdBy: req.user._id,
  });
  if (!category) {
    return next(
      new ApiError("Category doesnot exist or you dont have a permission", 401)
    );
  }

  await SubCategory.deleteMany({ category: category._id });
  await cloudinaryConfig().api.delete_resources_by_prefix(
    `E-commerce/Categories/${category.customId}`
  );
  await cloudinaryConfig().api.delete_folder(
    `E-commerce/Categories/${category.customId}`
  );
  res.status(200).json({
    status: "sucess",
    msg: "done",
  });
});

export const getCategories = asyncHandller(async (req, res, next) => {
  const categories = await Category.find().populate([
    {
      path: "SubCategories",
    },
  ]);
  res.status(200).json({
    status: "success",
    data: categories,
  });
});
