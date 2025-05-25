import { NextFunction, Request, Response } from "express";
import { response } from "../utils/responseTemplate";
import createHttpError from "http-errors";
import { generateShortUrlId } from "../utils/generateUrlId";
import shortUrlModel from "./shortner.model";
import * as XLSX from "xlsx";
import { ExcelRow } from "./shortnerTypes";
export const createShortUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { originalUrl, customAlias = "" } = req.body;
    let finalCustomAlias = "";
    if (customAlias !== "") {
      const existingCustomAlias = await shortUrlModel.findOne({
        customAlias: customAlias,
      });
      if (existingCustomAlias) {
        const error = createHttpError(
          409,
          "Custom alias already exists. Please choose a different one."
        );
        return next(error);
      }
      finalCustomAlias = customAlias.endsWith("/")
        ? customAlias.slice(0, -1)
        : customAlias;
      console.log("finalCustomAlias", finalCustomAlias);
    }
    if (!originalUrl) {
      const error = createHttpError(400, "Original URL is required.");
      return next(error);
    }
    // Validate the original URL format
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?([\\w\\d-]+\\.)+[\\w\\d-]+(\\/.*)?$"
    );
    if (!urlPattern.test(originalUrl)) {
      const error = createHttpError(400, "Invalid URL format.");
      return next(error);
    }
    // Generate a short URL ID

    const shortid = generateShortUrlId();
    // Check if the short URL ID already exists
    const existingShortUrl = await shortUrlModel.findOne({
      shortUrlId: shortid,
    });
    if (existingShortUrl) {
      const error = createHttpError(
        409,
        "Short URL ID already exists. Please try again."
      );
      return next(error);
    }
    // Create a new short URL entry
    const newShortUrl = await shortUrlModel.create({
      originalUrl: originalUrl,
      shortUrlId: shortid,
      customAlias: customAlias,
      shortUrl:
        customAlias === ""
          ? `${req.protocol}://${req.get("host")}/api/v1/short/${shortid}`
          : `${finalCustomAlias}/api/v1/short/${shortid}`, // Assuming a base URL for the short link
    });
    // Return the short URL ID in the response
    if (!newShortUrl) {
      const error = createHttpError(500, "Failed to create short URL.");
      return next(error);
    }

    res.status(200).json(
      response("URL Shortened Successfully", {
        url:
          customAlias === ""
            ? `${req.protocol}://${req.get("host")}/api/v1/short/${shortid}`
            : `${finalCustomAlias}/api/v1/short/${shortid}`,
      })
    );
  } catch (e) {
    const error = createHttpError(500, "Something went wrong while uploading.");
    console.log(error?.message);
    return next(error);
  }
};

export const createBulkShortUrls = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { customAlias = "" } = req.body;
    const file = req.file as Express.Multer.File;
    if (!file || !file.path) {
      const error = createHttpError(400, "File is required.");
      return next(error);
    }
    const workbook = XLSX.readFile(file.path);
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      const error = createHttpError(400, "No sheets found in Excel file.");
      return next(error);
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      const error = createHttpError(400, "Worksheet is empty.");
      return next(error);
    }
    let finalCustomAlias = "";
    if (customAlias !== "") {
      const existingCustomAlias = await shortUrlModel.findOne({
        customAlias: customAlias,
      });
      if (existingCustomAlias) {
        const error = createHttpError(
          409,
          "Custom alias already exists. Please choose a different one."
        );
        return next(error);
      }
      finalCustomAlias = customAlias.endsWith("/")
        ? customAlias.slice(0, -1)
        : customAlias;
    }
    const urlList = [];
    const data = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);
    for (let i = 0; i < data.length; i++) {
      const shortid = generateShortUrlId();
      const existingShortUrl = await shortUrlModel.findOne({
        shortUrlId: shortid,
      });
      if (existingShortUrl) {
        const error = createHttpError(
          409,
          "Short URL ID already exists. Please try again."
        );
        return next(error);
      }
      const newShortUrl = await shortUrlModel.create({
        originalUrl: data[i]?.url,
        shortUrlId: shortid,
        customAlias: customAlias,
        shortUrl:
          customAlias === ""
            ? `${req.protocol}://${req.get("host")}/api/v1/short/${shortid}`
            : `${finalCustomAlias}/api/v1/short/${shortid}`, // Assuming a base URL for the short link
      });
      urlList[i] = newShortUrl?.shortUrl;
    }
    res.send(response("excel data", { data: urlList }));
  } catch (e) {
    console.log(e);
    const error = createHttpError(500, "Something went wrong while uploading.");
    console.log(error?.message);
    return next(error);
  }
};

export const redirectShortUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shortUrlId } = req.params;
    if (!shortUrlId) {
      const error = createHttpError(400, "Short URL ID is required.");
      return next(error);
    }
    // Find the short URL entry by ID
    const shortUrlEntry = await shortUrlModel.findOne({
      shortUrlId: shortUrlId,
      active: true,
    });
    if (!shortUrlEntry) {
      const error = createHttpError(404, "Short URL not found.");
      return next(error);
    }
    // Increment the click count
    shortUrlEntry.clicks += 1;
    await shortUrlEntry.save();
    // Redirect to the original URL
    res.redirect(shortUrlEntry.originalUrl);
  } catch (e) {
    const error = createHttpError(
      500,
      "Something went wrong while redirecting."
    );
    console.log(error?.message);
    return next(error);
  }
};
