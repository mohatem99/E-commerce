import Order from "../../../db/models/order.model";
import Product from "../../../db/models/product.model";
import Review from "../../../db/models/review.model";
import { asyncHandller } from "../../middlewares/errorHandling";
import ApiError from "../../utils/errorClass";

export const createReview = asyncHandller(async (req, res, next) => {
  const { comment, rate, productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError("product not found", 404));
  }

  const reviewExist = await Review.findOne({
    createdBy: req.user._id,
    productId,
  });
  if (!reviewExist) {
    return next(new ApiError("you are already reviewed", 404));
  }

  const order = await Order.findOne({
    user: req.user._id,
    "products.productId": productId,
    status: "delivered",
  });
  if (!order) {
    return next(new ApiError("order not found", 404));
  }

  const review = await Review.create({
    rate,
    comment,
    productId,
    createdBy: req.user._id,
  });

  let sum = product.rateAvg * product.rateNum;
  sum = sum + rate;
  product.rateAvg = sum / (product.rateNum + 1);
  product.rateNum += 1;

  await product.save();
  res.status(201).json({
    status: "success",
    review,
  });
});

export const deleteReview = asyncHandller(async (req, res, next) => {
  const { id } = req.params;

  console.log(id);

  const review = await Review.findByOneAndDelete({
    _id: id,
    createdBy: req.user._id,
  });
  if (!review) {
    return next(new ApiError("review  not exists", 409));
  }

  let product = await Product.findById(review.productId);

  let sum = product.rateAvg * product.rateNum;
  sum = sum - rate;
  product.rateAvg = sum / (product.rateNum - 1);
  product.rateNum -= 1;
  await product.save();
  res.status(201).json({
    status: "success",
    msg: "done",
  });
});
