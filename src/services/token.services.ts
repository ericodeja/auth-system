import User from "../models/user.model";
import HttpError from "../utils/http-error.utils";
import TokenUtils from "../utils/token.utils";
import UserUtils from "../utils/user.utils";
import SendEmail from "../utils/email.utils";
import logger from "../utils/logger.utils";
import config from "../config/config";
import Token from "../models/token.model";
import AccountLockUtils from "../utils/accountLock.utils";
import type { EmailVerificationResponse } from "../types";
import type { Types } from "mongoose";

export default class TokenServices {
  static async sendEmailVerificationToken(id: Types.ObjectId | string) {
    try {
      const user = await UserUtils.getUser(String(id), ["email"]);

      const emailVerificationToken: string =
        await TokenUtils.generateEmailVerificationToken(id);

      SendEmail.sendEmailVerificationMail(
        user.email,
        emailVerificationToken,
      ).catch((err) => {
        logger.error("Background email dispatch failed:", err);
      });
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, String(err));
    }
  }
  static async verifyEmailToken(
    emailVerificationToken: string,
  ): Promise<EmailVerificationResponse> {
    try {
      const payload = await TokenUtils.verifyJwtToken(
        emailVerificationToken,
        config.emailVerificationSecret,
        "email-verification",
      );

      const existingToken = await Token.findOne({
        userId: payload.sub,
        purpose: "email-verification",
      }).lean();

      if (!existingToken || !existingToken.isValid) {
        throw new HttpError(
          404,
          "EmailVerificationToken does not exist or has already been used",
        );
      }
      const [verifiedUser] = await Promise.all([
        User.findByIdAndUpdate(
          payload.sub,
          { isVerified: true },
          {
            returnDocument: "after",
            select: "_id email role isVerified",
            lean: true,
          },
        ),
        Token.updateMany(
          { userId: payload.sub, purpose: "email-verification" },
          { isValid: false },
        ),
      ]);

      if (!verifiedUser) {
        throw new HttpError(404, "User not found");
      }

      return {
        verifiedUser: {
          id: verifiedUser._id,
          email: verifiedUser.email,
          role: verifiedUser.role,
          isVerified: verifiedUser.isVerified,
        },
      };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, String(err));
    }
  }
  static async refreshToken(
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = await TokenUtils.verifyJwtToken(
        oldRefreshToken,
        config.refreshTokenSecret,
        "refreshToken",
      );

      if (!payload.sub) {
        throw new HttpError(401, "Invalid token.");
      }

      const existingToken = await Token.findOne({
        userId: payload.sub,
        purpose: "refreshToken",
        token: oldRefreshToken,
      });

      if (!existingToken || !existingToken.isValid) {
        await Token.deleteMany({ userId: payload.sub });
        await AccountLockUtils.lockAccount(
          payload.sub,
          "INVALID REFRESH TOKEN",
        );
        logger.error(
          `Suspicious activity or token reuse detected for userId: ${payload.sub}. All sessions terminated.`,
        );
        throw new HttpError(403, "Invalid refresh token. Please login again.");
      }

      const accessToken = TokenUtils.generateAccessToken(payload.sub);
      const refreshToken = await TokenUtils.generateRefreshToken(payload.sub);

      await existingToken.updateOne({ isValid: false });
      return { accessToken, refreshToken };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, String(err));
    }
  }
}
