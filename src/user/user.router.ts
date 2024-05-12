import express from "express";
import {
  loginWebUser,
  logoutWebUser,
  registerWebUser,
} from "./user.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const userRouter = express.Router();
userRouter.post("/register", registerWebUser);
userRouter.post("/login-web-user", loginWebUser);
userRouter.post("/logout-web-user", verifyJWT, logoutWebUser);
export default userRouter;
