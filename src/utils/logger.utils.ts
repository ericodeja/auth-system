import winston from "winston";
import config from "../config/config";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let msg = typeof message === "object" ? JSON.stringify(message) : message;

  const metaString = Object.keys(meta).length ? JSON.stringify(meta) : "";

  return `[${timestamp}] ${level}: ${stack || msg || metaString}`;
});

const exactLevelFilter = (targetLevel: string) => {
  return winston.format((info) => {
    if (info.level === targetLevel) {
      return info;
    }
    return false;
  })();
};

const logger = winston.createLogger({
  level: config.nodeEnv === "production" ? "warn" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat,
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),

    
    new winston.transports.File({
      filename: "logs/info.log",
      level: "info",
      format: combine(
        exactLevelFilter("info"),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        logFormat,
      ),
    }),

    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: combine(
        exactLevelFilter("error"),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        logFormat,
      ),
    }),

    new winston.transports.File({
      filename: "logs/warn.log",
      level: "warn",
      format: combine(
        exactLevelFilter("warn"),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        logFormat,
      ),
    }),
  ],
});

export default logger;

// logger.debug("Detailed debug info");    // development only
// logger.info("Server started on 3000");  // general info
// logger.warn("Rate limit hit");          // something to watch
// logger.error("DB connection failed");   // something broke
