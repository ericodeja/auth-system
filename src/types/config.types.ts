export type Config = {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  saltRounds: number;
  emailVerificationSecret: string;
  emailVerificationExpiry: string;
  resendApiKey: string;
  resendDomain: string;
  rateLimitWindowMs: number;
  passwordRateLimitWindowMs: number;
  passwordRateLimitMax: number;
  authRateLimitMax: number;
  generalRateLimitMax: number;
};
