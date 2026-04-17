import PasswordUtils from "../utils/password.utils";
import User from "../models/user.model";
import TokenUtils from "../utils/token.utils";
import SendEmail from "../utils/email.utils";
import type {
  CreateUserResponse,
  LoginResponse,
  mfaRequiredResponse,
} from "../types";
import HttpError from "../utils/http-error.utils";
import AccountLockUtils from "../utils/accountLock.utils";
import logger from "../utils/logger.utils";
import UserUtils from "../utils/user.utils";

export default class AuthService {
  static async createUser(
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    role: string,
    agreedToTerms: boolean,
  ): Promise<CreateUserResponse> {
    try {
      // Early check for duplicate mail to save time
      const existingUser = await User.findOne({
        email,
      });
      if (existingUser) {
        throw new HttpError(400, "A user with this email already exists"); //This error message gives away info
      }

      const hashedPassword = await PasswordUtils.hashPassword(password);

      //Save unverified user
      const unverifiedUser = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        role,
        agreedToTerms,
      });

      //Generate Email Verification Token
      const emailVerificationToken: string =
        await TokenUtils.generateEmailVerificationToken(unverifiedUser._id);

      // Send email in the background so it doesn't block the response (fire-and-forget)
      SendEmail.sendEmailVerificationMail(email, emailVerificationToken).catch(
        (err) => {
          logger.error("Background email dispatch failed:", err);
        },
      );

      //Background tasks saves result and frontend polls once after signup
      PasswordUtils.isPasswordBreached(password)
        .then(async ({ breach, count }) => {
          await User.findByIdAndUpdate(unverifiedUser._id, {
            isPasswordBreached: breach && count > 99,
          });
        })
        .catch((err) => {
          logger.error(`Breach check failed: ${err}`);
        });

      return {
        unverifiedUser: {
          id: unverifiedUser._id,
          email: unverifiedUser.email,
          firstName: unverifiedUser.firstName,
          lastName: unverifiedUser.lastName,
          role: unverifiedUser.role,
        },
        createEmailResponse: "Email dispatched",
      };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, String(err));
    }
  }

  static async loginUser(
    email: string,
    password: string,
    ip?: string,
    userAgent?: string,
  ): Promise<LoginResponse | mfaRequiredResponse> {
    try {
      const user = await UserUtils.getUser(email, [
        "email",
        "role",
        "password",
        "mfaEnabled",
        "isLocked",
        "lockUntil",
        "failedLoginAttempts",
      ]);


      const { isLocked, lockUntil } = await AccountLockUtils.isAccountLocked(
        user._id,
      );

      if (isLocked)
        throw new HttpError(
          423,
          `Account is locked. Try again at ${lockUntil?.toLocaleTimeString()}.`,
        );

      const isMatch = await PasswordUtils.comparePassword(
        password,
        user.password,
      );

      if (!isMatch) {
        await AccountLockUtils.handleFailedAttempt(user._id);
        throw new HttpError(401, "Invalid email or password");
      }

      await AccountLockUtils.resetFailedLogins(user._id);

      const isMfaEnabled = user.mfaEnabled;

      if (isMfaEnabled) {
        const preAuthToken: string = TokenUtils.generateAccessToken(user._id);
        logger.info({
          event: "MFA_VERIFICATION",
          userId: user._id,
          email: user.email,
          ip,
          userAgent,
          timestamp: new Date().toISOString(),
        });

        return {
          mfaRequired: user.mfaEnabled,
          data: { id: user._id, preAuthToken: preAuthToken },
        };
      }

      const accessToken: string = TokenUtils.generateAccessToken(user._id);
      const refreshToken: string = await TokenUtils.generateRefreshToken(
        user._id,
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
