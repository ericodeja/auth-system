import User from "../models/user.model";
import config from "../config/config";
import HttpError from "./http-error.utils";
import logger from "./logger.utils";
import Token from "../models/token.model";
import { Types } from "mongoose";

class AccountLockUtils {
  static handleFailedAttempt = async (
    userId: Types.ObjectId | string,
  ): Promise<void> => {
    const user = await User.findById(userId);
    if (!user) return;

    const newAttempts = user.failedLoginAttempts + 1;

    if (newAttempts >= config.maxFailedAttempts) {
      await User.findByIdAndUpdate(userId, {
        failedLoginAttempts: newAttempts,
        isLocked: true,
        lockUntil: new Date(Date.now() + config.lockDurationMs),
      });

      logger.warn({
        event: "ACCOUNT_LOCKED",
        userId,
        reason: "Too many failed login attempts",
        lockUntil: new Date(Date.now() + config.lockDurationMs),
        timestamp: new Date().toISOString(),
      });
      throw new HttpError(423, "Too many failed login attempts");
    } else {
      await User.findByIdAndUpdate(userId, {
        failedLoginAttempts: newAttempts,
      });
    }
  };

  static resetFailedLogins = async (
    userId: Types.ObjectId | string,
  ): Promise<void> => {
    await User.findByIdAndUpdate(userId, {
      failedLoginAttempts: 0,
      isLocked: false,
      lockUntil: null,
    });
  };

  static isAccountLocked = async (
    userId: Types.ObjectId | string,
  ): Promise<{ isLocked: boolean; lockUntil: Date | null }> => {
    const user = await User.findById(userId).select("isLocked lockUntil");
    if (!user) return { isLocked: false, lockUntil: null };

    // check if lock has expired
    if (user.isLocked && user.lockUntil && user.lockUntil < new Date()) {
      await User.findByIdAndUpdate(userId, {
        isLocked: false,
        lockUntil: null,
        failedLoginAttempts: 0,
      });
      return { isLocked: false, lockUntil: null };
    }

    return { isLocked: user.isLocked, lockUntil: user.lockUntil ?? null };
  };

  static lockAccount = async (userId: Types.ObjectId | string, lockReason: string) => {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      await User.findByIdAndUpdate(userId, {
        isLocked: true,
        lockUntil: new Date(Date.now() + config.lockDurationMs),
      });

      await Token.deleteMany({ userId });

      logger.warn({
        event: "ACCOUNT_LOCKED",
        userId,
        reason: lockReason,
        lockUntil: new Date(Date.now() + config.lockDurationMs),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, String(err));
    }
  };

  static unlockAccount = async (userId: Types.ObjectId | string) => {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      await User.findByIdAndUpdate(userId, {
        isLocked: false,
        lockUntil: null,
      });

      await Token.deleteMany({ userId });

      logger.info({
        event: "ACCOUNT_UNLOCKED",
        userId,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, String(err));
    }
  };
}

export default AccountLockUtils