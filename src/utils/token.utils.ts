import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import config from "../config/config";
import type { JwtPayload } from "jsonwebtoken";
import Token from "../models/token.model";

const EMAIL_VERIFICATION_SECRET = config.emailVerificationSecret;

const EMAIL_VERIFICATION_EXPIRY = config.emailVerificationExpiry;

class TokenUtils {
  async generateEmailVerificationToken(
    userId: Types.ObjectId | string,
    email: string,
  ): Promise<string> {
    const emailVerificationToken = jwt.sign(
      { userId, email, purpose: "email-verification" },
      EMAIL_VERIFICATION_SECRET,
      { expiresIn: EMAIL_VERIFICATION_EXPIRY as any },
    );

  
    const decoded = jwt.decode(emailVerificationToken) as JwtPayload;

    const newToken = new Token({
      userId,
      token: emailVerificationToken,
      purpose: "email-verification",
      iat: decoded.iat,
      exp: decoded.exp,
    });
    await newToken.save();

    return emailVerificationToken;
  }

  verifyEmail(emailVerificationToken: string): JwtPayload {
    try {
      return jwt.verify(emailVerificationToken, EMAIL_VERIFICATION_SECRET) as JwtPayload;
    } catch (err) {
      throw new Error(`JwtError: ${String(err)}`);
    }
  }
}

export default new TokenUtils();
