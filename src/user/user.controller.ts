import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { emailRegex } from "../utils/regex";
import userModel from "./user..model";
import { response } from "../utils/responseTemplate";

export const registerWebUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // validation
  const { name, email, password } = req.body;
  if (
    [name, email, password].some((feild) => feild?.trim() === "")
    //the above code check if the value of the feilds are empty string even after trim using some() method for all the elements in array
  ) {
    const error = createHttpError(400, "All Feilds are required");
    return next(error);
  }
  if (!name || !password || !email) {
    const error = createHttpError(400, "All Feilds are required");
    return next(error);
  }
  if (!emailRegex.test(email)) {
    const error = createHttpError(400, "Please enter valid email");
    return next(error);
  }
  const userEmail = await userModel.findOne({ email: email });
  if (userEmail) {
    const error = createHttpError(
      400,
      "Email already exist please try different email"
    );
    return next(error);
  }
  const user = await userModel.create({
    name,
    email,
    password,
  });
  const createdUser = await userModel
    .findById(user?.id)
    .select("-password -refreshtoken");
  if (!createdUser) {
    const error = createHttpError(500, "Something went wrong please try again");
    return next(error);
  }
  response("User registerd successfully", createdUser, 200, res);
};
