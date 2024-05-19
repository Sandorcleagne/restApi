import express from "express";
import { createBook } from "./book.controller";
import multer from "multer";
import path from "node:path";

const bookRouter = express.Router();
const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  limits: { fileSize: 3e7 }, // 3e7 means 30mb in javascript
});
bookRouter.post(
  "/create-book",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook
);
export default bookRouter;
