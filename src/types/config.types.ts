export type Config = {
  port: number;
  baseUrl: string;
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
  maxFailedAttempts: number;
  lockDurationMs: number;
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;

};
