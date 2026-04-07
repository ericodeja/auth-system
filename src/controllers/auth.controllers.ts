import type { Response, Request, NextFunction } from "express";
import AuthService from "../services/auth.services";
import type {
  SignupPayload,
  LoginPayload,
  CreateUserResponse,
  EmailVerificationResponse,
  LoginResponse,
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
      createEmailResponse,
      data: {
        unverifiedUser,
      },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password }: LoginPayload = req.body;
    const response: LoginResponse = await AuthService.loginUser(
      email,
      password,
      req.ip,
      req.headers["user-agent"],
    );
    res.status(200).json({
      success: true,
      message: "User successfully authenticated",
      data: {
        response,
      },
    });
  } catch (err) {
    next(err);
  }
};

const sendEmailVerificationToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return next(new HttpError(400, "Missing User ID"));
    }

    await AuthService.sendEmailVerificationToken(id);
    res.status(200).json({
      success: true,
      message: "Email Verification sent successfully",
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

const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { oldRefreshToken }: { oldRefreshToken: string } = req.body;

    const newTokens = await AuthService.refreshToken(oldRefreshToken);
    res.status(201).json({
      sucess: true,
      data: {
        newTokens,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default {
  register,
  login,
  sendEmailVerificationToken,
  verifyEmail,
  refreshToken,
};
