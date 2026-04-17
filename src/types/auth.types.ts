import { Types } from "mongoose";

export type SignupPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  agreedToTerms: boolean;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type CreateUserResponse = {
  unverifiedUser: {
    id: Types.ObjectId | string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  createEmailResponse: string;
};

export type EmailVerificationResponse = {
  verifiedUser: {
    id: Types.ObjectId | string;
    email: string;
    role: string;
    isVerified: Boolean;
  };
};

export type LoginResponse = {
  user: {
    id: Types.ObjectId | string;
    email: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

export type mfaRequiredResponse = {
  mfaRequired: boolean;
  data: {
    id: Types.ObjectId | string;
    preAuthToken: string;
  };
};
