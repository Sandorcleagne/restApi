import { NextFunction, Request, Response } from "express";
import bookModel from "./book.model";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import fs from "node:fs";
import { response } from "../utils/responseTemplate";
// import { getPublicIdFromUrl } from "../utils/coludinaryUtils";

// ----------------------- create-book-controller-crm -----------------
export const createBookCrm = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, genre, author, description } = req.body;

    const files = req?.files as { [fieldname: string]: Express.Multer.File[] }; // to configure the file object for typescript
    if (
      [title, genre, author, description].some((fields) => fields.trim() === "")
    ) {
      const error = createHttpError(400, "All Feilds are required");
      return next(error);
    }

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
    const newBook = await bookModel.create({
      title: title,
      genre: genre,
      author: author,
      coverImage: uploadResult?.secure_url,
      file: uploadBookResult?.secure_url,
      description: description,
    });
    await fs.promises.unlink(filePath);
    await fs.promises.unlink(bookfilePath);
    res
      .status(201)
      .json(response("Book Uploaded successfully", { id: newBook?._id }));
  } catch (e) {
    const error = createHttpError(500, "Something went wrong while uploading.");
    console.log(e);
    return next(error);
  }
};
// ------------------------ update-book-controller-crm -----------------
export const updateBookCrmGenInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bookId = req?.params?.bookId;
  const { title, genre, author } = req.body;
  if (!bookId) {
    const error = createHttpError(400, "Please provide bookId");
    return next(error);
  }
  if (
    [title, genre, author].some((feild) => feild?.trim() === "")
    //the above code check if the value of the feilds are empty string even after trim using some() method for all the elements in array
  ) {
    const error = createHttpError(400, "All Feilds are required");
    return next(error);
  }
  if (!title || !genre || !author) {
    const error = createHttpError(400, "All Feilds are required");
    return next(error);
  }
  const getBookToBeUpdated = await bookModel.findById(bookId);
  if (getBookToBeUpdated) {
    const updatedBook = await bookModel.findOneAndUpdate(
      { _id: bookId },
      { title: title, genre: genre, author: author },
      { new: true, runValidators: true }
    );
    if (!updatedBook) {
      const error = createHttpError(400, "Book Not Found");
      return next(error);
    }
    res
      .status(201)
      .json(
        response("books updated successfully", { updatedBook: updatedBook })
      );
  } else {
    const error = createHttpError(400, "Book Not Found");
    return next(error);
  }
};
// ------------------------ get-all-books ----------------------------
export const getAllBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt((req.query.page as string) || "1"); // Default to page 1 if not provided
    const limit = parseInt((req.query.limit as string) || "10"); // Default to 10 items per page
    const totalBooks = await bookModel.countDocuments(); // Get total number of books
    const totalPages = Math.ceil(totalBooks / limit); // Calculate total pages

    // Correct usage of skip and limit in the query
    const books = await bookModel
      .find({})
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(); // Execute the query

    // Reverse the books array if necessary
    const reversedBooks = books.reverse();

    // Calculate next and previous pages
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    if (reversedBooks.length > 0) {
      res.status(200).json(
        response("Books found successfully", {
          books: reversedBooks,
          pagination: {
            totalBooks, // Total number of books
            totalPages, // Total number of pages
            currentPage: page, // Current page number
            nextPage, // Next page (or null if no next page)
            prevPage, // Previous page (or null if no previous page)
            booksPerPage: limit, // Number of books per page (limit)
          },
        })
      );
    } else {
      res
        .status(200)
        .json(response("No books available", { books: [], pagination: {} }));
    }
  } catch (e) {
    const error = createHttpError(500, "Error while getting books");
    return next(error);
  }
};
// ------------------------ get-book-by-id ---------------------------
export const getBookById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookId = req.params?.bookId;
    if (!bookId) {
      const error = createHttpError(400, "Please provide book id");
      return next(error);
    }
    const book = await bookModel.findById(bookId);
    if (!book) {
      const error = createHttpError(404, "Book not found");
      return next(error);
    } else {
      res.status(200).json(response("book found successfully", { book: book }));
    }
  } catch (e) {
    const error = createHttpError(500, "Error While getting book");
    return next(error);
  }
};
export const deactivateBookById = async () => {};
