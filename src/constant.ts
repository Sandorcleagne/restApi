import { config } from "./config/config";
import { CookieOptions } from "express";

export const DB_Name = "e-lib";
export const options: CookieOptions = {
  httpOnly: config?.env === "production" ? true : false,
  secure: config?.env === "production",
  sameSite: "lax",
  path: "/",
};
