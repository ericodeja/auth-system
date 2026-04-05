import type { Response, Request, NextFunction } from "express";
import AuthService from "../services/auth.services";
import type {
  SignupPayload,
  CreateUserResponse,
  EmailVerificationResponse,
} from "../types";
import HttpError from "../utils/http-error.utils";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      agreedToTerms,
    }: SignupPayload = req.body;

    const { unverifiedUser, createEmailResponse }: CreateUserResponse =
      await AuthService.createUser(
        firstName,
        lastName,
        email,
        phone,
        password,
        role,
        agreedToTerms,
      );
    res.status(200).json({
      success: true,
      message: "User successfully created",
      emailResponse: createEmailResponse,
      data: {
        unverifiedUser,
      },
    });
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { emailVerificationToken } = req.params;
    if (!emailVerificationToken || typeof emailVerificationToken !== "string") {
      return next(new HttpError(400, "Missing verification token"));
    }
    const response: EmailVerificationResponse = await AuthService.verifyEmail(
      emailVerificationToken,
    );
    res.status(201).json({
      success: true,
      message: "Email successfully verified",
      data: {
        response,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default { register, verifyEmail };
