import dotenv from "dotenv";

dotenv.config();

type Config = {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  saltRounds: number;
  emailVerificationSecret: string;
  emailVerificationExpiry: string;
  resendApiKey: string;
  resendDomain: string;
};

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "developement",
  mongoUri: process.env.MONGODB_URI || "",
  saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  emailVerificationSecret: process.env.EMAIL_VERIFICATION_SECRET || "",
  emailVerificationExpiry: process.env.EMAIL_VERIFICATION_EXPIRY || '15m',
  resendApiKey: process.env.RESEND_API_KEY || "",
  resendDomain: process.env.RESEND_DOMAIN || "",
};

export default config;
