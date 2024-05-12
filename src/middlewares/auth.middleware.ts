import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config/config";
import userModel from "../user/user.model";
interface CustomRequest extends Request {
  user?: any; // Define the type of the 'user' property if needed
}

export const verifyJWT = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req?.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      const error = createHttpError(401, "Uauthorized request");
      return next(error);
    }
    const decodedToken = jwt.verify(
      token,
      config?.ACCESS_TOKEN_SECRETE
    ) as JwtPayload;
    const user = await userModel
      .findById(decodedToken?._id)
      .select("-password -refreshtoken");
    if (!user) {
      const error = createHttpError(401, "Invalid accesstoken");
      return next(error);
    }
    req.user = user;
    next();
  } catch (e) {
    const error = createHttpError(401, "Invalid accesstoken");
    return next(error);
  }
};
