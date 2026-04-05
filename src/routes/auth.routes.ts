import express from "express";
import validate from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../validations/auth.schema";
import authControllers from "../controllers/auth.controllers";
import {
  authLimiter,
  passwordResetLimiter,
} from "../middlewares/rateLimiter.middleware";

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authControllers.register,
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

export default router;
