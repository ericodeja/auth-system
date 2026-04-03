import type { Request, Response, NextFunction } from "express";

type AppError = {
  status?: number;
  message?: string;
};

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;
