import express, { Request, Response } from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/user.router";
import cookieParser from "cookie-parser";
import bookRouter from "./book/book.router";
import CRMUserRouter from "./crmusers/crmusers.router";
import cors from "cors";
import shortnerRouter from "./urlshortner/shortner.router";
const app = express();
app.use(cookieParser());
app.use(express.json({ limit: "40kb" }));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.urlencoded({ extended: true, limit: "40kb" }));
app.use(express.static("public"));
app.get(
  "/api/v1/",
  // verifyJWT,
  (req: Request, res: Response) => {
    res.json({ message: "This is an API" });
  }
);

// routes

app.use("/api/v1/users", userRouter);
app.use("/api/v1/books", bookRouter);
app.use("/api/v1/crmuser", CRMUserRouter);
app.use("/api/v1/short", shortnerRouter);
// Global Error Handler

app.use(globalErrorHandler);

export default app;
