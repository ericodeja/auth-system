import mongoose from "mongoose";
import config from "../config/config";

const uri = config.mongoUri;

export const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Successfully connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    throw err;
  }
};
