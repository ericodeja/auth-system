import rateLimit from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";
import config from "../config/config";
import HttpError from "../utils/http-error.utils";
import logger from "../utils/logger.utils";

const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.generalRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    const trustedIPs = ["127.0.0.1", "::1"]; // localhost
    return trustedIPs.includes(req.ip ?? "");
  },
  handler: (req: Request, res: Response, next: NextFunction) => {
    logger.warn({
      event: "RATE_LIMIT_EXCEEDED",
      ip: req.ip,
      route: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString(),
    });
    next(new HttpError(429, "Too many requests, please try again later."));
  },
});

const authLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    const trustedIPs = ["127.0.0.1", "::1"]; // localhost
    return trustedIPs.includes(req.ip ?? "");
  },
  handler: (req: Request, res: Response, next: NextFunction) => {
    logger.warn({
      event: "RATE_LIMIT_EXCEEDED",
      ip: req.ip,
      route: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString(),
    });
    next(
      new HttpError(429, "Too many attempts, please try again in 15 minutes."),
    );
  },
});

const passwordResetLimiter = rateLimit({
  windowMs: config.passwordRateLimitWindowMs,
  max: config.passwordRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    const trustedIPs = ["127.0.0.1", "::1"]; // localhost
    return trustedIPs.includes(req.ip ?? "");
  },
  handler: (req: Request, res: Response, next: NextFunction) => {
    logger.warn({
      event: "RATE_LIMIT_EXCEEDED",
      ip: req.ip,
      route: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString(),
    });
    next(
      new HttpError(
        429,
        "Too many password reset attempts, please try again in an hour.",
      ),
    );
  },
});

export { generalLimiter, authLimiter, passwordResetLimiter };
