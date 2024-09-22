import express from "express";
import {
  loginCRMUser,
  logoutCRMUser,
  refreshAccessToken,
  registerCRMUser,
} from "./crmuser.controller";
import { verifyJWTCRM } from "../middlewares/auth.middleware";

const CRMUserRouter = express.Router();
CRMUserRouter.post("/register-crm-user", registerCRMUser);
CRMUserRouter.post("/login-crm-user", loginCRMUser);
CRMUserRouter.post("/refreshaccesstoken-crm", refreshAccessToken);
// Secured Routes
CRMUserRouter.post("/logout-crm-user", verifyJWTCRM, logoutCRMUser);

export default CRMUserRouter;
