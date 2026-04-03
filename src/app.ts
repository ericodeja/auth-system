import express, { urlencoded } from "express";
import type {Request, Response } from "express";
import errorHandler from "./middlewares/errorHandler";

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: false }));
app.use(errorHandler);

app.get("/", (req: Request, res: Response) => {
  return res.json("It works");
});

export default app;
