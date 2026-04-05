import mongoose from "mongoose";
import config from "../config/config";
import logger from "../utils/logger.utils";

const uri = config.mongoUri;

export const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    logger.info("Successfully connected to MongoDB");
  } catch (err) {
    logger.error("MongoDB connection failed:", err);
    throw err;
  }
};
