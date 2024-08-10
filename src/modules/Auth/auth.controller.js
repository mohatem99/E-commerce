import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../../db/models/user.model.js";
import { asyncHandller } from "../../middlewares/errorHandling.js";
import ApiError from "../../utils/errorClass.js";
import { sendMail } from "../../services/sendEmail.service.js";
import { customAlphabet } from "nanoid";

export const signUp = asyncHandller(async (req, res, next) => {
  const { email, name, address, password, age, phone } = req.body;
  const userExist = await User.findOne({ email: email.toLowerCase() });

  if (userExist) {
    return next(new ApiError("user already exists", 409));
  }
  const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);

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
      expiresIn: "5s",
    }
  );

  const confirmationLink = `${req.protocol}://${req.headers.host}/auth/confirm-email/${token}`;

  const rfToken = jwt.sign(
    {
      _id: userInstance._id,
    },
    process.env.RFTOKEN,
    {
      expiresIn: process.env.VERFIY_TOKEN_EXPIRES,
    }
  );

  const rfTokenLink = `${req.protocol}://${req.headers.host}/auth/refresh-token/${rfToken}`;
  try {
    await sendMail({
      to: userInstance.email,
      subject: "Welcome to our app",

      htmlMessage: ` Hello, welcome to our appthe link valid for 5 minutes. <br/> <a href="${confirmationLink}">Click here to confirm your email</a>
      
      
       <a href="${rfTokenLink}">Click here to resend your token</a>`,
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
  if (!user.confirmed) {
    return next(new ApiError("Account not confirmed", 401));
  }

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
  const { token } = req.params;
  const { _id } = jwt.verify(token, process.env.VERFIY_TOKEN);

  // find and update user   from db
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

export const refreshToken = asyncHandller(async (req, res, next) => {
  const { rfToken } = req.params;
  const { _id } = jwt.verify(rfToken, process.env.RFTOKEN);

  // find and update user   from db
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

export const forpgetPassword = asyncHandller(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return next(new ApiError(`No User for this email${email}`, 404));
  }

  let code = customAlphabet("0123456789", 5);
  let otp = code();

  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  user.otp = otp;
  await user.save();

  try {
    await sendMail({
      to: email,
      subject: "Code to reset password",

      htmlMessage: `<h1>Your code is ${otp}</h1>`,
    });
  } catch (err) {
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    user.passwordResetVerified = false;
    user.otp = otp;
    await user.save();
    return next(new ApiError("there is error in sending mail", 500));
  }

  res.status(200).json({
    status: "success",
    message: "Reset code sent to email",
  });
});

export const resetPassword = asyncHandller(async (req, res, next) => {
  const { email, password, otp } = req.body;
  const user = await User.findOne({
    email: email,
    otp: otp,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError(`No User `, 404));
  }

  if (user.otp != otp) {
    return next(new ApiError("invalid code", 400));
  }
  const hash = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);
  user.passwordResetVerified = undefined;
  user.password = hash;
  user.passwordResetExpires = undefined;

  user.otp = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();
  res.status(200).json({
    status: "success",
  });
});
