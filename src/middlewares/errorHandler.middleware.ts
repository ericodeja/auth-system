import type { Request, Response, NextFunction } from "express";
import HttpError from "../utils/http-error.utils";
import logger from "../utils/logger.utils";

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err);

  if (err instanceof HttpError) {
    res.status(err.status).json({
      success: false,
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

export default errorHandler;
