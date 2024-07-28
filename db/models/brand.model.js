import { Schema, Types, model } from "mongoose";

const brandSchema = new Schema(
  {
    name: {
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
    customId: String,

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      public_id: String,
      secure_url: String,
    },
  },
  { timestamps: true, versionKey: false }
);

const Brand = model("Brand", brandSchema);
export default Brand;
