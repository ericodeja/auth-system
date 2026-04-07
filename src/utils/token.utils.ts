import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import config from "../config/config";
import type { JwtPayload } from "jsonwebtoken";
import Token from "../models/token.model";
import User from "../models/user.model";
import HttpError from "./http-error.utils";
import logger from "./logger.utils";
import AccountLockUtils from "./accountLock.utils";

class TokenUtils {
  async generateEmailVerificationToken(
    userId: Types.ObjectId | string,
    email: string,
  ): Promise<string> {
    try {
      const emailVerificationToken = jwt.sign(
        { userId, email, purpose: "email-verification" },
        config.emailVerificationSecret,
        { expiresIn: config.emailVerificationExpiry as any },
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
    } catch (err) {
      logger.error(`Generate emailVerificationToken failed: ${err}`);
      throw new HttpError(500, String(err));
    }
  }

  async verifyJwtToken(
    token: string,
    secretKey: string,
    tokenPurpose: string,
  ): Promise<JwtPayload> {
    try {
      return jwt.verify(token, secretKey) as JwtPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        const decoded = jwt.decode(token) as JwtPayload;
        if (decoded) {
          await Token.updateOne(
            {
              userId: decoded.userId,
              purpose: `${tokenPurpose}`,
              token,
            },
            { isValid: false },
          );
        }
        throw new HttpError(401, "Session expired.");
      }

      throw new HttpError(401, "Invalid token.");
    }
  }

  generateAccessToken(userId: Types.ObjectId | string): string {
    try {
      const accessToken = jwt.sign(
        { userId, purpose: "accessToken" },
        config.accessTokenSecret,
        { expiresIn: config.accessTokenExpiry as any },
      );
      return accessToken;
    } catch (err) {
      logger.error(`generateAccessToken failed: ${err}`);
      throw new HttpError(500, String(err));
    }
  }

  async generateRefreshToken(userId: Types.ObjectId | string): Promise<string> {
    try {
      await Token.updateMany(
        {
          userId: userId,
          purpose: "refreshToken",
        },
        { isValid: false },
      );

      const refreshToken = jwt.sign(
        { userId, purpose: "refreshToken" },
        config.refreshTokenSecret,
        { expiresIn: config.refreshTokenExpiry as any },
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
    } catch (err) {
      logger.error(`generateRefreshToken failed: ${err}`);
      throw new HttpError(500, String(err));
    }
  }
}

export default new TokenUtils();
