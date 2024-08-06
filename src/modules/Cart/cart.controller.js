import Cart from "../../../db/models/cart.model.js";
import Product from "../../../db/models/product.model.js";
import { asyncHandller } from "../../middlewares/errorHandling.js";
import ApiError from "../../utils/errorClass.js";

export const createCart = asyncHandller(async (req, res, next) => {
  const { productId, quantity } = req.body;

  const product = await Product.findOne({
    _id: productId,
    stock: { $gte: quantity },
  });

  if (!product) {
    return next(new ApiError("Product not exist or out of stock", 404));
  }

  let cartExist = await Cart.findOne({ user: req.user._id });

  if (!cartExist) {
    let cart = await Cart.create({
      user: req.user._id,
      products: [{ productId, quantity }],
    });

    res.status(200).json({
      status: "success",
      cart,
    });
  }

  let flag = false;
  for (let product of cartExist.products) {
    if (productId == product.productId) {
      product.quantity = quantity;
      flag = true;
    }
  }

  if (!flag) {
    console.log("hi");
    cartExist.products.push({
      productId,
      quantity,
    });
  }

  await cartExist.save();
  res.status(200).json({
    status: "success",
    cart: cartExist,
  });
});

export const clearCart = asyncHandller(async (req, res, next) => {
  const cartExist = await Cart.findByIdAndUpdate(
    {
      user: req.user._id,
    },
    {
      products: [],
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    cart: cartExist,
  });
});

export const removeCart = asyncHandller(async (req, res, next) => {
  const { productId } = req.body;
  const cartExist = await Cart.findOneAndUpdate(
    {
      user: req.user._id,
      "products.productId": productId,
    },
    {
      $pull: { products: { productId } },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    cart: cartExist,
  });
});
export const getCart = asyncHandller(async (req, res, next) => {
  console.log(req.user);

  const cart = await Cart.find({ user: req.user._id });

  res.status(200).json({
    status: "success",
    cart,
  });
});
