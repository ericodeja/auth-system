import app from "./app";
import config from "./config/config";
import { connectDB } from "./db/mongodb";
import mongoose from "mongoose";
import type { Application } from "express";
import logger from "./utils/logger.utils";
const PORT = config.port;

async function startServer(app: Application, PORT: number) {
  try {
    await connectDB();
    const server = app.listen(PORT, "127.0.0.1", () => {
      logger.info(`Server running at ${config.baseUrl}`);
    });

    process.on("SIGTERM", async () => {
      logger.info("SIGTERM received, shutting down gracefully");
      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      });
    });

    process.on("SIGINT", async () => {
      logger.info("SIGINT received, shutting down gracefully");
      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      });
    });
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer(app, PORT);
