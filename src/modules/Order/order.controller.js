import Cart from "../../../db/models/cart.model";
import Coupon from "../../../db/models/coupon.model";
import Order from "../../../db/models/order.model";
import Product from "../../../db/models/product.model";
import { asyncHandller } from "../../middlewares/errorHandling";
import ApiError from "../../utils/errorClass";

export const createOrder = asyncHandller(async (req, res, next) => {
  const { productId, quantity, couponCode, address, phone, paymentMethod } =
    req.body;
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toLowerCase(),
      usedBy: {
        $nin: [req.user._id],
      },
    });
    if (!coupon || coupon.toDate < Date.now()) {
      return next(
        new ApiError("coupon not exist or expired or already used", 404)
      );
    }
    req.body.coupon = coupon;
  }

  let products = [];
  let flag = false;
  if (productId) {
    products = [{ productId, quantity }];
  } else {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart.products.length) {
      return next(new ApiError("Cart is empty please select product", 404));
    }
    products = cart.products;
    flag = true;
  }

  let finalProducts = [];

  let subPrice = 0;
  for (let product of products) {
    const checkProduct = await Product.findOne({
      _id: product.productId,
      stock: { $gte: product.quantity },
    });

    if (!checkProduct) {
      return next(new ApiError("Product not exist or out of stock", 404));
    }

    if (flag) {
      product = product.toObject();
    }
    product.title = checkProduct.title;
    product.price = checkProduct.price;
    product.finalPrice = checkProduct.subPrice * product.quantity;
    subPrice += product.finalPrice;

    finalProducts.push(product);
  }
  const order = await Order.create({
    user: req.user._id,
    products: finalProducts,
    subPrice,
    couponId: req.body?.coupon?._id,
    totalPrice: subPrice - subPrice * ((req.body?.coupon?.amount || 0) / 100),
    paymentMethod,
    status: paymentMethod == "cash" ? "placed" : "waitPayment",
    phone,
    address,
  });

  if (req.body?.coupon) {
    await Coupon.updateOne(
      {
        _id: req.body.coupon._ic,
      },
      {
        $push: { usedBy: req.user._id },
      }
    );
  }

  for (let product of finalProducts) {
    await Product.findByIdAndUpdate(product.productId, {
      $inc: { stock: -product.quantity },
    });
  }
  if (flag) {
    await Cart.updateOne({ user: req.user._id }, { products: [] });
  }
  res.status(201).json({
    status: "success",
    order,
  });
});

export const cancelOrder = asyncHandller(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await Order.findOne({ _id: id, user: req.user._id });
  if (!order) {
    return next(new ApiError("order not found ", 404));
  }
  if (
    (order.paymentMethod == "cash" && order.status != "placed") ||
    (order.paymentMethod == "card" && order.status != "waitPayment")
  ) {
    return next(new ApiError("you cannont cancel this order", 404));
  }

  await Order.updateOne(
    {
      _id: id,
    },
    { status: "cancelled", cancelledBy: req.user_id, reason }
  );

  if (order?.coupon) {
    await Coupon.updateOne(
      { _id: order?.couponId },
      {
        $pull: { usedBy: req.user._id },
      }
    );
  }

  for (let product of order.products) {
    await Product.updateOne(
      { _id: product.productId },
      {
        $inc: { stock: product.quantity },
      }
    );
  }

  res.status(200).json({
    status: "success",
    msg: "done",
  });
});
