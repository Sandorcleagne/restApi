import express from "express";
import {
  createBookCrm,
  deactivateBookById,
  getAllBooks,
  getBookById,
  updateBookCrmGenInfo,
} from "./book.controller";
import multer from "multer";
import path from "node:path";
import { verifyJWTCRM } from "../middlewares/auth.middleware";

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
  createBookCrm
);
bookRouter.patch("/update-book-gen-info/:bookId", updateBookCrmGenInfo);
bookRouter.get("/get-all-books/:limit", verifyJWTCRM, getAllBooks);
bookRouter.get("/get-book-by-id/:bookId", getBookById);
bookRouter.patch("/activate-deactivate-book/:bookId", deactivateBookById);
export default bookRouter;
