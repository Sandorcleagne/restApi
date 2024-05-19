import express, { NextFunction, Request, Response } from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/user.router";
import cookieParser from "cookie-parser";
import { verifyJWT } from "./middlewares/auth.middleware";
import bookRouter from "./book/book.router";
const app = express();
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ extended: true, limit: "40kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.get(
  "/api/v1/",
  verifyJWT,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "This is an API" });
  }
);

// routes

app.use("/api/v1/users", userRouter);
app.use("/api/v1/books", bookRouter);

// Global Error Handler

app.use(globalErrorHandler);

export default app;
