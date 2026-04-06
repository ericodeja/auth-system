import PasswordUtils from "../utils/password.utils";
import User from "../models/user.model";
import Token from "../models/token.model";
import TokenUtils from "../utils/token.utils";
import type { JwtPayload } from "jsonwebtoken";
import { sendEmailVerificationMail } from "../utils/email.utils";
import type {
  CreateUserResponse,
  EmailVerificationResponse,
  LoginResponse,
} from "../types";
import HttpError from "../utils/http-error.utils";
import AccountLockUtils from "../utils/accountLock.utils";
import logger from "../utils/logger.utils";

class AuthService {
  async createUser(
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
        throw new HttpError(400, "A user with this email already exists");
      }

      const hashedPassword = await PasswordUtils.hashPassword(password);

      //Save unverified user
      const unverifiedUser = new User({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        role,
        agreedToTerms,
      });

      await unverifiedUser.save();

      //Generate Email Verification Token
      const userId: string = unverifiedUser._id.toString();
      const emailVerificationToken: string =
        await TokenUtils.generateEmailVerificationToken(userId, email);

      // Send email in the background so it doesn't block the response (fire-and-forget)
      sendEmailVerificationMail(email, emailVerificationToken).catch((err) => {
        logger.error("Background email dispatch failed:", err);
      });

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
          _id: unverifiedUser._id,
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

  async loginUser(
    email: string,
    password: string,
    ip?: string,
    userAgent?: string,
  ): Promise<LoginResponse> {
    try {
      const user = await User.findOne({ email })
        .select("email role password isLocked lockUntil failedLoginAttempts ")
        .lean();

      if (!user) throw new HttpError(401, "Invalid email or password.");

      const { isLocked, lockUntil } = await AccountLockUtils.isAccountLocked(
        user._id.toString(),
      );

      if (isLocked)
        throw new HttpError(
          423,
          `Account is locked due to too many failed attempts. Try again at ${lockUntil?.toLocaleTimeString()}.`,
        );

      const isMatch = await PasswordUtils.comparePassword(
        password,
        user.password,
      );

      if (!isMatch) {
        await AccountLockUtils.handleFailedLogin(user._id.toString());
        throw new HttpError(401, "Invalid email or password");
      }

      await AccountLockUtils.resetFailedLogins(user._id.toString());

      /* 
       Add MFA
      */

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
          _id: user._id,
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

  async sendEmailVerificationToken(id: string) {
    try {
      const user = await User.findById(id).select("email").lean();
      if (!user) {
        throw new HttpError(404, "User does not exist ");
      }

      const emailVerificationToken: string =
        await TokenUtils.generateEmailVerificationToken(id, user.email);

      sendEmailVerificationMail(user.email, emailVerificationToken).catch((err) => {
        logger.error("Background email dispatch failed:", err);
      });
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, String(err));
    }
  }

  async verifyEmail(
    emailVerificationToken: string,
  ): Promise<EmailVerificationResponse> {
    try {
      let payload: JwtPayload;
      try {
        payload = TokenUtils.verifyEmail(emailVerificationToken);
      } catch {
        throw new HttpError(
          401,
          "Verification token is invalid or has expired",
        );
      }

      const existingToken = await Token.findOne({
        userId: payload.userId,
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
          payload.userId,
          { isVerified: true },
          {
            returnDocument: "after",
            select: "_id email role isVerified",
            lean: true,
          },
        ),
        Token.updateMany(
          { userId: payload.userId, purpose: "email-verification" },
          { isValid: false },
        ),
      ]);

      if (!verifiedUser) {
        throw new HttpError(404, "User not found");
      }

      return {
        verifiedUser: {
          _id: verifiedUser._id,
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
}

export default new AuthService();
