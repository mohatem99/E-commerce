import { Schema, Types, model } from "mongoose";

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "name is required"],
      mixLength: 3,
      maxLength: 30,
      trim: true,
      lowercase: true,
      unique: true,
    },
    slug: {
      type: String,

      mixLength: 3,
      maxLength: 30,
      trim: true,
      unique: true,
    },
    description: {
      type: String,

      mixLength: 3,

      trim: true,
    },
    customId: String,

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    subCategory: {
      type: Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    image: {
      public_id: String,
      secure_url: String,
    },
    coverImages: [
      {
        public_id: String,
        secure_url: String,
      },
    ],

    price: {
      type: Number,
      required: true,
    },

    discount: { type: Number, min: 1, nax: 100 },
    subPrice: {
      type: Number,
    },
    stock: {
      type: Number,
      default: 1,
      required: true,
    },
    rateAvg: { type: Number, default: 0 },
    rateNum: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

const Product = model("Product", productSchema);
export default Product;
