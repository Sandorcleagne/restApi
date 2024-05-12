import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { emailRegex } from "../utils/regex";
import userModel from "./user.model";
import { response } from "../utils/responseTemplate";
import { config } from "../config/config";
import jwt, { JwtPayload } from "jsonwebtoken";

interface CustomRequest extends Request {
  user?: any; // Define the type of the 'user' property if needed
}

// ------------- Generate access -----------------------
const generateAccessAndRefreshToken = async (
  userId: string,
  next: NextFunction
) => {
  try {
    const user = await userModel.findById(userId);
    const accessToken = await user?.generateAccesstoken();
    const refreshToken = await user?.generateRefreshToken();
    if (user) {
      user["refreshtoken"] = refreshToken || "";
    }
    await user?.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (e) {
    const error = createHttpError(
      500,
      "Something went wrong while generating token"
    );
    return next(error);
  }
};

// ------------- Register Web User -----------------------
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
  res.status(201).json(response("User registerd successfully", createdUser));
};

// ------------- Login Web User ---------------------------
export const loginWebUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  if (!(email || password)) {
    const error = createHttpError(400, "Email and password is required");
    return next(error);
  }
  const user = await userModel.findOne({ email: email });
  if (!user) {
    const error = createHttpError(400, "User does not exists");
    return next(error);
  }
  if (!user.active) {
    const error = createHttpError(400, "User not active for login.");
    return next(error);
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    const error = createHttpError(400, "Inavlid Credentiails");
    return next(error);
  }
  const token = await generateAccessAndRefreshToken(user._id, next);
  if (token) {
    const { accessToken, refreshToken } = token;
    const loggedInUser = await userModel
      .findById(user?._id)
      .select("-password -refreshtoken");
    const options = {
      httpOnly: true,
      secure: true,
    };
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        response("User logged in successfully", {
          userDetails: loggedInUser,
          accessToken,
          refreshToken,
        })
      );
  }
};

// ------------- Logout web user---------------------------
export const logoutWebUser = async (req: CustomRequest, res: Response) => {
  await userModel.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { refreshtoken: undefined },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(response("User Logged Out", {}));
};
// ------------- Refresh Accesstoken --------------------
export const refreshAccessToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const incomingRefreshToken =
      req?.cookies?.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      const error = createHttpError(400, "Unauthorized Request");
      return next(error);
    }
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      config?.REFRESH_TOKEN_SECRETE
    ) as JwtPayload;
    const user = await userModel
      .findById(decodedToken?._id)
      .select("+refreshtoken");
    if (!user) {
      const error = createHttpError(400, "Invalid Refresh Token");
      return next(error);
    }
    if (incomingRefreshToken !== user?.refreshtoken) {
      const error = createHttpError(400, "Refresh token is expired or used.");
      return next(error);
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const token = await generateAccessAndRefreshToken(user._id, next);
    if (token) {
      const { accessToken, refreshToken } = token;
      res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          response("Access token refreshed", {
            accessToken,
            refreshToken,
          })
        );
    }
  } catch (e) {
    const error = createHttpError(400, "Unable to refresh accesstoken.");
    return next(error);
  }
};
