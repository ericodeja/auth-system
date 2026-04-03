import app from "./app";
import config from "./config/config";
import { connectDB } from "./db/mongodb";
import mongoose from "mongoose";
import type { Application } from "express";

const port = config.port;

async function startServer(app: Application, port: number) {
  try {
    await connectDB();
    const server = app.listen(port, "127.0.0.1", () => {
      console.log(`Server running at http://localhost:${port}`);
    });

    process.on("SIGTERM", async () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      });
    });

    process.on("SIGINT", async () => {
      console.log("SIGINT received, shutting down gracefully");
      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer(app, port);
