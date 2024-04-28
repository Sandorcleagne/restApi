import express, { NextFunction, Request, Response } from "express";
import { registerWebUser } from "./user.controller";

const userRouter = express.Router();

userRouter.post("/register", registerWebUser);

export default userRouter;
