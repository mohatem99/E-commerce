import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../../db/models/user.model.js";
import { asyncHandller } from "../../middlewares/errorHandling.js";
import ApiError from "../../utils/errorClass.js";
import { sendMail } from "../../services/sendEmail.service.js";

export const signUp = asyncHandller(async (req, res, next) => {
  const { email, name, address, password, cPassword, age, phone } = req.body;
  const userExist = await User.findOne({ email: email.toLowerCase() });
  console.log(password);
  if (userExist) {
    return next(new ApiError("user already exists", 409));
  }
  const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);
  console.log(hashedPassword);
  const userInstance = new User({
    email,
    password: hashedPassword,
    name,
    address,
    age,
    phone,
  });

  // generate token

  const token = jwt.sign(
    {
      _id: userInstance._id,
    },
    process.env.VERFIY_TOKEN,
    {
      expiresIn: process.env.VERFIY_TOKEN_EXPIRES,
    }
  );

  const confirmationLink = `${req.protocol}://${req.headers.host}/auth/confirm-email/${token}`;
  try {
    await sendMail({
      to: userInstance.email,
      subject: "Welcome to our app",

      htmlMessage: ` Hello, welcome to our appthe link valid for 5 minutes. <br/> <a href="${confirmationLink}">Click here to confirm your email</a>`,
    });
  } catch (err) {
    return next(new ApiError("There is an error while sending email", 500));
  }

  await userInstance.save();

  res.status(201).json({
    status: "success",
    message: "Signup successfully done",
  });
});

export const signIn = asyncHandller(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return next(new ApiError("incorrect email or password", 401));
  }

  const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRES,
  });

  user.loggedIn = true;
  await user.save();
  res.status(200).json({
    status: "success",
    user,
    token,
  });
});

export const confirmEmail = asyncHandller(async (req, res, next) => {
  const token = req.params;
  const { _id } = jwt.verify(token, process.env.VERFIY_TOKEN);

  // find and update user from db
  const user = await User.findOneAndUpdate(
    { _id, confirmed: false },
    { confirmed: true },
    { new: true }
  );

  // if user not found
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // response
  res.status(200).json({ message: "Email confirmed" });
});
