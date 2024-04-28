import { config as conf } from "dotenv";
conf();
const _config = {
  port: process.env.PORT,
  database_URI: process.env.DATABASE_URI,
  env: process.env.NODE_ENV,
};

export const config = Object.freeze(_config);
