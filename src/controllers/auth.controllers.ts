import type { Response, Request, NextFunction } from "express";
import AuthService from "../services/auth.services";
import type {
  SignupPayload,
  LoginPayload,
  CreateUserResponse,
  LoginResponse,
  mfaRequiredResponse,
} from "../types";

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
    const response: LoginResponse | mfaRequiredResponse =
      await AuthService.loginUser(
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

export default {
  register,
  login,
};
