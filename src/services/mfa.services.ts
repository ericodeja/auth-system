import User from "../models/user.model";
import HttpError from "../utils/http-error.utils";
import MFAUtils from "../utils/mfa.utils";
import TokenUtils from "../utils/token.utils";
import UserUtils from "../utils/user.utils";
import logger from "../utils/logger.utils";
import type { LoginResponse } from "../types";
import type { Types } from "mongoose";
import AccountLockUtils from "../utils/accountLock.utils";

export default class MultiFactorAuth {
  static async getOtpAuthUrl(id: Types.ObjectId | string) {
    try {
      const user = await UserUtils.getUser(String(id), [
        "email",
        "mfaEnabled",
        "mfaSecret",
      ]);

      if (user.mfaEnabled) {
        throw new HttpError(409, "MFA already enabled");
      }

      const tempSecret = MFAUtils.generateSecret(user.email);
      const otpAuthUrl = await MFAUtils.getOtpAuthUrl(tempSecret);

      await User.updateOne({ _id: id }, { mfaSecret: tempSecret.base32 });

      return otpAuthUrl;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, String(err));
    }
  }

  static async verifyMfaToken(id: Types.ObjectId | string, token: string) {
    const user = await UserUtils.getUser(String(id), [
      "email",
      "role",
      "mfaEnabled",
      "mfaSecret",
    ]);

    if (!user.mfaSecret) {
      throw new HttpError(401, "MFA not enabled");
    }

    const isTokenValid = MFAUtils.verifyToken(user.mfaSecret, token);

    if (!isTokenValid) {
      await AccountLockUtils.handleFailedAttempt(id);
      throw new HttpError(401, "Invalid Token");
    }

    return user;
  }

  static async enableMFA(id: Types.ObjectId | string, token: string) {
    try {
      await MultiFactorAuth.verifyMfaToken(id, token);
      await User.updateOne({ _id: id }, { mfaEnabled: true });
    } catch (err) {
      await User.updateOne({ _id: id }, { mfaSecret: "" });
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, String(err));
    }
  }

  static async verifyToken(
    id: Types.ObjectId | string,
    token: string,
    ip?: string,
    userAgent?: string,
  ): Promise<LoginResponse> {
    try {
      const user = await MultiFactorAuth.verifyMfaToken(id, token);
      await AccountLockUtils.resetFailedLogins(id);

      const accessToken: string = TokenUtils.generateAccessToken(
        user._id.toString(),
      );
      const refreshToken: string = await TokenUtils.generateRefreshToken(
        user._id.toString(),
      );

      logger.info({
        event: "LOGIN_SUCCESS",
        userId: user._id,
        email: user.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, String(err));
    }
  }
}
