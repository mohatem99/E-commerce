import { nanoid } from "nanoid";
import slugify from "slugify";
import { asyncHandller } from "../../middlewares/errorHandling.js";

import Category from "../../../db/models/category.model.js";
import Brand from "../../../db/models/brand.model.js";
import SubCategory from "../../../db/models/subCategory.model.js";
import ApiError from "../../utils/errorClass.js";
import Product from "../../../db/models/product.model.js";
import { cloudinaryConfig } from "../../utils/cloudinary.utils.js";

export const createProduct = asyncHandller(async (req, res, next) => {
  const {
    title,
    price,
    stock,
    discount,
    description,
    category,
    subCategory,
    brand,
  } = req.body;

  const categoryExist = await Category.findOne({ _id: category });
  if (!categoryExist) {
    return next(new ApiError("category not exist", 404));
  }
  const subCategoryExist = await SubCategory.findOne({
    _id: subCategory,
    category,
  });
  if (!subCategoryExist) {
    return next(new ApiError("subCategory not exist", 404));
  }
  const brandExist = await Brand.findOne({
    _id: brand,
  });
  if (!brandExist) {
    return next(new ApiError("brand not exist", 404));
  }
  const productExist = await Product.findOne({
    title: title.toLowerCase(),
  });
  if (!productExist) {
    return next(new ApiError("product Already exist", 404));
  }

  let subPrice = price - (price * (discount || 0)) / 100;

  if (!req.files) {
    return next(new ApiError("images is required", 404));
  }

  const cusustomId = nanoid(5);
  let list = [];
  for (let file of req.files.coverImages) {
    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
      file.path,
      {
        folder: `E-commerce/categories/${categoryExist.customId}/subCategories/${customId}/products/${cusustomId}`,
      }
    );
    list.push({ secure_url, public_id });
  }
  const { secure_url, public_id } = req.files.image[0];

  const product = await Product.create({
    title,

    slug: slugify(),
    coverImages: list,
    image: { secure_url, public_id },
    description,
    price,
    discount,
    subPrice,
    stock,
    category,
    subCategory,
    brand,
    customId,
    createdBy: req.user._id,
  });
  res.status(201).json({
    status: "success",
    msg: "done",
  });
});

export const getProducts = asyncHandller(async (req, res, next) => {
  let page = req.query.page * 1 || 1;
  if (page < 1) page = 1;
  let limit = 5;
  let skip = (page - 1) * page;

  let excludeQuery = ["page", "sort", "search", "select"];
  let filterObj = { ...req.query };
  excludeQuery.forEach((el) => delete filterObj[el]);

  filterObj = JSON.parse(
    JSON.stringify(filterObj).replace(
      /(gt|lt|gte|lte|eq)/,
      (match) => `$${match}`
    )
  );
  console.log(filterObj);

  let mongooseQuery = Product.find(filterObj).skip(skip).limit(limit);
  //sort
  if (req.query.sort) {
    // sort taket ("price discount")
    mongooseQuery.sort(req.query.sort.replace(",", " "));
  }

  if (req.query.search) {
    mongooseQuery.find({
      $or: [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ],
    });
  }

  if (req.query.select) {
    mongooseQuery.select(req.query.select.replace(",", " "));
  }

  res.status(200).json({
    status: "success",
    page,
    products,
  });
});
