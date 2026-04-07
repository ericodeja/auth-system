import express from "express";
import validate from "../middlewares/validate.middleware";
import {
  registerSchema,
  loginSchema,
  refreshToken,
} from "../validations/auth.schema";
import authControllers from "../controllers/auth.controllers";
import { authLimiter } from "../middlewares/rateLimiter.middleware";

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authControllers.register,
);

router.post(
  "/resend-email-verification-token/:id",
  authLimiter,
  authControllers.sendEmailVerificationToken,
);

router.post(
  "/verify-email/:emailVerificationToken",
  authLimiter,
  authControllers.verifyEmail,
);

router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  authControllers.login,
);

router.post(
  "/refresh",
  validate(refreshToken),
  authLimiter,
  authControllers.refreshToken,
);

export default router;
