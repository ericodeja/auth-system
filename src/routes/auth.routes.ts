import express from "express";
import validate from "../middlewares/validate";
import userSchema from "../validations/userSchema";
import authControllers from "../controllers/auth.controllers";

const router = express.Router();

router.post("/", validate(userSchema), authControllers.register);

router.post(
  "/verify-email/:emailVerificationToken",
  authControllers.verifyEmail,
);

export default router;
