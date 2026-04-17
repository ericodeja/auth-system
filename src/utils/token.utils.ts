import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import Token from "../models/token.model";
import HttpError from "./http-error.utils";
import logger from "./logger.utils";
import config from "../config/config";
import type { Types } from "mongoose";

class TokenUtils {
  static async verifyJwtToken(
    token: string,
    secretKey: string,
    tokenPurpose: string,
  ): Promise<JwtPayload & { sub: string }> {
    try {
      const payload = jwt.verify(token, secretKey) as JwtPayload;
      if (!payload.sub) {
        throw new HttpError(401, "Invalid Token");
      }
      return payload as JwtPayload & { sub: string };
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        const decoded = jwt.decode(token) as JwtPayload;

        if (decoded && decoded.purpose !== "accessToken") {
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

  static generateToken(
    id: Types.ObjectId | string,
    purpose: string,
    secret: string,
    tokenExpiry: any,
  ): string {
    try {
      const token = jwt.sign({ sub: id, purpose }, secret, {
        expiresIn: tokenExpiry,
      });
      return token;
    } catch (err) {
      logger.error(`generateToken failed: ${err}`);
      throw new HttpError(500, String(err));
    }
  }

  static generateAccessToken(userId: Types.ObjectId | string): string {
    return this.generateToken(
      userId,
      "accessToken",
      config.accessTokenSecret,
      config.accessTokenExpiry,
    );
  }

  static async generateRefreshToken(
    userId: Types.ObjectId | string,
  ): Promise<string> {
    const token = this.generateToken(
      userId.toString(),
      "refreshToken",
      config.refreshTokenSecret,
      config.refreshTokenExpiry,
    );

    const decoded = jwt.decode(token) as JwtPayload;

    await Token.create({
      userId,
      token,
      purpose: "refreshToken",
      iat: decoded.iat as number,
      exp: decoded.exp as number,
    });

    return token;
  }

  static async generateEmailVerificationToken(
    userId: Types.ObjectId | string,
  ): Promise<string> {
    const token = this.generateToken(
      userId.toString(),
      "email-verification",
      config.emailVerificationSecret,
      config.emailVerificationExpiry,
    );

    const decoded = jwt.decode(token) as JwtPayload;

    await Token.create({
      userId,
      token,
      purpose: "email-verification",
      iat: decoded.iat as number,
      exp: decoded.exp as number,
    });

    return token;
  }
}

export default TokenUtils;
