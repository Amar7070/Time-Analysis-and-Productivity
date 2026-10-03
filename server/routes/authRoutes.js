import express from "express";
import { login, signup, googleLogin } from "../controllers/Register.js";
import {
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../controllers/forgotPasswordController.js";
import validate from "../middleware/validate.js";
import {
  signupSchema,
  loginSchema,
  googleLoginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";
import { authLimiter, passwordResetLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/signup", authLimiter, validate(signupSchema), signup);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/google-login", authLimiter, validate(googleLoginSchema), googleLogin);

router.post("/forgot-password", passwordResetLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/verify-otp", passwordResetLimiter, validate(verifyOtpSchema), verifyOtp);
router.post("/reset-password", passwordResetLimiter, validate(resetPasswordSchema), resetPassword);

export default router;
