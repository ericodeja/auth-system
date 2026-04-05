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
    _id: Types.ObjectId | string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  createEmailResponse: string;
};

export type EmailVerificationResponse = {
  verifiedUser: {
    _id: Types.ObjectId | string;
    email: string;
    role: string;
    isVerified: Boolean;
  };
};
