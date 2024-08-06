import { Schema, Types, model } from "mongoose";

const orderSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        title: { type: String, required: true },

        productId: { type: Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },

        price: { type: Number, required: true },
        finalPrice: { type: Number, required: true },
        discount: { type: Number, min: 1, nax: 100 },
      },
    ],

    subPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    couponId: {
      type: Types.ObjectId,
      ref: "Coupon",
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["card", "cash"],
    },
    status: {
      type: String,

      enum: [
        "placed",
        "waitPayment",
        "delivered",
        "onWay",
        "cancelled",
        "rejected",
      ],
      default: "placed",
    },
  },
  { timestamps: true, versionKey: false }
);

const Order = model("Order", orderSchema);
export default Order;
