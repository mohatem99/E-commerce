import { Schema, Types, model } from "mongoose";

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, "name is required"],
      mixLength: 3,
      maxLength: 30,
      trim: true,
      lowercase: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: [true, "amount is required"],
      min: 1,
      max: 100,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    usedBy: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    fromDate: {
      type: Date,
      required: [true, "formDate is required"],
    },
    toDate: {
      type: Date,
      required: [true, "toDate is required"],
    },
  },
  { timestamps: true, versionKey: false }
);

const Coupon = model("Coupon", couponSchema);
export default Coupon;
