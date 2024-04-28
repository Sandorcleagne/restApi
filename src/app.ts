import express, { NextFunction, Request, Response } from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/user.router";
const app = express();
app.use(express.json({ limit: "40kb" }));
app.get("/api/v1/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "This is an API" });
});

// routes

app.use("/api/v1/users", userRouter);

// Global Error Handler

app.use(globalErrorHandler);

export default app;
