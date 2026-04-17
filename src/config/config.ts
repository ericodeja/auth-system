import dotenv from "dotenv";
import type { Config } from "../types";

dotenv.config();

if (!process.env.MONGODB_URI) throw new Error("Missing env var: MONGODB_URI");
if (!process.env.EMAIL_VERIFICATION_SECRET)
  throw new Error("Missing env var: EMAIL_VERIFICATION_SECRET");
if (!process.env.RESEND_API_KEY)
  throw new Error("Missing env var: RESEND_API_KEY");
if (!process.env.RESEND_DOMAIN)
  throw new Error("Missing env var: RESEND_DOMAIN");
if (!process.env.ACCESS_TOKEN_SECRET)
  throw new Error("Missing env var: ACCESS_TOKEN_SECRET");
if (!process.env.REFRESH_TOKEN_SECRET)
  throw new Error("Missing env var: REFRESH_TOKEN_SECRET");
if (!process.env.MFA_ENCRYPTION_SECRET)
  throw new Error("Missing env var: MFA_ENCRYPTION_SECRET");
if (!process.env.IV_BYTES) throw new Error("Missing env var: IV_BYTES");

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  baseUrl: `http://localhost:${process.env.PORT}`,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI,
  saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  emailVerificationSecret: process.env.EMAIL_VERIFICATION_SECRET,
  emailVerificationExpiry: process.env.EMAIL_VERIFICATION_EXPIRY || "15m",
  resendApiKey: process.env.RESEND_API_KEY,
  resendDomain: process.env.RESEND_DOMAIN,
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  passwordRateLimitWindowMs:
    Number(process.env.PASSWORD_RATE_LIMIT_WINDOW_MS) || 3600000,
  passwordRateLimitMax: Number(process.env.PASSWORD_RATE_LIMIT_MAX) || 5,
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  generalRateLimitMax: Number(process.env.GENERAL_RATE_LIMIT_MAX) || 100,
  maxFailedAttempts: Number(process.env.MAX_FAILED_ATTEMPTS) || 5,
  lockDurationMs: Number(process.env.LOCK_DURATION_MS) || 1800000,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || "",
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "",
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  mfaEncryptionSecret: process.env.MFA_ENCRYPTION_SECRET,
  ivBytes: Number(process.env.IV_BYTES),
};

export default config;
