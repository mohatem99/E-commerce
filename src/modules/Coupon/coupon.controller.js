import Coupon from "../../../db/models/coupon.model.js";
import { asyncHandller } from "../../middlewares/errorHandling.js";

export const createCoupon = asyncHandller(async (req, res, next) => {
  const { code, amount, fromDate, toDate } = req.body;

  const couponExist = await Coupon.findOne({
    code: code.toLowerCase(),
  });

  if (couponExist) {
    return next(new ApiError("Coupon Already exist", 404));
  }

  const coupon = await Coupon.create({
    code,
    amount,
    fromDate,
    toDate,
    createdBy: req.use._id,
  });
  res.status(201).json({
    status: "success",
    message: "done",
  });
});
export const updateCoupon = asyncHandller(async (req, res, next) => {
  const { id } = req.params;
  const { code, amount, fromDate, toDate } = req.body;

  const coupon = await Coupon.findOneAndUpdate(
    {
      _id: id,
      createdBy: req.user._id,
    },
    { code, amount, fromDate, toDate },
    { new: true }
  );

  if (!coupon) {
    return next(
      new ApiError("Coupon not exist or you dont have a permission", 404)
    );
  }

  res.status(200).json({
    status: "success",
    coupon,
  });
});
