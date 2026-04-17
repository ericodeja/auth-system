import type { Request, Response, NextFunction } from "express";
import HttpError from "../utils/http-error.utils";
import TokenUtils from "../utils/token.utils";
import config from "../config/config";
import UserUtils from "../utils/user.utils";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError(401, "Invalid Token");
    }
    const token = authHeader.split(" ")[1];
    if (!token) throw new HttpError(401, "Invalid Token");

    const payload = await TokenUtils.verifyJwtToken(
      token,
      config.accessTokenSecret,
      "accessToken",
    );

    const user = await UserUtils.getUser(payload.sub, ["email", "role"]);

    if (!user) throw new HttpError(404, "Invalid Token");

    req.user = {
      id: String(user._id),
      role: user.role,
    };

    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    next();
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(500, String(err));
  }
};

export default authenticate;
