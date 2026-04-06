import { Schema, model } from "mongoose";

const TokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  token: { type: String, required: true },
  purpose: { type: String, enum: ["email-verification", 'refreshToken'], required: true },
  isValid: { type: Boolean, default: true },
  iat: { type: Number, required: true },
  exp: { type: Number, required: true },
});

TokenSchema.index({ userId: 1, purpose: 1 });

const Token = model('Token', TokenSchema)
export default Token