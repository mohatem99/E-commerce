import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      minLength: 3,
      maxLength: 30,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "passwrod is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "age is required"],
    },
    phone: [String],
    address: [String],

    confirmed: {
      type: Boolean,
      default: false,
    },

    loggedIn: {
      type: Boolean,
      default: false,
    },
    otp: String,
    passwordChangedAt: Date,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    passwordChangedAt: Date,
  },
  { timestamps: true, versionKey: false }
);

const User = model("User", userSchema);
export default User;
