import { Schema, Types, model } from "mongoose";

const reviewSchema = new Schema(
  {
    comment: {
      type: String,
      required: [true, "comment is requireds"],
      minLength: 3,
      trim: true,
    },

    rate: {
      type: Number,
      required: [true, "rate is requireds"],
      min: 1,
      max: 5,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    productId: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);
const Review = model("Review", reviewSchema);
export default Review;
