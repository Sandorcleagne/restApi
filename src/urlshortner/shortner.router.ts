import express from "express";
import multer from "multer";
import path from "node:path";
import {
  createBulkShortUrls,
  createShortUrl,
  redirectShortUrl,
} from "./shortner.controller";
const shortnerRouter = express.Router();
const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  limits: { fileSize: 3e7 }, // 3e7 means 30mb in javascript
});
shortnerRouter.post("/create-short-url", createShortUrl);
shortnerRouter.post(
  "/create-bulk-short-urls",
  upload.single("file"),
  createBulkShortUrls
);
shortnerRouter.get("/:shortUrlId", redirectShortUrl);
export default shortnerRouter;
