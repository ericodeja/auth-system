import type { Request, Response, NextFunction } from "express";
import MultiFactorAuth from "../services/mfa.services";

const getOtpAuthUrl = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id: string = req.user!.id;

    const otpAuthUrl = await MultiFactorAuth.getOtpAuthUrl(id);

    res.status(200).json({
      success: true,
      data: {
        otpAuthUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};

const enableMfa = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id: string = req.user!.id;
    const token: string = req.body.token;
    await MultiFactorAuth.enableMFA(id, token);
    res.status(200).json({
      success: true,
      message: "MFA successfully enabled",
    });
  } catch (err) {
    next(err);
  }
};

const verifyMfa = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id: string = req.user!.id;
    const token: string = req.body.token;
    const response = await MultiFactorAuth.verifyToken(
      id,
      token,
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
  getOtpAuthUrl,
  enableMfa,
  verifyMfa,
};
