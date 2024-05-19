import { NextFunction, Request, Response } from "express";
import bookModel from "./book.model";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";

export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req?.files as { [fieldname: string]: Express.Multer.File[] }; // to configure the file object for typescript
    const coverImageMimeType = files?.coverImage[0]?.mimetype.split("/").at(-1);
    const fileName = files?.coverImage[0]?.filename;
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      fileName
    );
    const bookFileMimeType = files?.file[0]?.mimetype.split("/").at(-1);
    const bookFileName = files?.file[0]?.filename;
    const bookfilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFileName
    );

    const uploadResult = await cloudinary?.uploader?.upload(filePath, {
      filename_override: fileName,
      folder: "book-covers",
      format: coverImageMimeType,
    });
    const uploadBookResult = await cloudinary?.uploader?.upload(bookfilePath, {
      resource_type: "raw",
      filename_override: bookFileName,
      folder: "book-pdfs",
      format: bookFileMimeType,
    });
    res.send("hello api...");
  } catch (e) {
    const error = createHttpError(500, "Something went wrong while uploading.");
    return next(error);
  }
};
