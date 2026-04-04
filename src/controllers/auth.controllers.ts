import type { Response, Request, NextFunction } from "express";
import UserService from "../services/user.services";
import type { SignupPayload, CreateUserResponse } from "../types";

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
      await UserService.createUser(
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

const login = (req: Request, res: Response, next: NextFunction) => {};

export default { register, login };
