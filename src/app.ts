import express, { urlencoded } from "express";
import type { Request, Response } from "express";
import errorHandler from "./middlewares/errorHandler.middleware";
import authRouters from "./routes/auth.routes";
import { generalLimiter } from "./middlewares/rateLimiter.middleware";

const app = express();

app.use(generalLimiter);
app.use(express.json());
app.use(urlencoded({ extended: false }));

app.use("/auth/", authRouters);

app.get("/", (req: Request, res: Response) => {
  return res.json("It works");
});

app.use(errorHandler);

export default app;
