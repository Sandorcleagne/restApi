import { NextFunction, Request, Response } from "express";
import bookModel from "./book.model";

export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.send("hello api...");
};
