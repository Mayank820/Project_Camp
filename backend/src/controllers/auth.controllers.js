import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  sendMail,
  emailVerifictaionContent,
  passwordResetContent,
} from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// We can use try...catch block instead of asyncHandler
const registerUser = asyncHandler(async (req, res) => {
  //  get data
  const { email, username, password, fullname } = req.body;
  console.log("Incoming Body: ", req.body);

  // Check if user already exist
  const existinguser = await User.findOne({ email });
  if (existinguser) {
    throw new ApiError(400, "Email already in use");
  }

  // Create new user
  const user = await User.create({ username, email, password, fullname });

  // generate verification token
  const { hashedToken, unHashedToken, tokenExpiry } =
    user.generateTemporaryToken(); // generateTemporaryToken() comes from user.models.js

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  // verification url
  const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${unHashedToken}`;

  // send verifictaion email
  await sendMail({
    email: user.email,
    subject: "Verify your email",
    mailGenContent: emailVerifictaionContent(user.username, verificationUrl),
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, {}, "User registered, Please verify your email"),
    );
});

// verifying email
const verifyEmail = asyncHandler(async (req, res) => {
  // get data
  const { token } = req.query;
  // hashing the token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Token invalid or expired");
  }

  // changing the values at database
  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpiry = null;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email Verified Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // get data from body
  const { email, password } = req.body;
  // finding user
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(404, "User not found");
  // console.log(user);

  // isPasswordCorrect() comes from user.models.js
  // it compares the password
  // const isValid = isPasswordCorrect(password);
  // if (!isValid) throw new ApiError(400, "Invalid Password");
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }
  if (!user.isEmailVerified) throw new ApiError(403, "Email is not verified");

  // generateAccessToken() and generateRefreshToken() comes from user.models.js
  const accessToken = user.generateAccessToken();
  const refreshtoken = user.generateRefreshToken();

  user.refreshToken = refreshtoken;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken,
        refreshtoken,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          fullname: user.fullname,
        },
      },
      "Login Successful",
    ),
  );
});

const logOutUser = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(200, "User not found");

  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const resendVerifyEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email already verified");
  }

  const { hashedToken, unHashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${unHashedToken}`;

  await sendMail({
    email: user.email,
    subject: "Verify your email",
    mailGenContent: emailVerifictaionContent(user.username, verificationUrl),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Verification email resent"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, "Refresh token missing");

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const newAccessToken = user.generateAccessToken();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accessToken: newAccessToken },
          "Token refreshed",
        ),
      );
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const { hashedToken, unHashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.BASE_URL}/reset-password?token=${unHashedToken}`;

  await sendMail({
    email: user.email,
    subject: "Reset your password",
    mailGenContent: passwordResetContent(user.username, resetUrl),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Reset password link sent to your email"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    throw new ApiError(400, "Token and new password are required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "Invalid or expired token");

  user.password = newPassword;
  user.forgotPasswordToken = null;
  user.forgotPasswordExpiry = null;
  await user.save(); // Will hash the password due to pre-save hook

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, { user }));
});

export {
  registerUser,
  loginUser,
  logOutUser,
  verifyEmail,
  resendVerifyEmail,
  refreshAccessToken,
  getProfile,
  forgotPasswordRequest,
  changeCurrentPassword,
};
