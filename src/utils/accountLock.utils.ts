import User from "../models/user.model";
import config from "../config/config";
import HttpError from "./http-error.utils";
import logger from "./logger.utils";

const MAX_FAILED_ATTEMPTS = config.maxFailedAttempts;
const LOCK_DURATION_MS = config.lockDurationMs;

class AccountLockUtils {
  handleFailedLogin = async (userId: string): Promise<void> => {
    const user = await User.findById(userId);
    if (!user) return;

    const newAttempts = user.failedLoginAttempts + 1;

    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      await User.findByIdAndUpdate(userId, {
        failedLoginAttempts: newAttempts,
        isLocked: true,
        lockUntil: new Date(Date.now() + LOCK_DURATION_MS),
      });

      logger.warn({
        event: "ACCOUNT_LOCKED",
        userId,
        reason: "Too many failed login attempts",
        lockUntil: new Date(Date.now() + LOCK_DURATION_MS),
        timestamp: new Date().toISOString(),
      });
      throw new HttpError(423, "Too many failed login attempts");
    } else {
      await User.findByIdAndUpdate(userId, {
        failedLoginAttempts: newAttempts,
      });
    }
  };

  resetFailedLogins = async (userId: string): Promise<void> => {
    await User.findByIdAndUpdate(userId, {
      failedLoginAttempts: 0,
      isLocked: false,
      lockUntil: null,
    });
  };

  isAccountLocked = async (
    userId: string,
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
}

export default new AccountLockUtils();
