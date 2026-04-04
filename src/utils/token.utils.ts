import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import config from "../config/config";

const EMAIL_VERIFICATION_SECRET = config.emailVerificationSecret;
if (!EMAIL_VERIFICATION_SECRET) {
  throw new Error("Missing EMAIL_VERIFICATION_SECRET");
}

const EMAIL_VERIFICATION_EXPIRY = config.emailVerificationExpiry;

class TokenUtils {
  generateEmailVerificationToken(userId: Types.ObjectId | string, email: string): string {
    return jwt.sign(
      { userId, email, purpose: "email-verification" },
      EMAIL_VERIFICATION_SECRET,
      { expiresIn: EMAIL_VERIFICATION_EXPIRY as any }
    );
  }
}

export default new TokenUtils();
