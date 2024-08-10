import Brand from "../../../db/models/brand.model.js";
import { asyncHandller } from "../../middlewares/errorHandling.js";
import { nanoid } from "nanoid";
import ApiError from "../../utils/errorClass.js";
import { cloudinaryConfig } from "../../utils/cloudinary.utils.js";
import { extenstions } from "../../utils/file-extensions.utils.js";
import slugify from "slugify";
import Category from "../../../db/models/category.model.js";
import SubCategory from "../../../db/models/subCategory.model.js";
import Product from "../../../db/models/product.model.js";
export const createBrand = asyncHandller(async (req, res, next) => {
  const { name, category, subCategory } = req.body;

  const isSubcategoryExist = await SubCategory.findOne({
    _id: subCategory,
    category,
  }).populate("category");
  if (!isSubcategoryExist) {
    return next(new ApiError("Subcategory not found", 404));
  }

  const brandExist = await Brand.findOne({ name: name.toLowerCase() });

  if (brandExist) {
    return next(new ApiError("Brand already exists", 409));
  }
  if (!req.file) {
    return next(new ApiError("Image is required", 404));
  }

  const customId = nanoid(5);

  const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
    req.file.path,
    {
      folder: `E-commerce/Categories/${isSubcategoryExist.category.customId}/SubCategories/${isSubcategoryExist.customId}/Brands/${customId}`,
    }
  );

  const brand = await Brand.create({
    name,
    slug: slugify(name),
    image: { secure_url, public_id },
    customId,
    category,
    subCategory,
    createdBy: req.user._id,
  });
  res.status(200).json({
    status: "success",
    brand,
  });
});

export const getBrand = asyncHandller(async (req, res, next) => {
  const { id } = req.params;
  const brand = await Brand.findById(id);
  res.status(200).json({
    status: "success",
    brand,
  });
});

export const updateBrand = asyncHandller(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const brand = await Brand.findOne({
    _id: id,
    createdBy: req.user._id,
  })
    .populate("category")
    .populate("subCategory");
  console.log(brand);
  if (!brand) {
    return next(
      new ApiError("Brand not exist or you dont have permission", 404)
    );
  }
  // Update name and slug
  if (name) {
    brand.name = name;
    brand.slug = slugify(name);
  } //Update Image
  if (req.file) {
    await cloudinaryConfig().uploader.destroy(brand.image.public_id);
    const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(
      req.file.path,
      {
        folder: `E-commerce/Categories/${brand.category.customId}/SubCategories/${brand.subCategory.customId}/Brands/${brand.customId}`,
      }
    );

    brand.image = { public_id, secure_url };
  }

  await brand.save();
  res.status(200).json({
    status: "success",
    data: brand,
  });
});

export const deleteBrand = asyncHandller(async (req, res, next) => {
  const { id } = req.params;

  const brand = await Brand.findByIdAndDelete(id)
    .populate("category")
    .populate("subCategory");

  if (!brand) {
    return next(new ApiError("Brand not found", 404));
  }

  const brandPath = `E-commerce/Categories/${brand.category.customId}/SubCategories/${brand.subCategory.customId}/Brands/${brand.customId}`;

  // delete the related products from db
  await Product.deleteMany({
    brand: brand._id,
  });

  // delete the related products from db
  await Product.deleteMany({ subCategory: subCategory._id });

  await cloudinaryConfig().api.delete_resources_by_prefix(brandPath);
  await cloudinaryConfig().api.delete_folder(brandPath);

  res.status(200).json({
    status: "success",
    message: "Brand deleted successfully",
  });
});
