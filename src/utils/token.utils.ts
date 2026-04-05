import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import config from "../config/config";
import type { JwtPayload } from "jsonwebtoken";
import Token from "../models/token.model";

const EMAIL_VERIFICATION_SECRET = config.emailVerificationSecret;
const ACCESS_TOKEN_SECRET = config.accessToken;
const REFRESH_TOKEN_SECRET = config.refreshToken;

class TokenUtils {
  async generateEmailVerificationToken(
    userId: Types.ObjectId | string,
    email: string,
  ): Promise<string> {
    const emailVerificationToken = jwt.sign(
      { userId, email, purpose: "email-verification" },
      EMAIL_VERIFICATION_SECRET,
      { expiresIn: "30m" },
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
      return jwt.verify(
        emailVerificationToken,
        EMAIL_VERIFICATION_SECRET,
      ) as JwtPayload;
    } catch (err) {
      throw new Error(`JwtError: ${String(err)}`);
    }
  }

  generateAccessToken(userId: Types.ObjectId | string): string {
    const accessToken = jwt.sign(
      { userId, purpose: "accessToken" },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    return accessToken;
  }
  async generateRefreshToken(userId: Types.ObjectId | string): Promise<string> {
    const refreshToken = jwt.sign(
      { userId, purpose: "accessToken" },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" },
    );
    const decoded = jwt.decode(refreshToken) as JwtPayload;

    const newToken = new Token({
      userId,
      token: refreshToken,
      purpose: "refreshToken",
      iat: decoded.iat,
      exp: decoded.exp,
    });
    await newToken.save();

    return refreshToken;
  }
}

export default new TokenUtils();
