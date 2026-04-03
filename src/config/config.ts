import dotenv from "dotenv";

dotenv.config();

type Config = {
  port: number;
  nodeEnv: string;
  mongoUri: string;
};

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "developement",
  mongoUri: process.env.MONGODB_URI || "",
};

export default config;
