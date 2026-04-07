import Joi from "joi";

const registerSchema = Joi.object({
  lastName: Joi.string().alphanum().min(3).max(30).required(),
  firstName: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .lowercase()
    .required(),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/[A-Z]/, "uppercase") // at least one uppercase letter
    .pattern(/[a-z]/, "lowercase") // at least one lowercase letter
    .pattern(/[0-9]/, "number") // at least one digit
    .pattern(/[!@#$%^&*(),.?":{}|<>]/, "special character") // at least one special char
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password must not exceed 128 characters",
      "string.pattern.name": "Password must contain at least one {#name}",
      "any.required": "Password is required",
    }),
  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords do not match" }),
  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required(),
  role: Joi.string().valid("admin", "user").required(),
  agreedToTerms: Joi.boolean().valid(true).required().messages({
    "any.only": "You must agree to the terms of service",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().required().max(128),
});

const refreshToken = Joi.object({
  oldRefreshToken: Joi.string().required(),
});

export { registerSchema, loginSchema, refreshToken };
