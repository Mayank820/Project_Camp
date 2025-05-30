import { Router } from "express";
import {
  registerUser,
  loginUser,
  logOutUser,
  verifyEmail,
  resendVerifyEmail,
  refreshAccessToken,
  getProfile,
  forgotPasswordRequest,
  changeCurrentPassword,
} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { userRegistrationValidator, userLoginValidator } from "../validators/index.js";
import { verifyAccessToken } from "../middlewares/auth.middlewares.js";

const router = Router();

// userRegistrationValidator(): - it is running forcefully to return the array for validation
// validate: - it is a middleware, if the userRegistrationValidator() dosen't give error then it goes to next (registerUser), else there's an error it stopped to validator.middlewares

// Public routes
router.post("/register", userRegistrationValidator(), validate, registerUser);
router.get("/verify-email", verifyEmail);
router.post("/login", userLoginValidator(), validate, loginUser);
router.post("/resend-verification", resendVerifyEmail);
router.post("/forgot-password", forgotPasswordRequest);
router.post("/change-password", changeCurrentPassword);
router.post("/refresh-token", refreshAccessToken);
router.get("/logout", logOutUser);

// Protected Routes
router.get("/me", verifyAccessToken, getProfile);

export default router;
