import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
    required: true,
  },
  agreedToTerms: { type: Boolean, required: true },
  isVerified: { type: Boolean, default: false },
  isPasswordBreached: {
    type: Boolean,
    default: false,
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
  mfaSecret: {
    type: String,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
});

const User = model("User", UserSchema);
export default User;
