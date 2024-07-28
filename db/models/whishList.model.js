import { Schema, Types, model } from "mongoose";

const whishSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        type: Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

const WhishList = model("WhishList", whishSchema);

export default WhishList;
