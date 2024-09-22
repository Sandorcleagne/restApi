import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { emailRegex } from "../utils/regex";
import { response } from "../utils/responseTemplate";
import jwt, { JwtPayload } from "jsonwebtoken";
import crmuserModel from "./crmuser.model";
import { CustomRequest } from "../other.types";
import { config } from "../config/config";
import { options } from "../constant";
const generateAccessAndRefreshToken = async (
  userId: string,
  next: NextFunction
) => {
  try {
    const user = await crmuserModel.findById(userId);
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

export const registerCRMUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userName, password, email, role } = req.body;
  if (
    [userName, password, email, role].some((field) => field?.trim() === "") ||
    !userName ||
    !password ||
    !email ||
    !role
  ) {
    const error = createHttpError(400, "All Feilds are required");
    return next(error);
  }
  if (!emailRegex.test(email)) {
    const error = createHttpError(400, "Please enter valid email");
    return next(error);
  }
  //   const userEmail = await crmuserModel.findOne({ email: email }); we are not taking different email from every user for this time.
  const username = await crmuserModel.findOne({ userName: userName });
  //   if (userEmail) {
  //     const error = createHttpError(
  //       400,
  //       "Email already exist please try different email"
  //     );
  //     return next(error);
  //   }
  if (username) {
    const error = createHttpError(
      400,
      "Username already exist please try different username"
    );
    return next(error);
  }
  const Crmuser = await crmuserModel.create({
    userName,
    email,
    password,
    role,
  });
  const createdUser = await crmuserModel
    .findById(Crmuser?._id)
    .select("-password -refreshtoken");
  if (!createdUser) {
    const error = createHttpError(500, "Something went wrong please try again");
    return next(error);
  }
  res.status(201).json(response("User registerd successfully", createdUser));
};

export const loginCRMUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, userName, password } = req.body;
  if (!(email || userName)) {
    const error = createHttpError(400, "Email or Username  is required");
    return next(error);
  }
  const user = await crmuserModel.findOne({ $or: [{ userName }, { email }] });
  if (!user) {
    const error = createHttpError(400, "User does not exists");
    return next(error);
  }
  const isPasswordValid = await user?.isPasswordCorrect(password);
  if (!isPasswordValid) {
    const error = createHttpError(401, "Invalid user credentials");
    return next(error);
  }
  const token = await generateAccessAndRefreshToken(user?._id, next);
  if (token) {
    const { accessToken, refreshToken } = token;
    const loggedInUser = await crmuserModel
      .findById(user?._id)
      .select("-password -refreshtoken");

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

export const logoutCRMUser = async (req: CustomRequest, res: Response) => {
  crmuserModel.findByIdAndUpdate(
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

export const refreshAccessToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const incomingRefreshToken =
      req?.cookies?.refreshToken || req.body?.refreshToken;
    console.log("incomingRefreshToken", incomingRefreshToken);
    if (!incomingRefreshToken) {
      const error = createHttpError(401, "Unauthorized Request++");
      return next(error);
    }
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      config?.REFRESH_TOKEN_SECRETE
    ) as JwtPayload;
    const user = await crmuserModel
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
    console.log("error", e);
    const error = createHttpError(401, "Unable to refresh accesstoken.");
    return next(error);
  }
};
