import Product from "../../../db/models/product.model";
import WhishList from "../../../db/models/whishList.model";
import { asyncHandller } from "../../middlewares/errorHandling";
import ApiError from "../../utils/errorClass";

export const createWishList = asyncHandller(async (req, res, next) => {
  const { proudctId } = req.params;
  const product = await Product.findById(proudctId);
  if (!product) {
    return next(new ApiError("product not found", 404));
  }

  const wishList = await WhishList.findOne({ user: req.user._id });
  if (!wishList) {
    const newWhisLis = await WhishList.create({
      user: req.user._id,
      products: [proudctId],
    });
    res.status(201).json({
      status: "success",
      wishList: newWhisLis,
    });
  } else {
    const newWhisLis = await WhishList.findOneAndUpdate(
      { user: req.user._id },
      { $addToSet: { products: proudctId } },
      { new: true }
    );
    res.status(201).json({
      status: "success",
      wishList: newWhisLis,
    });
  }
});
