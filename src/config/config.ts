import { config as conf } from "dotenv";
conf();
const _config = {
  port: process.env.PORT,
  database_URI: process.env.DATABASE_URI,
  env: process.env.NODE_ENV,
  ACCESS_TOKEN_SECRETE: process.env.ACCESS_TOKEN_SECRETE || "",
  REFRESH_TOKEN_SECRETE: process.env.REFRESH_TOKEN_SECRETE || "",
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "",
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "",
};

export const config = Object.freeze(_config);
