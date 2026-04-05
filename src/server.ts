import app from "./app";
import config from "./config/config";
import { connectDB } from "./db/mongodb";
import mongoose from "mongoose";
import type { Application } from "express";
import logger from "./utils/logger.utils";
const port = config.port;

async function startServer(app: Application, port: number) {
  try {
    await connectDB();
    const server = app.listen(port, "127.0.0.1", () => {
      logger.info(`Server running at http://localhost:${port}`);
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

startServer(app, port);
