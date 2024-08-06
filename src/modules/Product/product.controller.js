import { nanoid } from "nanoid";
import slugify from "slugify";
import { asyncHandller } from "../../middlewares/errorHandling.js";

import Category from "../../../db/models/category.model.js";
import Brand from "../../../db/models/brand.model.js";
import SubCategory from "../../../db/models/subCategory.model.js";
import ApiError from "../../utils/errorClass.js";
import Product from "../../../db/models/product.model.js";
import { cloudinaryConfig } from "../../utils/cloudinary.utils.js";
import { ApiFeatures } from "../../utils/apifeatures.js";

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
  console.log(categoryExist);
  const subCategoryExist = await SubCategory.findOne({
    _id: subCategory,
    category,
  });
  console.log(subCategoryExist);
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
  if (productExist) {
    return next(new ApiError("product Already exist", 404));
  }

  let subPrice = price - (price * (discount || 0)) / 100;

  if (!req.files) {
    return next(new ApiError("images is required", 404));
  }

  const customId = nanoid(5);
  let list = [];
  for (let file of req.files.coverImages) {
    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
      file.path,
      {
        folder: `E-commerce/Categories/${categoryExist.customId}/SubCategories/${subCategoryExist.customId}/Brands/${brandExist.customId}/Products/${customId}/coverImages`,
      }
    );
    list.push({ secure_url, public_id });
  }
  const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
    req.files.image[0].path,
    {
      folder: `E-commerce/Categories/${categoryExist.customId}/SubCategories/${subCategoryExist.customId}/Brands/${brandExist.customId}/Products/${customId}/mainImage`,
    }
  );

  const product = await Product.create({
    title,

    slug: slugify(title),
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
    data: product,
  });
});

export const getProducts = asyncHandller(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .pagination()
    .filter()
    .search()
    .sort()
    .select();

  let products = await apiFeatures.mongooseQury;
  res.status(200).json({
    status: "success",

    products,
  });
});

export const updateProduct = asyncHandller(async (req, res, next) => {
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

  const { id } = req.params;

  const categoryExist = await Category.findOne({ _id: category });
  if (!categoryExist) {
    return next(new ApiError("category not exist", 404));
  }
  console.log(categoryExist);
  const subCategoryExist = await SubCategory.findOne({
    _id: subCategory,
    category,
  });
  console.log(subCategoryExist);
  if (!subCategoryExist) {
    return next(new ApiError("subCategory not exist", 404));
  }
  const brandExist = await Brand.findOne({
    _id: brand,
  });
  if (!brandExist) {
    return next(new ApiError("brand not exist", 404));
  }
  const product = await Product.findOne({
    _id: id,
    createdBy: req.user._id,
  });
  if (product) {
    return next(new ApiError("product not exist", 404));
  }

  if (title) {
    if (title.toLowerCase() == product.title) {
      return next(new ApiError("title match old title", 404));
    }
    if (
      await Product.findOne({
        title: title.toLowerCase(),
      })
    ) {
      return next(new ApiError("title already exist", 404));
    }
    product.title = title.toLowerCase();
    product.slug = slugify(title);
  }

  if (description) {
    product.description = description;
  }
  if (stock) {
    product.stock = stock;
  }

  if (price & discount) {
    product.subPrice = price - price * (discount / 100);
    product.price = price;
    product.discount = discount;
  } else if (price) {
    product.subPrice = price - price * (product.discount / 100);
    product.price = price;
  } else if (discount) {
    product.subPrice = product.price - product.price * (discount / 100);
    product.discount = discount;
  }

  if (req.files) {
    if (req.files?.image?.length) {
      await cloudinaryConfig().uploader.destroy(product.image.public_id);
      const { secure_url, public_id } =
        await cloudinaryConfig().uploader.upload(req.files.image[0].path, {
          folder: `E-commerce/Categories/${categoryExist.customId}/SubCategories/${subCategoryExist.customId}/Brands/${brandExist.customId}/Products/${product.customId}/coverImages`,
        });
      product.image = { secure_url, public_id };
    }

    if (req.files?.coverImages?.length) {
      await cloudinaryConfig().api.delete_resources_by_prefix(
        `E-commerce/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${product.customId}/coverImages`
      );
      let list = [];
      for (let file of req.files.coverImages) {
        const { secure_url, public_id } =
          await cloudinaryConfig().uploader.upload(file.path, {
            folder: `E-commerce/Categories/${categoryExist.customId}/SubCategories/${subCategoryExist.customId}/Brands/${brandExist.customId}/Products/${product.customId}/mainImage`,
          });
        list.push({ secure_url, public_id });
        product.coverImages = list;
      }
    }
  }

  await product.save();
  res.status(200).json({
    status: "success",
    data: product,
  });
});

export const deletProduct = asyncHandller(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findOne({ _id: id, createdBy: req.user._id })
    .populate("category")
    .populate("subCategory")
    .populate("brand");

  if (!product) {
    return next(
      new ApiError("product doesnot exist or you dont have a permission", 401)
    );
  }
  await Product.deleteOne({ _id: id });
  await cloudinaryConfig().api.delete_resources_by_prefix(
    `E-commerce/Categories/${product.category.customId}/SubCategories/${product.subCategory.customId}/Brands/${product.brand.customId}/Products/${product.customId}`
  );

  await cloudinaryConfig().api.delete_folder(
    `E-commerce/Categories/${product.category.customId}/SubCategories/${product.subCategory.customId}/Brands/${product.brand.customId}/Products/${product.customId}`
  );
  res.status(200).json({
    status: "sucess",
    msg: "done",
  });
});
