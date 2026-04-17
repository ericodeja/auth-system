import express from "express";
import validate from "../middlewares/validate.middleware";
import {
  registerSchema,
  loginSchema,
  refreshToken,
} from "../validations/auth.schema";
import authControllers from "../controllers/auth.controllers";
import mfaControllers from "../controllers/mfa.controllers";
import tokenControllers from "../controllers/token.controllers";
import { authLimiter } from "../middlewares/rateLimiter.middleware";
import authenticate from "../middlewares/authenticate.middleware";

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
  tokenControllers.sendEmailVerificationToken,
);

router.post(
  "/verify-email/:emailVerificationToken",
  authLimiter,
  tokenControllers.verifyEmailToken,
);

router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  authControllers.login,
);

router.post(
  "/refresh",
  authLimiter,
  authenticate,
  validate(refreshToken),
  tokenControllers.refreshToken,
);

router.get(
  "/getOtpAuthUrl",
  authLimiter,
  authenticate,
  mfaControllers.getOtpAuthUrl,
);

router.post("/enable-mfa", authLimiter, authenticate, mfaControllers.enableMfa);

router.post("/verify-mfa", authLimiter, authenticate, mfaControllers.verifyMfa);

export default router;
