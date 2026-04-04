import PasswordUtils from "../utils/password.utils";
import User from "../models/user.model";
import TokenUtils from "../utils/token.utils";
import { sendEmailVerificationMail } from "../utils/email.utils";
import type { CreateUserResponse } from "../types";

class UserService {
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
        const error: any = new Error(`A user with this email already exists.`);
        error.status = 400;
        throw error;
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
        TokenUtils.generateEmailVerificationToken(userId, email);

      // Send email in the background so it doesn't block the response (fire-and-forget)
      sendEmailVerificationMail(email, emailVerificationToken).catch((err) => {
        console.error("Background email dispatch failed:", err);
      });

      //Background tasks saves result and frontend polls once after signup
      PasswordUtils.isPasswordBreached(password)
        .then(async ({ breach, count }) => {
          await User.findByIdAndUpdate(unverifiedUser._id, {
            passwordBreached: breach && count > 99,
          });
        })
        .catch((err) => {
          console.error(`Breach check failed: ${err}`);
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
      throw err instanceof Error ? err : new Error(String(err));
    }
  }
}

export default new UserService();
