import type { Request, Response, NextFunction } from "express";
import HttpError from "../utils/http-error.utils";
import TokenService from "../services/token.services";
import type { EmailVerificationResponse } from "../types";

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

    await TokenService.sendEmailVerificationToken(id);
    res.status(200).json({
      success: true,
      message: "Email Verification sent successfully",
    });
  } catch (err) {
    next(err);
  }
};

const verifyEmailToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { emailVerificationToken } = req.params;
    if (!emailVerificationToken || typeof emailVerificationToken !== "string") {
      return next(new HttpError(400, "Missing verification token"));
    }
    const response: EmailVerificationResponse =
      await TokenService.verifyEmailToken(emailVerificationToken);
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

    const newTokens = await TokenService.refreshToken(oldRefreshToken);
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
  sendEmailVerificationToken,
  verifyEmailToken,
  refreshToken,
};
